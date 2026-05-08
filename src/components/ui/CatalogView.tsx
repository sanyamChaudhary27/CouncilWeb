'use client';

import { useCouncilStore } from '@/store/useCouncilStore';
import { Database, Grid, Cpu, Key, Activity, ShieldCheck, Globe, Download, Trash2, Import } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

export default function CatalogView() {
  const { catalog, updateCatalogLatency } = useCouncilStore();

  useEffect(() => {
    // Simulate real-time latency monitoring
    const interval = setInterval(() => {
      catalog.forEach(model => {
        if (model.status === 'active') {
          const latency = Math.floor(Math.random() * 150) + 100;
          updateCatalogLatency(model.id, latency);
        }
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [catalog, updateCatalogLatency]);

  return (
    <div className="h-full overflow-y-auto p-12 bg-[#fbfaf8]">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 font-serif">Model Catalog</h1>
            <p className="text-gray-500 max-w-md text-sm leading-relaxed">
              Activate neural engines and manage provider credentials.
            </p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-gray-900/10 hover:bg-gray-800 transition-all uppercase tracking-widest">
            <Key size={18} /> Manage Keys
          </button>
        </div>

        {/* Catalog Table */}
        <div className="clean-panel bg-white/40 backdrop-blur-md border-[#e5e2d9] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-[#e5e2d9]">
              <tr>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Model Engine</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Provider</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Latency</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e2d9]">
              {catalog.map((model) => (
                <tr key={model.id} className="hover:bg-white/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl bg-white border border-[#e5e2d9] flex items-center justify-center ${model.status === 'active' ? 'text-[#d97757]' : 'text-gray-300'}`}>
                        <Cpu size={20} />
                      </div>
                      <span className={`font-bold text-sm tracking-tight ${model.status === 'active' ? 'text-gray-900' : 'text-gray-400'}`}>{model.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <Globe size={14} className="text-gray-400" />
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{model.provider}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <Activity size={14} className={model.status === 'active' ? 'text-green-500' : 'text-gray-200'} />
                      <span className={`text-[10px] font-bold ${model.status === 'active' ? 'text-gray-600' : 'text-gray-300'}`}>
                        {model.status === 'active' ? `${model.latency || 240}ms` : '--'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    {model.status === 'active' ? (
                      <button className="p-2 text-gray-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 size={16} />
                      </button>
                    ) : (
                      <button className="flex items-center gap-2 ml-auto px-4 py-2 bg-white border border-[#e5e2d9] rounded-xl text-[10px] font-bold text-gray-400 hover:text-[#d97757] hover:border-[#d97757] transition-all uppercase tracking-widest">
                        <Import size={14} /> Import
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
