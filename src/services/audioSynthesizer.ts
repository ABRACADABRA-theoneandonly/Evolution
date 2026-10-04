export type MusicTrack = 'home-chronicle' | 'calming-zen' | 'cosmic-odyssey' | 'primordial-deep' | 'mesozoic-dawn';

class SoundEffectsManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicVolume: number = 0.35;

  // Music Synth Nodes
  private isMusicPlaying: boolean = false;
  private currentTrack: MusicTrack = 'home-chronicle';
  private droneOscs: OscillatorNode[] = [];
  private droneGains: GainNode[] = [];
  private masterMusicGain: GainNode | null = null;
  private musicIntervalId: number | null = null;
  private oceanWaveIntervalId: number | null = null;
  private onMusicStateChangeListeners: ((isPlaying: boolean, track: MusicTrack) => void)[] = [];

  public initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterMusicGain && this.ctx) {
      this.masterMusicGain.gain.setValueAtTime(this.isMuted ? 0 : this.musicVolume, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.masterMusicGain && this.ctx && !this.isMuted) {
      this.masterMusicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
  }

  public getMusicVolume(): number {
    return this.musicVolume;
  }

  // --- PROCEDURAL AMBIENT MUSIC ENGINE ---
  public toggleMusic(): boolean {
    this.initContext();
    if (!this.ctx) return false;

    if (this.isMusicPlaying) {
      this.stopMusic();
      return false;
    } else {
      this.startMusic(this.currentTrack);
      return true;
    }
  }

  public isMusicActive(): boolean {
    return this.isMusicPlaying;
  }

  public isAmbientActive(): boolean {
    return this.isMusicPlaying;
  }

  public toggleAmbientSoundtrack(): boolean {
    return this.toggleMusic();
  }

  public getCurrentTrack(): MusicTrack {
    return this.currentTrack;
  }

  public switchTrack(track: MusicTrack) {
    this.currentTrack = track;
    if (this.isMusicPlaying) {
      this.stopMusic();
      this.startMusic(track);
    }
  }

  public subscribeMusicChange(fn: (isPlaying: boolean, track: MusicTrack) => void) {
    this.onMusicStateChangeListeners.push(fn);
    return () => {
      this.onMusicStateChangeListeners = this.onMusicStateChangeListeners.filter((l) => l !== fn);
    };
  }

  private notifyMusicListeners() {
    this.onMusicStateChangeListeners.forEach((fn) => fn(this.isMusicPlaying, this.currentTrack));
  }

  // Gentle pink-noise ocean wave wash (breathing cycle: 8 seconds)
  private playOceanBreathWave() {
    if (!this.ctx || !this.masterMusicGain || !this.isMusicPlaying) return;
    try {
      const now = this.ctx.currentTime;
      const dur = 7.5;
      const bufferSize = Math.floor(this.ctx.sampleRate * dur);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Pinkish noise generator
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2) * 0.12;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, now);
      filter.frequency.linearRampToValueAtTime(450, now + dur * 0.45);
      filter.frequency.linearRampToValueAtTime(160, now + dur);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.06, now + dur * 0.45);
      gain.gain.linearRampToValueAtTime(0.0001, now + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterMusicGain);

      noise.start(now);
      noise.stop(now + dur + 0.1);
    } catch {
      // ignore
    }
  }

  public startMusic(track: MusicTrack = 'calming-zen') {
    this.initContext();
    if (!this.ctx) return;
    this.stopMusic();

    this.currentTrack = track;
    const now = this.ctx.currentTime;

    this.masterMusicGain = this.ctx.createGain();
    this.masterMusicGain.gain.setValueAtTime(0.001, now);
    this.masterMusicGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : this.musicVolume, now + 2.0);
    this.masterMusicGain.connect(this.ctx.destination);

    let frequencies: number[] = [];
    let chimeScale: number[] = [];
    let intervalMs = 2400;

    if (track === 'home-chronicle') {
      // Majestic, uplifting, calming Home Screen Symphony (Eb Major 9th):
      // Eb2 (77.8Hz), Bb2 (116.5Hz), G3 (196.0Hz), D4 (293.7Hz), F4 (349.2Hz)
      frequencies = [77.78, 116.54, 196.0, 293.66, 349.23];
      chimeScale = [392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
      intervalMs = 2400;
    } else if (track === 'calming-zen') {
      // 432Hz Pythagorean Pentatonic Celestial Harmonics (Ultra Peaceful):
      // F#1 (45.7Hz), C#2 (68.6Hz), A2 (108.0Hz), E3 (162.0Hz), B3 (243.0Hz), F#4 (364.5Hz)
      frequencies = [68.6, 108.0, 162.0, 243.0, 364.5];
      chimeScale = [432.0, 486.0, 540.0, 648.0, 720.0, 864.0, 972.0];
      intervalMs = 2800; // Slow, breathing pace
    } else if (track === 'cosmic-odyssey') {
      // C minor 9th (Cosmic deep space)
      frequencies = [65.41, 98.0, 155.56, 233.08, 293.66];
      chimeScale = [523.25, 587.33, 622.25, 783.99, 932.33, 1046.5];
      intervalMs = 2200;
    } else if (track === 'primordial-deep') {
      // F Dorian (Underwater hydrothermal abyss)
      frequencies = [87.31, 130.81, 207.65, 311.13];
      chimeScale = [349.23, 392.0, 415.3, 466.16, 523.25, 622.25];
      intervalMs = 2500;
    } else {
      // D Mixolydian (Mesozoic Dawn)
      frequencies = [73.42, 110.0, 185.0, 261.63, 329.63];
      chimeScale = [587.33, 659.25, 739.99, 880.0, 987.77];
      intervalMs = 2000;
    }

    // Build warm, soft sine chord drone with gentle chorus
    this.droneOscs = [];
    this.droneGains = [];

    frequencies.forEach((freq, idx) => {
      if (!this.ctx || !this.masterMusicGain) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine'; // Pure, warm sine waves for calming relaxation
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(idx === 0 ? 140 : 480, now);

      // Ultra-slow breathing detune LFO (0.05 Hz)
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.04 + idx * 0.02, now);
      lfoGain.gain.setValueAtTime(1.2, now);
      lfo.connect(osc.detune);
      lfo.start();

      gain.gain.setValueAtTime(0.1 / frequencies.length, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterMusicGain);

      osc.start(now);
      this.droneOscs.push(osc);
      this.droneGains.push(gain);
    });

    // Soothing Chime Melody Loop (gentle harp / celesta tone)
    this.musicIntervalId = window.setInterval(() => {
      if (!this.ctx || !this.masterMusicGain || !this.isMusicPlaying) return;

      const chimeFreq = chimeScale[Math.floor(Math.random() * chimeScale.length)];
      const chimeTime = this.ctx.currentTime;
      const chimeOsc = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();
      const chimeFilter = this.ctx.createBiquadFilter();

      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(chimeFreq, chimeTime);

      chimeFilter.type = 'lowpass';
      chimeFilter.frequency.setValueAtTime(1200, chimeTime);

      // Long, peaceful decay
      chimeGain.gain.setValueAtTime(0.001, chimeTime);
      chimeGain.gain.linearRampToValueAtTime(0.04, chimeTime + 0.3);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, chimeTime + 3.2);

      chimeOsc.connect(chimeFilter);
      chimeFilter.connect(chimeGain);
      chimeGain.connect(this.masterMusicGain);

      chimeOsc.start(chimeTime);
      chimeOsc.stop(chimeTime + 3.3);
    }, intervalMs);

    // Initial ocean wave breath wash
    this.playOceanBreathWave();

    // Ocean breath loop every 12 seconds
    this.oceanWaveIntervalId = window.setInterval(() => {
      this.playOceanBreathWave();
    }, 12000);

    this.isMusicPlaying = true;
    this.notifyMusicListeners();
  }

  public stopMusic() {
    if (this.musicIntervalId) {
      clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }
    if (this.oceanWaveIntervalId) {
      clearInterval(this.oceanWaveIntervalId);
      this.oceanWaveIntervalId = null;
    }

    if (this.masterMusicGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterMusicGain.gain.linearRampToValueAtTime(0.001, now + 0.8);
      setTimeout(() => {
        this.droneOscs.forEach((osc) => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {
            // ignore
          }
        });
        this.droneOscs = [];
        this.droneGains = [];
      }, 900);
    }

    this.isMusicPlaying = false;
    this.notifyMusicListeners();
  }

  // --- SOUND EFFECTS ---
  public playMusicalNote(noteIndex: number = 0) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    // 432 Hz harmonious pentatonic note
    const scale = [432.0, 486.0, 540.0, 648.0, 720.0, 864.0];
    const freq = scale[noteIndex % scale.length];
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 1.25);
  }

  public playDinosaurRoar() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(220, now + 0.2);
    osc.frequency.exponentialRampToValueAtTime(55, now + 1.2);

    lfo.type = 'sawtooth';
    lfo.frequency.setValueAtTime(24, now);
    lfoGain.gain.setValueAtTime(35, now);
    lfo.connect(osc.frequency);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(180, now + 1.2);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + 1.3);
    osc.stop(now + 1.3);
  }

  public playFootstepThud() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(75, now);
    osc.frequency.exponentialRampToValueAtTime(28, now + 0.25);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  public playQuizSuccess() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2);
    osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.3);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  public playQuizError() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(164.81, now + 0.2);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  public playBadgeUnlock() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      gain.gain.setValueAtTime(0.12, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.45);
    });
  }

  public playCosmicBlast() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(60, now + 0.5);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start(now);
  }

  public playVolcanoEruption() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const dur = 1.2;
    const bufferSize = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.8;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, now);
    filter.frequency.exponentialRampToValueAtTime(45, now + dur);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
  }

  public playMeteorWhoosh() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.6);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.75);

    setTimeout(() => {
      this.playCosmicBlast();
    }, 450);
  }

  public playFlintStrike() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2400, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playDiscoveryUnlock() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [440, 554.37, 659.25, 880, 1108.73, 1318.51].forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);

      gain.gain.setValueAtTime(0.09, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.4);
    });
  }

  public playHoverBlip() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.03);

    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playCursorSpark() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const randomPitch = 1200 + Math.random() * 800;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(randomPitch, now);
    osc.frequency.exponentialRampToValueAtTime(randomPitch * 1.5, now + 0.04);

    gain.gain.setValueAtTime(0.025, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  public playTimeWarp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.5);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(3200, now + 0.25);
    filter.frequency.exponentialRampToValueAtTime(800, now + 0.5);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.6);
  }

  public playSupernova() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(120, now);
    subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.9);

    subGain.gain.setValueAtTime(0.2, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 1.2);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.6);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.75);
  }
}

export const soundManager = new SoundEffectsManager();
