'use client';

import { useCouncilStore } from '@/store/useCouncilStore';
import { History, BookOpen, FileCode, Trash2, Play, Download, Clock, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LibraryView() {
  const { blueprints, libraryItems, loadBlueprint, setView } = useCouncilStore();

  return (
    <div className="h-full overflow-y-auto p-12 bg-[#fbfaf8]">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 font-serif">The Library</h1>
          <p className="text-gray-500 max-w-md text-sm leading-relaxed">
            Access saved neural frameworks, historical deliberation logs, and generated intellectual assets.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Neural Blueprints */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <History className="text-[#d97757]" size={20} />
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-800">Neural Blueprints</h2>
            </div>
            
            <div className="space-y-4">
              {blueprints.length === 0 ? (
                <div className="p-8 clean-panel border-dashed text-center text-gray-400 italic text-sm">
                  No saved blueprints found. Save a council configuration to see it here.
                </div>
              ) : (
                blueprints.map((bp) => (
                  <div key={bp.id} className="clean-panel p-6 flex justify-between items-center group hover:border-[#d97757]/40 transition-all shadow-sm">
                    <div className="space-y-1">
                      <h3 className="font-bold text-gray-900">{bp.name}</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{bp.nodes.length} Members // Standard Layout</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { loadBlueprint(bp.id); setView('workspace'); }}
                        className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:bg-[#d97757] hover:text-white transition-all"
                      >
                        <Play size={16} fill="currentColor" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Intellectual Assets */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="text-[#d97757]" size={20} />
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-800">Intellectual Assets</h2>
            </div>

            <div className="space-y-4">
              {libraryItems.length === 0 ? (
                <div className="p-8 clean-panel border-dashed text-center text-gray-400 italic text-sm">
                  The archive is empty. Deliberate to generate assets.
                </div>
              ) : (
                libraryItems.map((item) => (
                  <div key={item.id} className="clean-panel p-6 space-y-4 group hover:border-[#d97757]/40 transition-all shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-50 text-[#d97757]">
                          {item.type === 'code' ? <FileCode size={18} /> : <Clock size={18} />}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm">{item.title}</h3>
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                            {new Date(item.timestamp).toLocaleDateString()} // {item.type.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <button className="p-2 text-gray-300 hover:text-[#d97757] transition-colors">
                        <Download size={16} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {item.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
