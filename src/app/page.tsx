'use client';

import { useEffect, useState } from 'react';
import ProjectsView from '@/components/ui/ProjectsView';
import McpView from '@/components/ui/McpView';
import CatalogView from '@/components/ui/CatalogView';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Shield, Cpu, Zap, ChevronRight, Layers, Terminal, Sparkles, MessageSquare, Maximize2, Settings2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useCouncilStore } from '@/store/useCouncilStore';
import ReactMarkdown from 'react-markdown';
import NodeInspector from '@/components/ui/NodeInspector';
import AppLayout from '@/components/layout/AppLayout';
import CouncilManager from '@/components/ui/CouncilManager';
import ConferenceJournal from '@/components/ui/ConferenceJournal';
import LibraryView from '@/components/ui/LibraryView';

// Dynamic import for 3D scene
const CouncilScene = dynamic(() => import('@/components/canvas/CouncilScene'), { 
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-[#fbfaf8] text-[#d97757] font-medium italic">Synchronizing Neural Mesh...</div>
});

export default function SynergyApp() {
  const { 
    nodes, 
    activeView, 
    currentSessionId,
    projects,
    isDeliberating, 
    objective, 
    startDeliberation, 
    stopDeliberation, 
    consensusScore,
    clearMessages,
    appendTokenToMessage,
    updateNode,
    setConsensusScore,
    fetchLibrary
  } = useCouncilStore();

  useEffect(() => {
    fetchLibrary();
  }, [fetchLibrary]);

  const [isJournalOpen, setIsJournalOpen] = useState(true);

  const handleStart = async () => {
    if (!objective || nodes.length === 0) return;
    setIsJournalOpen(true);
    startDeliberation();
    clearMessages();
    
    const { sessionSummary } = useCouncilStore.getState();
    
    const activeSession = projects.flatMap(p => p.sessions).find(s => s.id === currentSessionId);
    const persistMemory = activeSession?.persistMemory || false;

    try {
      const response = await fetch('/api/council/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: objective, 
          nodes, 
          sessionSummary,
          sessionId: currentSessionId,
          persistMemory
        })
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || "";

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.startsWith('event: ')) {
            const eventType = line.substring(7).trim();
            const dataLine = lines[++i];
            if (dataLine && dataLine.startsWith('data: ')) {
              const data = JSON.parse(dataLine.substring(6));
              
              if (eventType === 'node_start') {
                updateNode(data.nodeId, { status: 'thinking', toolActivity: null });
              } else if (eventType === 'token') {
                appendTokenToMessage(data.nodeId, data.token);
              } else if (eventType === 'tool_start') {
                updateNode(data.nodeId, { toolActivity: `Using ${data.tool}...` });
              } else if (eventType === 'tool_end') {
                updateNode(data.nodeId, { toolActivity: null });
              } else if (eventType === 'node_vote') {
                updateNode(data.nodeId, { confidence: data.score });
              } else if (eventType === 'consensus_done') {
                setConsensusScore(data.score);
              } else if (eventType === 'session_update') {
                useCouncilStore.getState().updateSessionSummary(data.summary);
              } else if (eventType === 'node_end') {
                updateNode(data.nodeId, { status: 'done', toolActivity: null });
              } else if (eventType === 'done') {
                stopDeliberation();
                nodes.forEach(n => updateNode(n.id, { status: 'idle' }));
              } else if (eventType === 'error') {
                stopDeliberation();
              }
            }
          }
        }
      }
    } catch (err) {
      stopDeliberation();
    }
  };

  const renderView = () => {
    switch (activeView) {
      case 'council':
        return <CouncilManager />;
      case 'library':
        return <LibraryView />;
      case 'projects':
        return <ProjectsView />;
      case 'mcp':
        return <McpView />;
      case 'catalog':
        return <CatalogView />;
      case 'workspace':
      default:
        // Check if activeView is a session ID (nested view)
        if (activeView !== 'workspace') {
          return <ProjectsView />;
        }
        return (
          <div className="flex h-full w-full overflow-hidden">
            {/* 3D Scene Area */}
            <div className="flex-1 relative bg-gray-50 overflow-hidden">
              <CouncilScene />
              
              {/* Context Overlays */}
              <div className="absolute top-8 left-8 space-y-4 pointer-events-none">
                <div className="clean-panel px-5 py-2.5 rounded-full flex items-center gap-3 border-[#e5e2d9] shadow-sm">
                  <div className={`w-2 h-2 rounded-full ${isDeliberating ? 'bg-[#d97757] animate-pulse' : 'bg-green-500'}`} />
                  <span className="text-[10px] font-bold tracking-widest text-gray-800 uppercase">
                    {currentSessionId ? (
                      <>
                        <span className="text-gray-400">SESSION / </span>
                        {projects.flatMap(p => p.sessions).find(s => s.id === currentSessionId)?.name || 'ACTIVE'}
                      </>
                    ) : (
                      isDeliberating ? 'CONFERENCE ACTIVE' : 'SYSTEM READY'
                    )}
                  </span>
                </div>

                {consensusScore !== null && (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="clean-panel p-5 rounded-2xl border-[#e5e2d9] shadow-sm w-48 pointer-events-auto"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Consensus</span>
                      <span className="text-xs font-bold text-[#d97757]">{consensusScore}%</span>
                    </div>
                    <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${consensusScore}%` }}
                        className="h-full bg-[#d97757]"
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Viewport Controls */}
              <div className="absolute bottom-8 left-8 flex gap-2 pointer-events-auto">
                <button className="p-3 bg-white border border-[#e5e2d9] rounded-xl text-gray-400 hover:text-gray-800 shadow-sm transition-all">
                  <Maximize2 size={18} />
                </button>
                <button className="p-3 bg-white border border-[#e5e2d9] rounded-xl text-gray-400 hover:text-gray-800 shadow-sm transition-all">
                  <Settings2 size={18} />
                </button>
              </div>

              <NodeInspector />
            </div>

            {/* Conference Journal */}
            <ConferenceJournal 
              isOpen={isJournalOpen} 
              onClose={() => setIsJournalOpen(false)}
              onStart={handleStart}
            />

            {!isJournalOpen && (
              <button 
                onClick={() => setIsJournalOpen(true)}
                className="absolute top-1/2 right-0 -translate-y-1/2 p-3 bg-white border border-r-0 border-[#e5e2d9] rounded-l-2xl z-20 text-[#d97757] shadow-xl hover:pr-5 transition-all"
              >
                <ChevronRight size={24} className="rotate-180" />
              </button>
            )}
          </div>
        );
    }
  };

  return (
    <AppLayout>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="h-full w-full"
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </AppLayout>
  );
}
