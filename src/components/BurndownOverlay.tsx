'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, Download, TrendingDown, Crosshair, TrendingUp } from 'lucide-react';
import { SmartBurndownChart } from './SmartBurndownChart';

interface BurndownOverlayProps {
  onClose: () => void;
}

export function BurndownOverlay({ onClose }: BurndownOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[500] bg-[#020617]/90 backdrop-blur-2xl flex flex-col p-8"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            <TrendingDown className="w-8 h-8 text-teal-400" />
            Project Burndown Analysis
          </h2>
          <p className="text-slate-400 mt-2">Predictive trajectory and scope creep monitoring.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 border border-white/10 rounded-xl text-sm font-bold text-slate-200 transition-colors">
            <Download className="w-4 h-4" />
            Export Data
          </button>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800/50 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-8 min-h-0">
        
        {/* Main Chart Area */}
        <div className="flex-1 bg-[#0a192f]/40 border border-white/10 rounded-3xl p-8 relative overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]">
           <SmartBurndownChart />
        </div>

        {/* The Table Farm / Comparative Metrics Sidebar */}
        <div className="w-80 shrink-0 flex flex-col gap-4">
          
          <div className="bg-[#0a192f]/60 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              <TrendingDown className="w-4 h-4 text-teal-400" /> Current Velocity
            </div>
            <div className="text-4xl font-bold text-slate-100 font-mono tracking-tight">1.2 <span className="text-sm font-medium text-slate-500 font-sans tracking-normal">Drops/Day</span></div>
            <div className="text-xs font-medium text-emerald-400 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +0.2 from last week
            </div>
          </div>

          <div className="bg-[#0a192f]/60 backdrop-blur-md border border-amber-500/20 rounded-2xl p-6 flex flex-col gap-2 shadow-[0_0_20px_rgba(245,158,11,0.05)]">
            <div className="flex items-center gap-2 text-[10px] font-bold text-amber-500/80 uppercase tracking-widest mb-2">
              <TrendingUp className="w-4 h-4 text-amber-500" /> Scope Creep
            </div>
            <div className="text-4xl font-bold text-slate-100 font-mono tracking-tight">+15<span className="text-2xl">%</span></div>
            <div className="text-xs font-medium text-slate-400 mt-2">
              Since Genesis Baseline
            </div>
            <div className="mt-4 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
              <div className="h-full bg-slate-500" style={{ width: '85%' }} />
              <div className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" style={{ width: '15%' }} />
            </div>
          </div>

          <div className="bg-[#0a192f]/60 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-6 flex flex-col gap-2 shadow-[0_0_20px_rgba(34,211,238,0.05)]">
            <div className="flex items-center gap-2 text-[10px] font-bold text-cyan-400/80 uppercase tracking-widest mb-2">
              <Crosshair className="w-4 h-4 text-cyan-400" /> Predictive Accuracy
            </div>
            <div className="text-4xl font-bold text-slate-100 font-mono tracking-tight">94<span className="text-2xl">%</span></div>
            <div className="text-xs font-medium text-slate-400 mt-2">
              Historical Forecast Match
            </div>
          </div>

          {/* Legend */}
          <div className="bg-[#0a192f]/40 border border-white/5 rounded-2xl p-6 flex-1 mt-4">
             <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Chart Legend</h4>
             <div className="flex flex-col gap-3 text-xs font-medium text-slate-300">
               <div className="flex items-center gap-3"><div className="w-4 h-1 rounded-full bg-slate-500 opacity-50 border-t border-dashed border-white" /> Ideal Burn</div>
               <div className="flex items-center gap-3"><div className="w-4 h-1.5 rounded-full bg-amber-500" /> Total Scope</div>
               <div className="flex items-center gap-3"><div className="w-4 h-1.5 rounded-full bg-teal-500" /> Actual Progress</div>
               <div className="flex items-center gap-3"><div className="w-4 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" /> AI Forecast</div>
             </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
}
