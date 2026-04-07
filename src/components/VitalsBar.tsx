'use client';

import { Activity, Brain, Coins, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VitalsBarProps {
  isOpen?: boolean;
}

export function VitalsBar({ isOpen }: VitalsBarProps) {
  return (
    <div className={cn(
      "flex items-center gap-6 py-4 bg-slate-900/40 backdrop-blur-xl border-b border-white/10 z-20 pl-8 transition-all duration-500",
      isOpen ? "pr-[392px]" : "pr-8"
    )}>
      
      {/* Project Health */}
      <div className="flex-1 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4 flex items-center gap-4 shadow-inner shadow-cyan-900/5 hover:border-cyan-500/20 transition-colors group">
        <div className="w-12 h-12 rounded-full border-[3px] border-slate-700 relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-[3px] border-green-500/80 [clip-path:inset(0_0_0_15%)]" />
          <Activity className="w-5 h-5 text-green-500" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Project Health</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-100 group-hover:text-green-50 transition-colors">88%</span>
            <span className="text-[10px] text-green-500/70 font-bold uppercase tracking-wider">On Track</span>
          </div>
        </div>
      </div>

      {/* AI Forecast */}
      <div className="flex-1 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4 flex items-center gap-4 shadow-inner shadow-indigo-900/5 hover:border-indigo-500/20 transition-colors group">
        <div className="w-10 h-10 rounded-xl bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-center">
          <Brain className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Oracle Forecast</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-100 group-hover:text-indigo-50 transition-colors">Jun 12, 2024</span>
            <span className="text-[10px] text-green-500/70 font-bold tracking-widest uppercase">92% CONF</span>
          </div>
        </div>
      </div>

      {/* Operational Burn */}
      <div className="flex-1 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4 flex items-center gap-4 shadow-inner shadow-teal-900/5 hover:border-teal-500/20 transition-colors group">
        <div className="w-10 h-10 rounded-xl bg-teal-950/40 border border-teal-500/20 flex items-center justify-center">
          <Coins className="w-5 h-5 text-teal-400" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Infrastructure Burn</p>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xl font-bold text-slate-100 group-hover:text-teal-50 transition-colors">$142.50</span>
            <svg className="w-12 h-4 text-teal-500/50" viewBox="0 0 100 20" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M0 20 L20 15 L40 18 L60 5 L80 10 L100 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
               <path d="M0 20 L20 15 L40 18 L60 5 L80 10 L100 0 L100 20 L0 20 Z" fill="currentColor" opacity="0.2"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Active Blockers */}
      <div className="flex-1 bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4 flex items-center gap-4 shadow-inner shadow-rose-900/5 hover:border-rose-500/30 transition-colors group">
        <div className="w-10 h-10 rounded-full bg-rose-950/30 border border-rose-500/30 flex items-center justify-center relative">
          <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping opacity-50" />
          <AlertTriangle className="w-5 h-5 text-rose-500 relative z-10" />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Blockers</p>
          <span className="text-xl font-bold text-slate-100 group-hover:text-rose-100">1</span>
        </div>
      </div>

    </div>
  );
}
