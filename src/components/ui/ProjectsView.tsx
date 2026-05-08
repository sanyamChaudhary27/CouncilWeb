'use client';

import { useState } from 'react';
import { useCouncilStore } from '@/store/useCouncilStore';
import { Folder, FileText, ChevronRight, Plus, Search, Calendar, Clock, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { CreateProjectModal, CreateSessionModal } from '@/components/ui/ProjectModals';

export default function ProjectsView() {
  const { projects } = useCouncilStore();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  return (
    <div className="h-full overflow-y-auto p-12 bg-[#fbfaf8]">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 font-serif">Mission Projects</h1>
            <p className="text-gray-500 max-w-md text-sm leading-relaxed">
              Organize your neural research into structured projects and sessions.
            </p>
          </div>
          <button 
            onClick={() => setIsProjectModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-gray-900/10 hover:bg-gray-800 transition-all uppercase tracking-widest"
          >
            <Plus size={18} /> New Project
          </button>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project) => (
            <motion.div 
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="clean-panel p-8 space-y-6 bg-white/40 backdrop-blur-md border-[#e5e2d9] hover:border-[#d97757]/30 transition-all group relative"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#e5e2d9] flex items-center justify-center text-gray-400 group-hover:text-[#d97757] transition-colors">
                    <Folder size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 tracking-tight uppercase">{project.name}</h3>
                    <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                      <span className="flex items-center gap-1"><Calendar size={12} /> May 8, 2026</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {project.sessions.length} Sessions</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setActiveProjectId(project.id);
                    setIsSessionModalOpen(true);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-2 bg-[#d97757] text-white rounded-xl shadow-lg shadow-[#d97757]/20 transition-all active:scale-95"
                >
                  <Plus size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Sessions</p>
                <div className="grid grid-cols-1 gap-2">
                  {project.sessions.map((session) => (
                    <button 
                      key={session.id}
                      className="flex items-center justify-between p-4 bg-white border border-[#e5e2d9] rounded-2xl hover:border-[#d97757] hover:shadow-lg hover:shadow-[#d97757]/5 transition-all group/session"
                    >
                      <div className="flex items-center gap-3">
                        <FileText size={16} className="text-gray-400 group-hover/session:text-[#d97757]" />
                        <span className="text-xs font-bold text-gray-700 tracking-wide uppercase">{session.name}</span>
                        {session.persistMemory && (
                          <span title="Memory Persisted">
                            <Shield size={10} className="text-green-500" />
                          </span>
                        )}
                      </div>
                      <ChevronRight size={14} className="text-gray-300 group-hover/session:text-[#d97757]" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <CreateProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} />
        {activeProjectId && (
          <CreateSessionModal 
            isOpen={isSessionModalOpen} 
            onClose={() => setIsSessionModalOpen(false)} 
            projectId={activeProjectId} 
          />
        )}
      </div>
    </div>
  );
}
