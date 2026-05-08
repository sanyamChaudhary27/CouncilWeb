'use client';

import { Folder, Plus, FileText } from 'lucide-react';
import { NavButton } from './NavButton';
import { useCouncilStore } from '@/store/useCouncilStore';

interface ProjectItemProps {
  project: { id: string; name: string; sessions: any[] };
  activeView: string;
  onAddSession: (projectId: string) => void;
}

export const ProjectItem = ({ project, activeView, onAddSession }: ProjectItemProps) => {
  return (
    <div className="space-y-1 group/project">
      <div className="px-4 py-1 flex items-center justify-between text-gray-500">
        <div className="flex items-center gap-2">
          <Folder size={14} className="text-gray-400" />
          <span className="hidden lg:block text-[11px] font-bold tracking-widest uppercase truncate">{project.name}</span>
        </div>
        <button 
          onClick={() => onAddSession(project.id)}
          className="opacity-0 group-hover/project:opacity-100 text-gray-400 hover:text-[#d97757] transition-all"
        >
          <Plus size={12} />
        </button>
      </div>
      <div className="space-y-1">
        {project.sessions.map(session => (
          <NavButton 
            key={session.id} 
            item={{ id: session.id, label: session.name, icon: FileText }} 
            isActive={activeView === session.id} 
            isNested 
          />
        ))}
      </div>
    </div>
  );
};
