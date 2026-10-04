import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Minimize2,
  Maximize2,
  HelpCircle,
  Flame,
  Globe,
  Loader2,
} from 'lucide-react';
import { useUserLearning } from '../../context/UserLearningContext';
import { ERAS_CURRICULUM } from '../../data/curriculumData';
import { soundManager } from '../../services/audioSynthesizer';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const ChronosAIChatbot: React.FC = () => {
  const { state } = useUserLearning();
  const currentEra = ERAS_CURRICULUM.find((e) => e.id === state.currentEraId) || ERAS_CURRICULUM[0];

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `Greetings, time traveler! I am **Chronos**, your cosmic geobiologist AI guide. We are currently observing **${currentEra.title}** (${currentEra.timeframe}). Ask me anything about cosmic accretion, ancient atmospheres, prehistoric organisms, or the evolutionary lineage of humankind!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  // Quick suggestions based on active era
  const getSuggestions = () => {
    switch (state.currentEraId) {
      case 'big-bang':
        return [
          '💥 What happened in the first 3 minutes of the universe?',
          '🌙 How did Theia collision stabilize Earth\'s seasons?',
          '🔥 How hot was Earth\'s molten magma ocean?',
        ];
      case 'before-dinosaurs':
        return [
          '🫧 How did cyanobacteria create the Great Oxidation Event?',
          '❄️ What caused the catastrophic Snowball Earth?',
          '🦎 How did Tiktaalik develop wrists to walk onto land?',
        ];
      case 'dinosaurs':
        return [
          '☄️ What happened in the first hour of Chicxulub impact?',
          '🦖 Why were Mesozoic sauropods able to grow so gigantic?',
          '🦅 How are modern birds direct descendants of theropods?',
        ];
      case 'human-evolution':
        return [
          '🔥 How did cooking food expand Homo erectus brains?',
          '🦴 What makes Lucy (Australopithecus) so pivotal?',
          '🧬 How much Neanderthal DNA do modern humans carry?',
        ];
      default:
        return [
          '🌍 How old is Earth and how do we know?',
          '🌋 What was the deadliest mass extinction in history?',
        ];
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    soundManager.playHoverBlip();

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          currentEraTitle: currentEra.title,
          currentEraTimeframe: currentEra.timeframe,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const assistantReply = data.reply || 'Fascinating cosmic question! The geological record holds the answers.';

      soundManager.playDiscoveryUnlock();

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: assistantReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: unknown) {
      console.warn('API chat offline/fallback:', err);
      // Helpful interactive fallback if server key is not yet set
      const fallbackReply = generateOfflineFallback(text, currentEra.id);
      soundManager.playDiscoveryUnlock();
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: fallbackReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Offline or key fallback knowledge generator
  const generateOfflineFallback = (query: string, eraId: string) => {
    const q = query.toLowerCase();
    if (q.includes('theia') || q.includes('moon')) {
      return `Around **4.51 billion years ago**, a Mars-sized protoplanet named **Theia** struck proto-Earth at 4 km/s. The kinetic impact vaporized mantle rock and flung an incandescent debris disk into orbit. Within mere decades, this accretion ring coalesced into our **Moon**, simultaneously tilting Earth's axis at **23.5°** to create stable seasonal cycles!`;
    }
    if (q.includes('oxidation') || q.includes('oxygen') || q.includes('cyanobacteria')) {
      return `The **Great Oxidation Event (GOE)** occurred roughly **2.4–2.1 billion years ago**. Microscopic **cyanobacteria** began performing oxygenic photosynthesis. Initially, the oxygen reacted with dissolved ferrous iron in the oceans, forming vast **Banded Iron Formations (BIFs)**. Once oceanic iron was exhausted, free $O_2$ flooded the atmosphere, triggering Earth's first global mass extinction of obligate anaerobes and the 300-million-year Huronian Snowball glaciation!`;
    }
    if (q.includes('chicxulub') || q.includes('dinosaur') || q.includes('extinct')) {
      return `Exactly **66 million years ago**, a carbonaceous chondrite asteroid **10 km wide** slammed into the Yucatán Peninsula at **20 km/s**, releasing the energy of **100 million megatons of TNT**. The blast ignited global wildfires and threw hundreds of gigatons of sulfate and soot into the stratosphere, blocking 99% of sunlight for years. While non-avian dinosaurs perished, small burrowing mammals and seed-eating avian theropods (modern birds) survived!`;
    }
    if (q.includes('fire') || q.includes('erectus') || q.includes('brain')) {
      return `The mastery of controlled fire by ***Homo erectus*** around **1.5–1.0 million years ago** was a biological quantum leap. Under the *Expensive-Tissue Hypothesis*, cooking gelatinized starches and denatured animal proteins, drastically reducing the digestive energy needed by the gut. This freed up metabolic calories to fuel the dramatic expansion of the human encephalized brain!`;
    }
    return `That touches on one of the deepest mysteries of Earth history! In **${currentEra.title}**, physical forces and biological evolutionary feedback loops reshaped planetary geology. Check out our interactive simulation on this page to test the physical dynamics for yourself!`;
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'reset',
        role: 'assistant',
        content: `Chronos timeline reset. What would you like to investigate in Earth's history?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
            soundManager.playHoverBlip();
          }}
          className="fixed bottom-6 right-6 z-40 p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-slate-950 font-bold shadow-2xl shadow-amber-950/60 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-3 border border-amber-300/40 group cursor-pointer"
          aria-label="Open Chronos AI Chatbot"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-slate-950" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
          </div>
          <span className="text-xs tracking-wide uppercase font-display font-extrabold pr-1">
            Ask Chronos AI
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 shadow-2xl border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/95 backdrop-blur-xl flex flex-col ${
            isMinimized
              ? 'bottom-6 right-6 w-80 h-14'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/40 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 p-0.5 flex items-center justify-center shrink-0 shadow-md">
                <Bot className="w-4 h-4 text-slate-950" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-slate-100 font-display">Chronos AI Guide</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                </div>
                <p className="text-[10px] text-amber-400/90 truncate font-mono-tabular">
                  Synced: {currentEra.title.split('&')[0]}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClear}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                title="Restart Chat"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                title={isMinimized ? 'Expand Chat' : 'Minimize Chat'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Body (if not minimized) */}
          {!isMinimized && (
            <>
              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                    )}

                    <div
                      className={`max-w-[82%] rounded-2xl p-3 leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      <div
                        className={`text-[9px] mt-1.5 text-right font-mono-tabular ${
                          msg.role === 'user' ? 'text-slate-800' : 'text-slate-500'
                        }`}
                      >
                        {msg.timestamp}
                      </div>
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5 text-slate-300" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                      <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                    </div>
                    <span className="italic animate-pulse">Chronos is calculating cosmic records...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Inquiry Pills */}
              <div className="px-3 py-2 bg-slate-950/80 border-t border-slate-800/80 overflow-x-auto flex gap-1.5 no-scrollbar">
                {getSuggestions().map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(sug)}
                    className="px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap bg-slate-900 hover:bg-amber-500/20 hover:text-amber-300 text-slate-400 border border-slate-800 transition-colors"
                  >
                    {sug}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="p-3 bg-slate-900/60 border-t border-slate-800 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Ask about ${currentEra.title.split('&')[0]}...`}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold transition-all shrink-0 cursor-pointer"
                  title="Send message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};
