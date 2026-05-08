'use client';

import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-[#fbfaf8] flex items-center justify-center p-8 text-center">
      <div className="max-w-md w-full space-y-8">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 bg-red-50 rounded-3xl mx-auto flex items-center justify-center text-red-500 shadow-xl shadow-red-500/10"
        >
          <AlertCircle size={32} />
        </motion.div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold font-serif text-gray-900">Authorization Failed</h1>
          <p className="text-gray-500 text-sm">
            We encountered an unexpected error while synchronizing your identity.
          </p>
        </div>
        <div className="clean-panel p-6 bg-red-50/50 border-red-100 text-left space-y-4">
          <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Troubleshooting Guide</p>
          <ul className="text-xs text-gray-600 space-y-2 list-disc pl-4">
            <li>Ensure <b>Google OAuth</b> is correctly configured in your Supabase Dashboard.</li>
            <li>Verify your <b>Client Secret</b> matches exactly (no trailing spaces).</li>
            <li>Check that your <b>Redirect URI</b> includes <code className="bg-white px-1">/auth/callback</code>.</li>
          </ul>
        </div>
        <Link 
          href="/login"
          className="inline-flex items-center gap-2 text-[#d97757] font-bold text-sm hover:gap-3 transition-all"
        >
          <ArrowLeft size={16} /> RETURN TO GATEWAY
        </Link>
      </div>
    </div>
  );
}
