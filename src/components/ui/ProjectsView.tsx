'use client';

import { useState } from 'react';
import { useCouncilStore } from '@/store/useCouncilStore';
import { Folder, FileText, ChevronRight, Plus, Search, Calendar, Clock, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { CreateProjectModal, CreateSessionModal } from '@/components/ui/ProjectModals';

import { ProjectCard } from './Projects/ProjectCard';

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {projects.map(project => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onAddSession={(id) => {
                setActiveProjectId(id);
                setIsSessionModalOpen(true);
              }}
            />
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
