'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Zap, Trophy, History, CheckCircle2, TrendingUp, Target, Info, Clock, AlertTriangle, CheckCircle, Award } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { Employee } from '@/lib/mockTeam';
import { STAGING_DROPS, STAGING_STREAMS } from '@/lib/stagingData';
import { getStreamColor } from '@/lib/streams';
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

  // Hydrate completed drops for this employee
  const completedDrops = useMemo(() => {
    const all: any[] = [];
    STAGING_STREAMS.forEach(s => {
      s.drops.forEach(d => {
        // Map mock employees to staging data IDs (emp-1 -> 1, etc.)
        const internalId = employee.id.replace('emp-', '');
        if (d.owner_id === internalId && d.status === 'Completed') {
          all.push({
            ...d,
            streamId: s.id,
            completion_time: d.completion_time || (d.estimated_time * (1 + (parseInt(d.drop_id) % 30 - 10) / 100))
          });
        }
      });
    });
    // Sort by streamId to enable merging
    return all.sort((a, b) => a.streamId.localeCompare(b.streamId)).slice(0, 4);
  }, [employee.id]);

  const streamRowSpans = useMemo(() => {
    const spans: Record<number, number> = {};
    let i = 0;
    while (i < completedDrops.length) {
      let count = 1;
      let j = i + 1;
      while (j < completedDrops.length && completedDrops[j].streamId === completedDrops[i].streamId) {
        count++;
        j++;
      }
      spans[i] = count;
      i = j;
    }
    return spans;
  }, [completedDrops]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-white/10 bg-[#0a192f]/95 backdrop-blur-3xl">
        <div className="flex flex-col md:flex-row h-full">
          {/* Left Sidebar: Profile Summary */}
          <div className="w-full md:w-80 bg-slate-900/40 p-8 border-r border-white/10 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-950 to-[#0a192f] border border-teal-800/30 flex items-center justify-center text-4xl font-bold text-teal-200 shadow-2xl mb-6">
              {employee.name.charAt(0)}
            </div>
            <DialogHeader className="p-0 space-y-0 text-center items-center">
              <DialogTitle className="text-2xl font-bold text-white mb-1 leading-tight tracking-tight">
                {employee.name}
              </DialogTitle>
              <DialogDescription className="text-green-400 font-mono text-sm tracking-widest mb-8">
                {employee.role}
              </DialogDescription>
            </DialogHeader>
            
            <div className="w-full space-y-4">
              <div className="p-4 rounded-xl bg-[#0a192f]/60 border border-white/5 flex items-center justify-between group/meter relative">
                <div className="flex items-center gap-3">
                   <div className="p-2 rounded-lg bg-green-500/10 text-green-400"><TrendingUp className="w-4 h-4" /></div>
                   <span className="text-xs text-slate-400 uppercase font-bold tracking-tight">Reliability</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-lg font-bold text-green-400">{employee.reliability}%</span>
                  <div className="w-24 h-1 bg-slate-800 rounded-sm overflow-hidden">
                    <div className="h-full bg-green-500 rounded-sm" style={{ width: `${employee.reliability}%` }} />
                  </div>
                </div>
                {/* Tooltip */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 border border-white/10 rounded text-[10px] text-slate-300 opacity-0 group-hover/meter:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                   Consistency Score: <span className="text-green-400">{employee.reliability}%</span>
                </div>
              </div>
              {(() => {
                const isCooling = employee.velocity < employee.avgVelocity;
                return (
                  <div className="p-4 rounded-xl bg-[#0a192f]/60 border border-white/5 flex items-center justify-between group/meter relative">
                    <div className="flex items-center gap-3">
                       <div className={cn("p-2 rounded-lg transition-colors", isCooling ? "bg-amber-500/10 text-amber-400" : "bg-green-500/10 text-green-400")}><Zap className="w-4 h-4" /></div>
                       <span className="text-xs text-slate-400 uppercase font-bold tracking-tight">Live Flow</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={cn("text-lg font-bold transition-colors", isCooling ? "text-amber-400" : "text-green-400")}>{employee.velocity}</span>
                      <div className="w-24 h-1 bg-slate-800 rounded-sm overflow-hidden">
                        <div className={cn("h-full transition-all duration-1000", isCooling ? "bg-amber-500" : "bg-green-500")} style={{ width: `${(employee.velocity / 120) * 100}%` }} />
                      </div>
                    </div>
                    {/* Tooltip */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 border border-white/10 rounded text-[10px] text-slate-300 opacity-0 group-hover/meter:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                       Historical Avg: <span className="text-slate-400 font-bold">{employee.avgVelocity}</span> PTS
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Right Side: Performance Metrics */}
          <div className="flex-1 pt-12 px-8 pb-8 overflow-y-auto max-h-[85vh]">
            {/* Task 1: Unified Header Metrics (Compact) */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center relative group">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Velocity</p>
                <h2 className="text-2xl font-bold text-slate-100 font-mono">1.2</h2>
                <p className="text-[8px] font-bold text-cyan-400 mt-1 uppercase tracking-tighter">Drops/Day</p>
              </div>

              <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center relative group">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Accuracy</p>
                <h2 className={cn("text-2xl font-bold font-mono", employee.reliability < 90 ? "text-amber-400" : "text-teal-400")}>
                  {employee.reliability}%
                </h2>
                <p className={cn("text-[8px] font-bold mt-1 uppercase tracking-tighter", employee.reliability < 90 ? "text-amber-500/70" : "text-teal-500/70")}>
                   {employee.reliability < 90 ? "Latency" : "Precision"}
                </p>
              </div>

              <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center relative group">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-3">Streak</p>
                <div className="flex items-center gap-1 w-full px-1">
                  {[1, 1, 1, 0, 1].map((status, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "flex-1 h-4 rounded-sm transition-all",
                        status ? "bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.3)]" : "bg-amber-500/30"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Task 3: Historical Velocity Chart */}
            <div className="space-y-4 mb-10">
              <div className="flex justify-between items-end">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                   <History className="w-3.5 h-3.5 text-slate-500" />
                   6-Month Trend
                </h3>
              </div>
              
              <div className="relative h-40 bg-black/20 rounded-2xl border border-white/5 p-4 overflow-hidden group">
                 <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
                    <motion.polyline
                      points={points}
                      fill="none"
                      stroke="url(#modal-perf-gradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial="hidden"
                      animate="visible"
                      variants={pathVariants}
                    />
                    <defs>
                      <linearGradient id="modal-perf-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#0d9488" />
                        <stop offset="100%" stopColor="#22c55e" />
                      </linearGradient>
                    </defs>
                    {employee.history.map((h, i) => {
                       const x = (i / (employee.history.length - 1)) * (chartWidth - padding * 2) + padding;
                       const y = chartHeight - (h.velocity / 120) * (chartHeight - padding * 2) - padding;
                       return (
                          <g key={i} className="group/point">
                             <circle cx={x} cy={y} r="3" fill="#0a192f" stroke="#22c55e" strokeWidth="2" className="group-hover/point:r-5 transition-all" />
                             <text 
                               x={x} 
                               y={y - 14} 
                               textAnchor="middle" 
                               className="text-[12px] font-black fill-green-400 opacity-0 group-hover/point:opacity-100 transition-opacity pointer-events-none"
                             >
                               {h.velocity}
                             </text>
                          </g>
                       );
                    })}
                 </svg>
              </div>
            </div>

            {/* Task 2: The 'Table Farm' (Compact) */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                 <History className="w-3.5 h-3.5 text-slate-500" />
                 Table Farm Feed
              </h3>
              <div className="rounded-2xl border border-white/5 overflow-hidden">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-slate-900/50 text-[9px] uppercase font-black text-slate-600 tracking-widest border-b border-white/5">
                      <th className="px-4 py-3 align-middle whitespace-nowrap">Stream</th>
                      <th className="px-4 py-3 align-middle whitespace-nowrap">Drop</th>
                      <th className="px-4 py-3 align-middle text-center whitespace-nowrap">Complexity</th>
                      <th className="px-4 py-3 align-middle text-right whitespace-nowrap">Hours</th>
                      <th className="px-4 py-3 align-middle text-center whitespace-nowrap">Latency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {completedDrops.map((drop, idx) => {
                      const sInfo = STAGING_STREAMS.find(s => s.id === drop.streamId);
                      const sColor = getStreamColor(sInfo?.colorKey);
                      const latency = Math.round(((drop.completion_time - drop.estimated_time) / drop.estimated_time) * 100);
                      const rowSpan = streamRowSpans[idx];

                      return (
                        <tr key={drop.drop_id} className="hover:bg-white/[0.02] transition-colors group relative">
                          {rowSpan && (
                            <td rowSpan={rowSpan} className="px-4 py-3 align-top relative border-r border-white/5 bg-white/[0.01]">
                              <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ backgroundColor: sColor.hex }} />
                              <span className="font-bold text-slate-300 text-[11px] sticky top-2">
                                 {sInfo ? sInfo.title.charAt(0).toUpperCase() + sInfo.title.slice(1).toLowerCase() : 'Unknown'}
                              </span>
                            </td>
                          )}
                          <td className="px-4 py-3 align-middle">
                             <span className="font-bold text-slate-400 block truncate w-32">{drop.title}</span>
                          </td>
                          <td className="px-4 py-3 align-middle text-center">
                            <span className="inline-block text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/50"
                              style={{ color: sColor.hex }}>
                              C{drop.complexity}
                            </span>
                          </td>
                          <td className="px-4 py-3 align-middle text-right tabular-nums text-slate-400">
                            {drop.estimated_time}h / {drop.completion_time.toFixed(1)}h
                          </td>
                          <td className={cn("px-4 py-3 align-middle text-center font-mono font-bold", latency > 0 ? "text-amber-400" : "text-teal-400")}>
                            {latency > 0 ? `+${latency}%` : `${latency}%`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Task 4: Oracle Audit AI Narrative */}
            <div className="mt-8 p-6 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                 <Zap className="w-3.5 h-3.5 text-indigo-400" />
                 <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Oracle Audit Narrative</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed italic">
                "{employee.name.split(' ')[0]} is <span className="text-teal-400">15% faster</span> on API-related drops but has a <span className="text-amber-400">110% latency score</span> on Frontend tasks."
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
