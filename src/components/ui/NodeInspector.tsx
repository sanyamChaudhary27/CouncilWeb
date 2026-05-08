'use client';

import { useCouncilStore } from '@/store/useCouncilStore';
import { PROVIDERS, ROLES, AVAILABLE_MODELS } from '@/lib/constants';
import { X, Trash2, Cpu, Tag, Settings2 } from 'lucide-react';
import { ModelProvider, NodeRole } from '@/types';

export default function NodeInspector() {
  const { nodes, selectedNodeId, selectNode, updateNode, removeNode } = useCouncilStore();
  
  if (!selectedNodeId) return null;
  
  const node = nodes.find(n => n.id === selectedNodeId);
  if (!node) return null;

  const handleProviderChange = (provider: ModelProvider) => {
    const defaultModel = provider === 'nvidia' 
      ? AVAILABLE_MODELS.NIM.MISTRAL_LARGE 
      : AVAILABLE_MODELS.OLLAMA.LLAMA3;
    
    updateNode(node.id, { provider, model: defaultModel });
  };

  const getAvailableModelsForProvider = () => {
    if (node.provider === 'nvidia') return Object.values(AVAILABLE_MODELS.NIM);
    if (node.provider === 'ollama') return Object.values(AVAILABLE_MODELS.OLLAMA);
    return [];
  };

  return (
    <div className="absolute right-8 top-32 w-80 clean-panel !rounded-3xl border-[#e5e2d9] z-30 animate-in slide-in-from-right-8 duration-500 shadow-2xl">
      <div className="p-6 border-b border-[#e5e2d9] flex justify-between items-center bg-white/40 rounded-t-3xl">
        <h3 className="font-bold text-gray-800 tracking-tight flex items-center gap-2 text-sm">
          <Settings2 size={16} className="text-[#d97757]" /> NODE SETTINGS
        </h3>
        <button onClick={() => selectNode(null)} className="text-gray-400 hover:text-[#d97757] transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
             Identification
          </label>
          <div className="text-xs font-mono text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-[#e5e2d9]">
            {node.id}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
            Compute Provider
          </label>
          <select 
            value={node.provider}
            onChange={(e) => handleProviderChange(e.target.value as ModelProvider)}
            className="w-full bg-white border border-[#e5e2d9] rounded-xl p-3 text-xs text-gray-800 focus:border-[#d97757]/40 outline-none shadow-sm transition-all-200"
          >
            {PROVIDERS.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Intelligence Engine
          </label>
          <select 
            value={node.model}
            onChange={(e) => updateNode(node.id, { model: e.target.value })}
            className="w-full bg-white border border-[#e5e2d9] rounded-xl p-3 text-xs text-gray-800 focus:border-[#d97757]/40 outline-none shadow-sm transition-all-200"
          >
            {getAvailableModelsForProvider().map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Council Persona
          </label>
          <select 
            value={node.role}
            onChange={(e) => updateNode(node.id, { role: e.target.value as NodeRole, name: `${e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1)} Node` })}
            className="w-full bg-white border border-[#e5e2d9] rounded-xl p-3 text-xs text-gray-800 focus:border-[#d97757]/40 outline-none shadow-sm transition-all-200 capitalize"
          >
            {ROLES.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-6 border-t border-[#e5e2d9] bg-gray-50/50 rounded-b-3xl">
        <button 
          onClick={() => removeNode(node.id)}
          className="w-full py-3 flex items-center justify-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 transition-all-200 text-[11px] font-bold tracking-wider uppercase"
        >
          <Trash2 size={16} /> DECOMMISSION MEMBER
        </button>
      </div>
    </div>
  );
}
