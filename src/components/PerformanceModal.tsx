'use client';

import { motion } from 'framer-motion';
import { Zap, Trophy, History, CheckCircle2, TrendingUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { Employee } from '@/lib/mockRoster';
import { cn } from '@/lib/utils';

interface PerformanceModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PerformanceModal({ employee, isOpen, onOpenChange }: PerformanceModalProps) {
  if (!employee) return null;

  // Chart Dimensions
  const chartWidth = 500;
  const chartHeight = 200;
  const padding = 20;
  
  // Calculate points for the line chart
  const points = employee.history.map((h, i) => {
    const x = (i / (employee.history.length - 1)) * (chartWidth - padding * 2) + padding;
    const y = chartHeight - (h.velocity / 120) * (chartHeight - padding * 2) - padding;
    return `${x},${y}`;
  }).join(' ');

  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { pathLength: 1, opacity: 1, transition: { duration: 1.5, ease: 'easeInOut' as any } }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-white/10 bg-[#0a192f]/95 backdrop-blur-3xl">
        <div className="flex flex-col md:flex-row h-full">
          {/* Left Sidebar: Profile Summary */}
          <div className="w-full md:w-80 bg-slate-900/40 p-8 border-r border-white/10 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-950 to-[#0a192f] border border-emerald-800/30 flex items-center justify-center text-4xl font-bold text-emerald-200 shadow-2xl mb-6">
              {employee.name.charAt(0)}
            </div>
            <DialogHeader className="p-0 space-y-0 text-center items-center">
              <DialogTitle className="text-2xl font-bold text-white mb-1 leading-tight tracking-tight">
                {employee.name}
              </DialogTitle>
              <DialogDescription className="text-emerald-400 font-mono text-sm tracking-widest mb-8">
                {employee.role}
              </DialogDescription>
            </DialogHeader>
            
            <div className="w-full space-y-4">
              <div className="p-4 rounded-xl bg-[#0a192f]/60 border border-white/5 flex items-center justify-between group/meter relative">
                <div className="flex items-center gap-3">
                   <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400"><TrendingUp className="w-4 h-4" /></div>
                   <span className="text-xs text-slate-400 uppercase font-bold tracking-tight">Reliability</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-lg font-bold text-teal-400">{employee.reliability}%</span>
                  <div className="w-24 h-1 bg-slate-800 rounded-sm overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-sm" style={{ width: `${employee.reliability}%` }} />
                  </div>
                </div>
                {/* Tooltip */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 border border-white/10 rounded text-[10px] text-slate-300 opacity-0 group-hover/meter:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                   Consistency Score: <span className="text-emerald-400">{employee.reliability}%</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#0a192f]/60 border border-white/5 flex items-center justify-between group/meter relative">
                <div className="flex items-center gap-3">
                   <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400"><Zap className="w-4 h-4" /></div>
                   <span className="text-xs text-slate-400 uppercase font-bold tracking-tight">Avg Flow</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-lg font-bold text-teal-400">{employee.avgVelocity}</span>
                  <div className="w-24 h-1 bg-slate-800 rounded-sm overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-sm" style={{ width: `${(employee.avgVelocity / 120) * 100}%` }} />
                  </div>
                </div>
                {/* Tooltip */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 border border-white/10 rounded text-[10px] text-slate-300 opacity-0 group-hover/meter:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                   Average Output: <span className="text-teal-400">{employee.avgVelocity}</span> PTS
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Performance Metrics */}
          <div className="flex-1 pt-14 px-8 pb-8 space-y-10">
            {/* Historical Velocity Chart */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <History className="w-4 h-4 text-teal-500/70" />
                   Historical Velocity (6M)
                </h3>
                <span className="text-[10px] text-slate-500 font-mono tracking-widest">UNIT: PTS / DROP</span>
              </div>
              
              <div className="relative h-56 bg-black/30 rounded-3xl border border-white/5 p-4 overflow-hidden group">
                 <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
                    {/* Grid Lines */}
                    {[0, 1, 2, 3].map(line => (
                      <line 
                        key={line} 
                        x1="0" 
                        y1={(line/3) * (chartHeight - padding*2) + padding} 
                        x2={chartWidth} 
                        y2={(line/3) * (chartHeight - padding*2) + padding} 
                        stroke="rgba(255,255,255,0.05)" 
                        strokeWidth="1" 
                      />
                    ))}
                    {/* The Path */}
                    <motion.polyline
                      points={points}
                      fill="none"
                      stroke="url(#performance-gradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial="hidden"
                      animate="visible"
                      variants={pathVariants}
                    />
                    <defs>
                      <linearGradient id="performance-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#0d9488" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                    {/* Data Points */}
                    {employee.history.map((h, i) => {
                       const x = (i / (employee.history.length - 1)) * (chartWidth - padding * 2) + padding;
                       const y = chartHeight - (h.velocity / 120) * (chartHeight - padding * 2) - padding;
                       return (
                          <motion.circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="3"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            fill="#0a192f"
                            stroke="#10b981"
                            strokeWidth="2"
                          />
                       );
                    })}
                 </svg>
                 {/* X-Axis Labels */}
                 <div className="absolute bottom-2 left-4 right-4 flex justify-between">
                    {employee.history.map(h => (
                       <span key={h.date} className="text-[8px] text-slate-600 font-mono tracking-widest">{h.date}</span>
                    ))}
                 </div>
              </div>
            </div>

            {/* Project History */}
            <div className="space-y-4">
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <Trophy className="w-4 h-4 text-emerald-400" />
                   Stream Contributions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   {employee.projectHistory.map(project => (
                      <div key={project} className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3 group/item">
                         <div className="p-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle2 className="w-3.5 h-3.5" /></div>
                         <span className="text-sm text-slate-300 font-light group-hover/item:text-white transition-colors uppercase tracking-tight">{project}</span>
                      </div>
                   ))}
                </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
