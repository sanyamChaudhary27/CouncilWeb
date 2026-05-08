'use client';

import { motion } from 'framer-motion';
import { Folder, Plus, FileText, ChevronRight, Shield, Calendar, Clock } from 'lucide-react';
import { useCouncilStore } from '@/store/useCouncilStore';

interface ProjectCardProps {
  project: { id: string; name: string; sessions: any[]; models: string[] };
  onAddSession: (projectId: string) => void;
}

export const ProjectCard = ({ project, onAddSession }: ProjectCardProps) => {
  const { setView } = useCouncilStore();

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="clean-panel p-8 space-y-6 group hover:shadow-xl transition-all"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-[#d97757]/10 text-[#d97757]">
            <Folder size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">{project.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{project.sessions.length} Sessions</span>
              <div className="w-1 h-1 rounded-full bg-gray-200" />
              <span className="text-[10px] font-bold text-[#d97757] uppercase tracking-widest">{project.models.length} Models Active</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => onAddSession(project.id)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-500 rounded-xl font-bold text-[10px] hover:bg-[#d97757] hover:text-white transition-all uppercase tracking-widest"
        >
          <Plus size={14} /> New Session
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-gray-50/50 border border-[#e5e2d9] space-y-2">
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar size={12} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Last Activity</span>
          </div>
          <p className="text-xs font-bold text-gray-700">MAR 14, 2024</p>
        </div>
        <div className="p-4 rounded-2xl bg-gray-50/50 border border-[#e5e2d9] space-y-2">
          <div className="flex items-center gap-2 text-gray-400">
            <Clock size={12} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Compute Time</span>
          </div>
          <p className="text-xs font-bold text-gray-700">12.4 Hours</p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-2">Recent Sessions</label>
        <div className="space-y-2">
          {project.sessions.slice(0, 3).map(session => (
            <button 
              key={session.id}
              onClick={() => setView(session.id)}
              className="w-full group/session flex items-center justify-between p-4 rounded-2xl border border-transparent hover:border-[#e5e2d9] hover:bg-white hover:shadow-sm transition-all"
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
          {project.sessions.length === 0 && (
            <div className="p-8 text-center border-2 border-dashed border-gray-100 rounded-3xl text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              No active sessions
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
