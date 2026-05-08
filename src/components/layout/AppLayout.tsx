'use client';

import Sidebar from './Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useCouncilStore } from '@/store/useCouncilStore';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen w-full bg-[#fbfaf8] text-gray-900 overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header bar */}
        <div className="h-16 border-b border-[#e5e2d9] bg-white/50 backdrop-blur-md flex items-center justify-between px-8 z-20">
          <div className="flex items-center gap-4">
            <h2 className="text-xs font-bold tracking-widest text-gray-400 uppercase">
              Current Project / <span className="text-gray-900">Neural Council v1</span>
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold border border-green-100">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              SYSTEM ONLINE
            </div>
            <button 
              onClick={handleSignOut}
              className="text-[10px] font-bold text-gray-400 hover:text-[#d97757] transition-all flex items-center gap-2 uppercase tracking-widest"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
