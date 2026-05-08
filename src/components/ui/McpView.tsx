'use client';

import { useCouncilStore } from '@/store/useCouncilStore';
import { Wrench, Zap, Check, X, Shield, Settings, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export default function McpView() {
  const { mcpTools, toggleMcpTool } = useCouncilStore();

  return (
    <div className="h-full overflow-y-auto p-12 bg-[#fbfaf8]">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 font-serif">MCP Control Center</h1>
            <p className="text-gray-500 max-w-md text-sm leading-relaxed">
              Activate and configure Model Context Protocol (MCP) tools for your council.
            </p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-[#d97757] text-white rounded-2xl font-bold text-sm shadow-xl shadow-[#d97757]/10 hover:bg-[#c6654a] transition-all">
            <Wrench size={18} /> INSTALL TOOL
          </button>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mcpTools.map((tool) => (
            <motion.div 
              key={tool.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`clean-panel p-8 space-y-6 bg-white transition-all border-[#e5e2d9] ${tool.active ? 'ring-2 ring-[#d97757]/20 border-[#d97757]/40' : 'opacity-70 grayscale'}`}
            >
              <div className="flex justify-between items-start">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tool.active ? 'bg-[#d97757]/10 text-[#d97757]' : 'bg-gray-100 text-gray-400'}`}>
                  <Zap size={24} fill={tool.active ? "currentColor" : "none"} />
                </div>
                <button 
                  onClick={() => toggleMcpTool(tool.id)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all ${tool.active ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}
                >
                  {tool.active ? 'Active' : 'Disabled'}
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-gray-900 tracking-tight">{tool.name}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{tool.description}</p>
              </div>

              <div className="pt-4 border-t border-[#e5e2d9] flex justify-between items-center">
                <div className="flex gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-400" />
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Protocol v1.2</span>
                </div>
                <Settings size={14} className="text-gray-300 hover:text-gray-600 cursor-pointer transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
