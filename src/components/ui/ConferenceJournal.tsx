'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ChevronRight, Activity, Zap, Cpu, Search, Code, CheckCircle2, AlertCircle, Shield, Maximize2, Minimize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useCouncilStore } from '@/store/useCouncilStore';
import { useEffect, useRef, useState } from 'react';

const ROLE_STYLES: Record<string, { icon: any; color: string; bg: string }> = {
  architect: { icon: Cpu, color: '#d97757', bg: '#fdf8f6' },
  maverick: { icon: Zap, color: '#8b5cf6', bg: '#f5f3ff' },
  critic: { icon: AlertCircle, color: '#ef4444', bg: '#fef2f2' },
  realist: { icon: Shield, color: '#10b981', bg: '#ecfdf5' },
  synthesizer: { icon: CheckCircle2, color: '#3b82f6', bg: '#eff6ff' },
};

export default function ConferenceJournal({ isOpen, onClose, onStart }: { isOpen: boolean; onClose: () => void; onStart: () => void }) {
  const { messages, objective, setObjective, isDeliberating, nodes } = useCouncilStore();
  const [isMaximized, setIsMaximized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ x: 500 }}
          animate={{ x: 0, width: isMaximized ? 'calc(100vw - 80px)' : '550px' }}
          exit={{ x: 500 }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          className="h-full clean-panel !rounded-none !border-y-0 !border-r-0 border-l border-[#e5e2d9] z-20 flex flex-col shadow-[-10px_0_40px_rgba(0,0,0,0.03)] bg-white overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 border-b border-[#e5e2d9] flex justify-between items-center bg-white/40 sticky top-0 backdrop-blur-md z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <MessageSquare className="text-[#d97757]" size={20} />
                <h2 className="font-bold tracking-tight text-sm text-gray-800 uppercase tracking-widest">Neural Conference Journal</h2>
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-8">Deliberation Protocol v2.4</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsMaximized(!isMaximized)}
                className="p-2 text-gray-400 hover:text-[#d97757] transition-all hover:bg-gray-50 rounded-xl"
                title={isMaximized ? "Restore" : "Maximize"}
              >
                {isMaximized ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-[#d97757] transition-all hover:bg-gray-50 rounded-xl">
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
          
          {/* Stream Content */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-8 space-y-12 flex flex-col scroll-smooth scrollbar-thin scrollbar-thumb-gray-200"
          >
            {messages.length === 0 ? (
              <div className="m-auto text-gray-400 text-center text-sm font-medium flex flex-col items-center gap-8 italic max-w-xs animate-in fade-in duration-1000">
                <div className="relative">
                  <Activity size={48} className="opacity-10 animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-200 animate-spin-slow" />
                  </div>
                </div>
                <p className="leading-relaxed opacity-60">The Council is standing by. Define the strategic objective below to begin the session.</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const style = ROLE_STYLES[msg.role] || { icon: MessageSquare, color: '#666', bg: '#f9f9f9' };
                const Icon = style.icon;

                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={`${msg.nodeId}-${idx}`} 
                    className="group"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm border border-white" style={{ backgroundColor: style.bg, color: style.color }}>
                        <Icon size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-800 tracking-tight">{msg.nodeName}</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{msg.role}</span>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute left-[19px] top-[-16px] bottom-[-32px] w-[2px] bg-gray-50 group-last:bg-transparent -z-10" />
                      
                      <div className="prose prose-sm max-w-none text-gray-700 bg-white p-8 rounded-3xl border border-[#e5e2d9] shadow-[0_4px_20px_rgba(0,0,0,0.02)] leading-relaxed font-serif text-[16px] selection:bg-[#d97757]/10">
                        <ReactMarkdown 
                          components={{
                            code({node, className, children, ...props}) {
                              const match = /language-(\w+)/.exec(className || '');
                              return !match ? (
                                <code className={`${className} bg-gray-50 text-[#d97757] px-1.5 py-0.5 rounded font-mono text-[0.85em]`} {...props}>
                                  {children}
                                </code>
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            },
                            pre({node, children, ...props}) {
                              return (
                                <pre className="bg-[#1a1a1a] text-gray-100 p-6 rounded-2xl overflow-x-auto my-6 shadow-xl border border-white/5 font-mono text-xs leading-normal" {...props}>
                                  {children}
                                </pre>
                              )
                            }
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Input Area */}
          <div className="p-8 border-t border-[#e5e2d9] bg-white/80 backdrop-blur-xl">
            <div className="relative group">
              <textarea 
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full bg-gray-50/50 border border-[#e5e2d9] rounded-3xl p-7 pr-16 text-[15px] text-gray-800 focus:outline-none focus:border-[#d97757]/40 focus:bg-white min-h-[160px] resize-none font-sans leading-relaxed shadow-sm transition-all duration-300"
                placeholder="What complex challenge shall we tackle today?"
              />
              <button 
                onClick={onStart}
                disabled={isDeliberating || !objective || nodes.length === 0}
                className="absolute bottom-7 right-7 p-4 bg-[#d97757] rounded-2xl text-white hover:bg-[#c6654a] transition-all-300 shadow-xl shadow-[#d97757]/20 disabled:opacity-20 disabled:shadow-none disabled:cursor-not-allowed group-hover:scale-105 active:scale-95"
              >
                <Zap size={22} fill="currentColor" />
              </button>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                Collective Intelligence Output
              </p>
              <div className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#d97757]" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
