'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Zap, Shield, Cpu } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
      setLoading(false);
    } else {
      window.location.href = '/';
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setMessage(error.message);
    else setMessage('Check your email for the confirmation link!');
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setMessage(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#fbfaf8] flex items-center justify-center p-8">
      <div className="max-w-md w-full space-y-12">
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-[#d97757] rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-[#d97757]/20"
          >
            <Cpu className="text-white" size={32} />
          </motion.div>
          <h1 className="text-3xl font-bold font-serif text-gray-900 tracking-tight">Architect's Workbench</h1>
          <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Neural Deliberation Protocol</p>
        </div>

        <form onSubmit={handleLogin} className="clean-panel p-10 space-y-8 bg-white/40 backdrop-blur-md">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Neural Identity (Email)</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-[#e5e2d9] rounded-xl p-4 text-sm focus:outline-none focus:border-[#d97757]/40 focus:bg-white transition-all shadow-inner"
                placeholder="architect@neural.mesh"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Access Key (Password)</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-[#e5e2d9] rounded-xl p-4 text-sm focus:outline-none focus:border-[#d97757]/40 focus:bg-white transition-all shadow-inner"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {message && <p className="text-xs text-[#d97757] font-bold text-center">{message}</p>}

          <div className="flex flex-col gap-4">
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#d97757] text-white rounded-2xl font-bold text-sm shadow-xl shadow-[#d97757]/10 hover:bg-[#c6654a] transition-all disabled:opacity-50"
            >
              {loading ? 'INITIALIZING...' : 'AUTHORIZE ACCESS'}
            </button>
            
            <div className="relative py-4 flex items-center gap-4">
              <div className="flex-1 h-[1px] bg-[#e5e2d9]" />
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">or</span>
              <div className="flex-1 h-[1px] bg-[#e5e2d9]" />
            </div>

            <button 
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-4 bg-white border border-[#e5e2d9] text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              CONTINUE WITH GOOGLE
            </button>

            <button 
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="w-full py-4 text-gray-400 font-bold text-[10px] uppercase tracking-widest hover:text-gray-600 transition-all"
            >
              REQUEST NEW CREDENTIALS
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
            <Shield size={12} /> Secure Multi-Agent Environment
          </p>
        </div>
      </div>
    </div>
  );
}
