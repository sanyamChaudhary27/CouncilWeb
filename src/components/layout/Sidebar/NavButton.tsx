'use client';

import { motion } from 'framer-motion';
import { useCouncilStore } from '@/store/useCouncilStore';

interface NavButtonProps {
  item: { id: string; label: string; icon: any };
  isActive: boolean;
  isNested?: boolean;
}

export const NavButton = ({ item, isActive, isNested = false }: NavButtonProps) => {
  const { setView } = useCouncilStore();
  const Icon = item.icon;

  return (
    <button
      onClick={() => setView(item.id)}
      className={`w-full flex items-center gap-3 ${isNested ? 'pl-10 pr-4 py-1.5' : 'px-4 py-2.5'} rounded-xl transition-all-300 group relative ${
        isActive 
          ? 'bg-[#fbfaf8] text-[#d97757] shadow-sm' 
          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
      }`}
    >
      {Icon && <Icon size={isNested ? 14 : 18} className={isActive ? 'text-[#d97757]' : 'text-gray-400 group-hover:text-gray-600'} />}
      <span className={`hidden lg:block font-medium ${isNested ? 'text-[11px] uppercase tracking-wider' : 'text-sm'} ${isActive ? 'text-gray-900' : ''}`}>
        {item.label}
      </span>
      {isActive && !isNested && (
        <motion.div 
          layoutId="active-pill"
          className="absolute left-0 w-1 h-5 bg-[#d97757] rounded-r-full"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
    </button>
  );
};
