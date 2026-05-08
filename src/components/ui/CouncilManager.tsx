'use client';

import { useState } from 'react';
import { useCouncilStore } from '@/store/useCouncilStore';
import { Plus, Trash2, Shield, Zap, Target, Cpu, Search, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { ROLES, PROVIDERS, AVAILABLE_MODELS } from '@/lib/constants';

export default function CouncilManager() {
  const { nodes, addNode, removeNode, updateNode, autoAssembleCouncil, saveCurrentCouncilAsBlueprint } = useCouncilStore();
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high' | 'xhigh' | 'max'>('medium');
  const [orchestrationTask, setOrchestrationTask] = useState('');
  const [isAssembling, setIsAssembling] = useState(false);

  const handleAutoAssemble = async () => {
    setIsAssembling(true);
    try {
      await autoAssembleCouncil(intensity, orchestrationTask);
    } finally {
      setIsAssembling(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-12 bg-[#fbfaf8]">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 font-serif">Council Chamber</h1>
            <p className="text-gray-500 max-w-md text-sm leading-relaxed">
              Assemble your neural specialized agents. Each member contributes a unique perspective to the deliberation mesh.
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => {
                const name = window.prompt("Enter a name for this Neural Blueprint:");
                if (name) saveCurrentCouncilAsBlueprint(name);
              }}
              className="flex items-center gap-2 bg-white border border-[#e5e2d9] text-gray-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all shadow-sm"
            >
              <Shield size={18} /> SAVE BLUEPRINT
            </button>
            <button 
              onClick={addNode}
              className="flex items-center gap-2 bg-[#d97757] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#d97757]/20 hover:bg-[#c6654a] transition-all"
            >
              <Plus size={18} /> SUMMON MEMBER
            </button>
          </div>
        </div>

        {/* Architectural Presets (AI Orchestration) */}
        <div className="clean-panel p-8 rounded-3xl bg-white shadow-sm border-[#e5e2d9] space-y-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-[#d97757]/10 text-[#d97757]">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">AI Orchestration</h2>
              <p className="text-sm text-gray-500">Let the Council Architect assemble the optimal team for your specific task.</p>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {['low', 'medium', 'high', 'xhigh', 'max'].map((level) => (
              <button
                key={level}
                onClick={() => setIntensity(level as any)}
                className={`px-4 py-3 rounded-xl border-2 transition-all font-bold text-xs uppercase tracking-widest ${
                  intensity === level 
                    ? 'border-[#d97757] bg-[#d97757] text-white shadow-lg' 
                    : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input 
                type="text" 
                value={orchestrationTask}
                onChange={(e) => setOrchestrationTask(e.target.value)}
                placeholder="Describe the challenge (e.g. 'Build a novel mathematical AI architecture')..."
                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:bg-white focus:border-[#d97757]/40 transition-all shadow-inner"
              />
            </div>
            <button 
              onClick={handleAutoAssemble}
              disabled={!orchestrationTask || isAssembling}
              className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-all shadow-xl shadow-black/10 disabled:opacity-20 flex items-center gap-3"
            >
              {isAssembling ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ASSEMBLING...
                </>
              ) : (
                'AUTO-ASSEMBLE'
              )}
            </button>
          </div>
        </div>

        {/* Search/Filter Bar */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search agents by name or role..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-[#e5e2d9] rounded-xl text-sm focus:outline-none focus:border-[#d97757]/40 shadow-sm"
            />
          </div>
          <div className="px-4 py-3 bg-white border border-[#e5e2d9] rounded-xl text-sm font-medium text-gray-500 shadow-sm">
            Total Capacity: <span className="text-[#d97757]">{nodes.length} / 12</span>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {nodes.map((node, idx) => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={node.id} 
              className="clean-panel p-8 space-y-6 hover:shadow-xl transition-shadow group relative"
            >
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-2xl bg-gray-50 text-[#d97757] group-hover:bg-[#d97757] group-hover:text-white transition-colors`}>
                  <Cpu size={24} />
                </div>
                <button 
                  onClick={() => removeNode(node.id)}
                  className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="space-y-1">
                <input 
                  value={node.name}
                  onChange={(e) => updateNode(node.id, { name: e.target.value })}
                  className="bg-transparent font-bold text-xl text-gray-900 border-none outline-none focus:text-[#d97757] w-full"
                />
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{node.role}</p>
              </div>

              <div className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 font-bold uppercase">Intelligence Model</label>
                  <select 
                    value={node.model}
                    onChange={(e) => updateNode(node.id, { model: e.target.value })}
                    className="w-full bg-gray-50 border border-transparent rounded-lg p-2.5 text-xs text-gray-700 focus:bg-white focus:border-[#e5e2d9] outline-none transition-all"
                  >
                    {node.provider === 'nvidia' 
                      ? Object.values(AVAILABLE_MODELS.NIM).map(m => <option key={m} value={m}>{m}</option>)
                      : Object.values(AVAILABLE_MODELS.OLLAMA).map(m => <option key={m} value={m}>{m}</option>)
                    }
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div className="space-y-1">
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Success Rate</p>
                    <p className="text-sm font-bold text-green-600">94.2%</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Avg Latency</p>
                    <p className="text-sm font-bold text-gray-700">1.2s</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {nodes.length === 0 && (
            <div className="col-span-full py-24 clean-panel border-dashed border-2 flex flex-col items-center justify-center text-gray-400 gap-4">
              <Shield size={48} className="opacity-10" />
              <p className="font-medium italic">The chamber is empty. Summon your first member.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
