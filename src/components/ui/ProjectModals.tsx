'use client';

import { useState } from 'react';
import { useCouncilStore } from '@/store/useCouncilStore';
import { X, Check, BrainCircuit, Shield, Database, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function CreateProjectModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [name, setName] = useState('');
  const [selectedModels, setSelectedModels] = useState<string[]>(['llama-3.3-70b']);
  const { createProject, catalog } = useCouncilStore();

  const handleCreate = () => {
    if (!name) return;
    createProject(name, selectedModels);
    onClose();
    setName('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#e5e2d9] overflow-hidden"
      >
        <div className="p-8 border-b border-[#e5e2d9] flex justify-between items-center">
          <h2 className="text-xl font-bold font-serif text-gray-900">Initiate New Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Project Name</label>
            <input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 border border-[#e5e2d9] rounded-2xl p-4 text-sm focus:outline-none focus:border-[#d97757] transition-all"
              placeholder="e.g., NEURAL ARCHITECTURE V2"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Primary Neural Engines</label>
            <div className="grid grid-cols-2 gap-2">
              {catalog.slice(0, 4).map(model => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModels(prev => prev.includes(model.id) ? prev.filter(m => m !== model.id) : [...prev, model.id])}
                  className={`p-3 rounded-xl border text-[11px] font-bold transition-all flex items-center gap-2 ${selectedModels.includes(model.id) ? 'bg-[#d97757]/5 border-[#d97757] text-[#d97757]' : 'bg-white border-[#e5e2d9] text-gray-400'}`}
                >
                  <div className={`w-2 h-2 rounded-full ${selectedModels.includes(model.id) ? 'bg-[#d97757]' : 'bg-gray-200'}`} />
                  {model.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-8 bg-gray-50 flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 text-gray-400 font-bold text-sm hover:text-gray-600 transition-all uppercase tracking-widest">Cancel</button>
          <button onClick={handleCreate} className="flex-1 py-4 bg-[#d97757] text-white rounded-2xl font-bold text-sm shadow-xl shadow-[#d97757]/20 hover:bg-[#c6654a] transition-all uppercase tracking-widest">Create Project</button>
        </div>
      </motion.div>
    </div>
  );
}

export function CreateSessionModal({ isOpen, onClose, projectId }: { isOpen: boolean, onClose: () => void, projectId: string }) {
  const [name, setName] = useState('');
  const [persistMemory, setPersistMemory] = useState(true);
  const { createSession } = useCouncilStore();

  const handleCreate = () => {
    if (!name) return;
    createSession(projectId, name, persistMemory);
    onClose();
    setName('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-[#e5e2d9] overflow-hidden"
      >
        <div className="p-8 border-b border-[#e5e2d9] flex justify-between items-center">
          <h2 className="text-xl font-bold font-serif text-gray-900">New Session</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Session Label</label>
            <input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 border border-[#e5e2d9] rounded-2xl p-4 text-sm focus:outline-none focus:border-[#d97757] transition-all"
              placeholder="e.g., ARCHI"
            />
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-[#e5e2d9]">
            <div className="flex items-center gap-3">
              <Database size={18} className="text-gray-400" />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-800 uppercase tracking-widest">Persist Memory</span>
                <span className="text-[9px] text-gray-400">Sync council state across turns</span>
              </div>
            </div>
            <button 
              onClick={() => setPersistMemory(!persistMemory)}
              className={`w-12 h-6 rounded-full relative transition-all ${persistMemory ? 'bg-[#d97757]' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${persistMemory ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
        </div>
        <div className="p-8 bg-white border-t border-[#e5e2d9] flex gap-4">
          <button onClick={handleCreate} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-gray-800 transition-all uppercase tracking-widest">Confirm Session</button>
        </div>
      </motion.div>
    </div>
  );
}
