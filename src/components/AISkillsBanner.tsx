'use client';

import { Sparkles, ChevronRight, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AISkillsBannerProps {
  onRecommend: () => void;
  isRecommending?: boolean;
}

export function AISkillsBanner({ onRecommend, isRecommending }: AISkillsBannerProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mb-8 p-6 rounded-3xl bg-indigo-950/20 border border-indigo-500/30 backdrop-blur-xl overflow-hidden group"
    >
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] -z-10 rounded-full group-hover:bg-indigo-500/20 transition-all duration-700" />
      
      <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/50 flex items-center justify-center text-indigo-400 min-w-[48px] shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
               <AlertTriangle className="w-4 h-4 text-amber-400" />
               <h4 className="text-sm font-bold text-slate-200 uppercase tracking-widest">AI Flow Insight</h4>
            </div>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              Caution: This project requires <span className="text-indigo-400 font-bold">'Cloud Infrastructure'</span> skills. No one on the current team has this. 
              Efficiency is projected to drop by <span className="text-rose-400 font-bold">14%</span> without optimization.
            </p>
          </div>
        </div>

        <button 
          onClick={onRecommend}
          disabled={isRecommending}
          className={cn(
            "px-6 py-3 rounded-full bg-cyan-500 text-[#020617] text-xs font-bold uppercase tracking-[0.1em] shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all flex items-center gap-2 hover:scale-105 active:scale-95",
            isRecommending && "opacity-50 cursor-not-allowed"
          )}
        >
          {isRecommending ? "Scanning Bench..." : "See Recommendations"}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
