import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Radio,
  Sliders,
  FastForward,
  Rewind,
  Loader2,
  Headphones,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { soundManager } from '../../services/audioSynthesizer';
import { useUserLearning } from '../../context/UserLearningContext';

interface EraAudioNarratorProps {
  eraTitle: string;
  timeframe: string;
  overviewText: string;
  heroExcerpt?: string;
}

type VoiceEngine = 'gemini' | 'webspeech';
type GeminiVoice = 'Fenrir' | 'Kore' | 'Zephyr' | 'Puck' | 'Charon';

export const EraAudioNarrator: React.FC<EraAudioNarratorProps> = ({
  eraTitle,
  timeframe,
  overviewText,
  heroExcerpt,
}) => {
  const { isOnline } = useUserLearning();

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [voiceEngine, setVoiceEngine] = useState<VoiceEngine>('gemini');
  const [geminiVoice, setGeminiVoice] = useState<GeminiVoice>('Fenrir');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1.0);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState<number>(-1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Audio elements & synthesis refs
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const audioBlobUrlRef = useRef<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const cachedAudiosRef = useRef<Map<string, string>>(new Map());

  // Split text into sentences for synchronized highlight
  const fullNarrationText = `${eraTitle}. ${timeframe}. ${heroExcerpt ? heroExcerpt + ' ' : ''}${overviewText}`;
  const sentences = overviewText.match(/[^.!?]+[.!?]+/g) || [overviewText];

  // Clean up audio on unmount or era change
  const stopAllAudio = useCallback(() => {
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsLoading(false);
    setActiveSentenceIndex(-1);
  }, []);

  useEffect(() => {
    stopAllAudio();
    setCurrentTime(0);
    setDuration(0);
    setErrorMessage(null);
  }, [eraTitle, stopAllAudio]);

  // Handle Web Speech API playback
  const playWebSpeech = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setErrorMessage('Browser Speech Synthesis is not supported on this platform.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(fullNarrationText);
    utteranceRef.current = utterance;

    utterance.rate = playbackRate;
    utterance.volume = isMuted ? 0 : volume;

    // Pick good english voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(
      (v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Enhanced'))
    ) || voices.find((v) => v.lang.startsWith('en'));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    // Estimate duration for progress bar (~150 words/min = 2.5 words/sec)
    const wordCount = fullNarrationText.split(/\s+/).length;
    const estDuration = (wordCount / (2.5 * playbackRate));
    setDuration(estDuration);

    const startTime = Date.now();
    const interval = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        clearInterval(interval);
        return;
      }
      const elapsed = (Date.now() - startTime) / 1000;
      setCurrentTime(Math.min(elapsed, estDuration));

      // Estimate active sentence
      const progress = Math.min(elapsed / estDuration, 0.99);
      const sentenceIdx = Math.floor(progress * sentences.length);
      setActiveSentenceIndex(sentenceIdx);
    }, 200);

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsLoading(false);
      setErrorMessage(null);
    };

    utterance.onend = () => {
      clearInterval(interval);
      setIsPlaying(false);
      setCurrentTime(estDuration);
      setActiveSentenceIndex(-1);
    };

    utterance.onerror = (e) => {
      clearInterval(interval);
      setIsPlaying(false);
      setIsLoading(false);
      console.warn('Speech synthesis error:', e);
    };

    window.speechSynthesis.speak(utterance);
  }, [fullNarrationText, isMuted, playbackRate, sentences.length, volume]);

  // Handle Gemini AI TTS playback
  const playGeminiTTS = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const cacheKey = `${eraTitle}-${geminiVoice}-${fullNarrationText.slice(0, 40)}`;

    try {
      let audioUrl = cachedAudiosRef.current.get(cacheKey);

      if (!audioUrl) {
        // Request TTS from server proxy
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: fullNarrationText,
            voice: geminiVoice,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Server responded with ${res.status}`);
        }

        const data = await res.json();
        if (!data.audioBase64) {
          throw new Error('No audio data received');
        }

        // Convert base64 to Blob URL
        const binaryString = window.atob(data.audioBase64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const blob = new Blob([bytes], { type: data.mimeType || 'audio/wav' });
        audioUrl = URL.createObjectURL(blob);
        cachedAudiosRef.current.set(cacheKey, audioUrl);
      }

      if (!audioElRef.current) {
        audioElRef.current = new Audio();
      }

      const audio = audioElRef.current;
      audio.src = audioUrl;
      audio.playbackRate = playbackRate;
      audio.volume = isMuted ? 0 : volume;

      audio.onloadedmetadata = () => {
        setDuration(audio.duration || 30);
      };

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
        if (audio.duration) {
          const progress = audio.currentTime / audio.duration;
          const sentenceIdx = Math.floor(progress * sentences.length);
          setActiveSentenceIndex(Math.min(sentenceIdx, sentences.length - 1));
        }
      };

      audio.onended = () => {
        setIsPlaying(false);
        setActiveSentenceIndex(-1);
      };

      audio.onerror = () => {
        throw new Error('Audio playback element error');
      };

      await audio.play();
      setIsPlaying(true);
      setIsLoading(false);
    } catch (err: unknown) {
      console.warn('Gemini TTS failed or offline, falling back to Web Speech API:', err);
      // Fallback seamlessly to Web Speech API
      setVoiceEngine('webspeech');
      playWebSpeech();
    }
  }, [eraTitle, fullNarrationText, geminiVoice, isMuted, playbackRate, playWebSpeech, sentences.length, volume]);

  // Main Toggle Play / Pause
  const handleTogglePlay = () => {
    soundManager.playHoverBlip();
    setIsExpanded(true);

    if (isPlaying) {
      if (voiceEngine === 'gemini' && audioElRef.current) {
        audioElRef.current.pause();
      } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.pause();
      }
      setIsPlaying(false);
    } else {
      if (!isOnline && voiceEngine === 'gemini') {
        // Automatically route to offline speech
        setVoiceEngine('webspeech');
        playWebSpeech();
        return;
      }

      if (voiceEngine === 'gemini') {
        if (audioElRef.current && audioElRef.current.src && audioElRef.current.currentTime > 0 && !audioElRef.current.ended) {
          audioElRef.current.play();
          setIsPlaying(true);
        } else {
          playGeminiTTS();
        }
      } else {
        if (typeof window !== 'undefined' && window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
          setIsPlaying(true);
        } else {
          playWebSpeech();
        }
      }
    }
  };

  const handleRestart = () => {
    soundManager.playHoverBlip();
    stopAllAudio();
    setCurrentTime(0);
    setActiveSentenceIndex(-1);
    setTimeout(() => {
      if (voiceEngine === 'gemini') {
        playGeminiTTS();
      } else {
        playWebSpeech();
      }
    }, 150);
  };

  const handleSkip = (seconds: number) => {
    soundManager.playHoverBlip();
    if (voiceEngine === 'gemini' && audioElRef.current) {
      audioElRef.current.currentTime = Math.max(0, Math.min(audioElRef.current.duration, audioElRef.current.currentTime + seconds));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (voiceEngine === 'gemini' && audioElRef.current) {
      audioElRef.current.currentTime = newTime;
    }
  };

  const handleRateChange = (rate: number) => {
    soundManager.playHoverBlip();
    setPlaybackRate(rate);
    if (audioElRef.current) {
      audioElRef.current.playbackRate = rate;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-4 shadow-xl backdrop-blur-md">
      {/* Header bar with Quick Play Button and Voice Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Headphones className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-100 font-display uppercase tracking-wide">
                Historical Audio Narration
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-amber-500/15 border border-amber-500/40 text-amber-300">
                {voiceEngine === 'gemini' ? `AI Voice: ${geminiVoice}` : 'System Voice (Offline)'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Listen to the epic documentary chronicle of {eraTitle}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Main Play / Pause Button */}
          <button
            onClick={handleTogglePlay}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-950/40 transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Synthesizing...</span>
              </>
            ) : isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause Narration</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Listen to Era</span>
              </>
            )}
          </button>

          {/* Toggle Full Audio Console */}
          <button
            onClick={() => {
              setIsExpanded(!isExpanded);
              soundManager.playHoverBlip();
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isExpanded
                ? 'bg-slate-800 border-amber-500/40 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Audio Settings & Console"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Audio Player Console */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3.5 animate-fade-in">
          {/* Equalizer & Status Indicator */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono-tabular text-slate-400">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>

              {/* Animated Equalizer Waveform */}
              {isPlaying && (
                <div className="flex items-end gap-1 h-3.5 px-2">
                  <div className="w-0.5 bg-amber-400 rounded-full animate-bounce h-3" style={{ animationDelay: '0ms' }} />
                  <div className="w-0.5 bg-amber-300 rounded-full animate-bounce h-2" style={{ animationDelay: '150ms' }} />
                  <div className="w-0.5 bg-amber-500 rounded-full animate-bounce h-3.5" style={{ animationDelay: '300ms' }} />
                  <div className="w-0.5 bg-amber-400 rounded-full animate-bounce h-2.5" style={{ animationDelay: '200ms' }} />
                  <div className="w-0.5 bg-amber-300 rounded-full animate-bounce h-3" style={{ animationDelay: '100ms' }} />
                </div>
              )}
            </div>

            {/* Playback Speed Toggles */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {[0.75, 1.0, 1.25, 1.5].map((rate) => (
                <button
                  key={rate}
                  onClick={() => handleRateChange(rate)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium transition-all cursor-pointer ${
                    playbackRate === rate
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          {/* Progress Timeline Scrubber */}
          <div className="space-y-1">
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.5"
              value={currentTime}
              onChange={handleSeek}
              disabled={voiceEngine === 'webspeech'}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-50"
            />
          </div>

          {/* Player controls: Skip -10s, Play/Pause, Skip +10s, Restart, Voice Settings */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSkip(-10)}
                disabled={voiceEngine === 'webspeech'}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-40"
                title="Rewind 10 seconds"
              >
                <Rewind className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleRestart}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 transition-all cursor-pointer hover:scale-105 active:scale-95"
                title="Restart narration from beginning"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleSkip(10)}
                disabled={voiceEngine === 'webspeech'}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-40"
                title="Fast forward 10 seconds"
              >
                <FastForward className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  setIsMuted(!isMuted);
                  soundManager.playHoverBlip();
                  if (audioElRef.current) audioElRef.current.muted = !isMuted;
                }}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                  isMuted
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                    : 'bg-slate-800/80 border-slate-700/60 text-slate-300'
                }`}
                title="Mute / Unmute"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Voice Engine & Persona Switcher */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const nextEngine: VoiceEngine = voiceEngine === 'gemini' ? 'webspeech' : 'gemini';
                  stopAllAudio();
                  setVoiceEngine(nextEngine);
                  soundManager.playHoverBlip();
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-[11px] text-slate-200 transition-all cursor-pointer"
                title="Switch between Neural AI and Browser System Voice"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{voiceEngine === 'gemini' ? 'Gemini AI Voice' : 'Offline System Voice'}</span>
              </button>

              {voiceEngine === 'gemini' && (
                <select
                  value={geminiVoice}
                  onChange={(e) => {
                    stopAllAudio();
                    setGeminiVoice(e.target.value as GeminiVoice);
                    soundManager.playHoverBlip();
                  }}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-amber-300 cursor-pointer focus:outline-none focus:border-amber-500"
                >
                  <option value="Fenrir">Fenrir (Deep & Resonant)</option>
                  <option value="Kore">Kore (Clear & Articulate)</option>
                  <option value="Zephyr">Zephyr (Atmospheric)</option>
                  <option value="Puck">Puck (Engaging & Dynamic)</option>
                  <option value="Charon">Charon (Grand & Cinematic)</option>
                </select>
              )}
            </div>
          </div>

          {/* Synchronized Read-Along Subtitle Highlight */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs leading-relaxed">
            <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
              <span>Read-Along Narration Subtitles</span>
            </div>
            <div className="space-y-1">
              {sentences.map((sentence, idx) => {
                const isActive = isPlaying && activeSentenceIndex === idx;
                return (
                  <span
                    key={idx}
                    className={`transition-colors duration-200 ${
                      isActive
                        ? 'text-amber-200 bg-amber-500/20 px-1 py-0.5 rounded border-b border-amber-400 font-medium'
                        : 'text-slate-300'
                    }`}
                  >
                    {sentence}{' '}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
