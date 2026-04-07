'use client';

import { Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface OracleBriefingProps {
  isOpen?: boolean;
}

export function OracleBriefing({ isOpen }: OracleBriefingProps) {
  return (
    <div className={cn(
      "w-full bg-[#020914] border-b border-cyan-900/30 flex items-center py-6 pl-8 overflow-hidden z-20 shadow-[0_5px_20px_rgba(0,0,0,0.3)] transition-all duration-500",
      isOpen ? "pr-[392px]" : "pr-8"
    )}>
      <div className="flex items-center gap-4 flex-1">
        <div className="w-8 h-8 rounded-full bg-indigo-950/60 border border-indigo-500/40 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
           <Bot className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="flex items-center gap-3 font-mono tracking-wide text-indigo-100/70 whitespace-nowrap overflow-hidden relative">
          <span className="text-indigo-400 font-bold uppercase text-sm tracking-widest shrink-0">Briefing:</span>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 2, type: 'spring' }}
            className="flex-1 text-slate-300 font-sans tracking-normal"
          >
            Current Momentum is high. All Streams are healthy. Oracle suggests reallocating 2 Drops from Developer B to Developer A to optimize for Friday’s milestone.
          </motion.div>
        </div>
      </div>
    </div>
  );
}
