'use client';

import React from 'react';

export function BurndownChart() {
  // Mock data for a "burndown" effect
  // Ideal line: (0, 0) to (100, 20) in this mini coordinate space
  // Actual line: some variation
  return (
    <div className="w-16 h-8 relative group/chart">
      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
        {/* Guideline (Ideal) */}
        <line 
          x1="0" y1="5" x2="100" y2="35" 
          stroke="currentColor" 
          strokeWidth="1" 
          strokeDasharray="2 2" 
          className="text-slate-700" 
        />
        
        {/* Actual Burndown Path */}
        <path
          d="M 0 5 L 20 8 L 40 12 L 60 25 L 80 28 L 100 35"
          fill="none"
          stroke="url(#burndownGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-[0_0_8px_rgba(20,184,166,0.5)]"
        />
        
        <defs>
          <linearGradient id="burndownGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#2dd4bf" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Percentage complete indicator on hover */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-teal-500/30 rounded px-1.5 py-0.5 opacity-0 group-hover/chart:opacity-100 transition-opacity pointer-events-none">
        <span className="text-[8px] font-bold text-teal-400 whitespace-nowrap">72% DONE</span>
      </div>
    </div>
  );
}
