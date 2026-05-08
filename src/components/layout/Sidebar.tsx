'use client';

import { useState } from 'react';
import { useCouncilStore } from '@/store/useCouncilStore';
import { 
  LayoutDashboard, Users, Library, History, Settings, BrainCircuit, 
  Wrench, Folder, FileText, ChevronRight, Grid, Database, Zap, Plus 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreateProjectModal, CreateSessionModal } from '@/components/ui/ProjectModals';

const PRIMARY_NAV = [
  { id: 'workspace', label: 'Workspace', icon: BrainCircuit },
  { id: 'council', label: 'Council Chamber', icon: Users },
];

const MANAGEMENT_NAV = [
  { id: 'mcp', label: 'MCP Tools', icon: Wrench },
  { id: 'library', label: 'The Library', icon: History },
  { id: 'catalog', label: 'Catalog', icon: Grid },
];

import { NavButton } from './Sidebar/NavButton';
import { ProjectItem } from './Sidebar/ProjectItem';

export default function Sidebar() {
  const { activeView, setView, projects } = useCouncilStore();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  return (
    <aside className="w-20 lg:w-64 h-full bg-white border-r border-[#e5e2d9] flex flex-col items-center lg:items-stretch py-8 z-40 overflow-y-auto scrollbar-none">
      {/* Brand */}
      <div className="px-6 mb-10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#d97757] flex items-center justify-center text-white shadow-lg shadow-[#d97757]/20">
          <BrainCircuit size={18} />
        </div>
        <span className="hidden lg:block font-bold text-lg tracking-tight text-gray-800">SYNERGY</span>
      </div>

      {/* Nav Sections */}
      <div className="flex-1 px-3 space-y-8 w-full">
        {/* Primary */}
        <nav className="space-y-1">
          {PRIMARY_NAV.map(item => (
            <NavButton key={item.id} item={item} isActive={activeView === item.id} />
          ))}
        </nav>

        {/* Management */}
        <div className="space-y-3">
          <h3 className="hidden lg:block px-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Management</h3>
          <nav className="space-y-1">
            {MANAGEMENT_NAV.map(item => (
              <NavButton key={item.id} item={item} isActive={activeView === item.id} />
            ))}
          </nav>
        </div>

        {/* Projects */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-4">
            <h3 className="hidden lg:block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Projects</h3>
            <button 
              onClick={() => setIsProjectModalOpen(true)}
              className="text-[#d97757] hover:bg-[#d97757]/10 p-1 rounded-md transition-all"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="space-y-4">
            {projects.map(project => (
              <ProjectItem 
                key={project.id} 
                project={project} 
                activeView={activeView} 
                onAddSession={(id) => {
                  setActiveProjectId(id);
                  setIsSessionModalOpen(true);
                }}
              />
            ))}
          </div>
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

      {/* Bottom Actions */}
      <div className="px-4 mt-auto w-full space-y-2">
        <button className="w-full flex items-center gap-4 px-4 py-3 text-gray-400 hover:text-gray-600 transition-colors">
          <Settings size={20} />
          <span className="hidden lg:block font-medium text-sm">Settings</span>
        </button>
        <div className="pt-4 mt-4 border-t border-[#e5e2d9] flex items-center gap-3 px-4">
          <div className="w-8 h-8 rounded-full bg-gray-100 border border-[#e5e2d9] flex-shrink-0" />
          <div className="hidden lg:block overflow-hidden">
            <p className="text-xs font-bold text-gray-800 truncate">Senior Architect</p>
            <p className="text-[10px] text-gray-400 truncate">Pro Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
