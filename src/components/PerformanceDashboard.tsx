'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { STAGING_DROPS, STAGING_STREAMS } from '@/lib/stagingData';
import { getStreamColor } from '@/lib/streams';
import { TrendingUp, Target, CheckCircle2, Award, Zap, History, Info, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// We mock the user as owner_id = "1" (Sarah) for Team Member view
const MY_USER_ID = "1";

export function PerformanceDashboard() {
  const myCompletedDrops = useMemo(() => {
    const allCompleted: any[] = [];
    STAGING_STREAMS.forEach(s => {
      s.drops.forEach(d => {
        if (d.owner_id === MY_USER_ID && d.status === 'Completed') {
          allCompleted.push({
            ...d,
            streamId: s.id,
            // Apply jitter for realism if data is missing
            completion_time: d.completion_time || (d.estimated_time * (1 + (parseInt(d.drop_id) % 30 - 10) / 100))
          });
        }
      });
    });
    // Sort by streamId to enable grouping/merging
    return allCompleted.sort((a, b) => a.streamId.localeCompare(b.streamId));
  }, []);

  const streamRowSpans = useMemo(() => {
    const spans: Record<number, number> = {};
    let i = 0;
    while (i < myCompletedDrops.length) {
      let count = 1;
      let j = i + 1;
      while (j < myCompletedDrops.length && myCompletedDrops[j].streamId === myCompletedDrops[i].streamId) {
        count++;
        j++;
      }
      spans[i] = count;
      i = j;
    }
    return spans;
  }, [myCompletedDrops]);

  const totalCompleted = myCompletedDrops.length;
  const totalEst = myCompletedDrops.reduce((acc, d) => acc + d.estimated_time, 0);
  const totalAct = myCompletedDrops.reduce((acc, d) => acc + d.completion_time, 0);
  
  // Task 1 Metrics
  const personalVelocity = 1.2; // Mocked Drops/Day
  const lateScore = totalEst > 0 ? Math.round((totalAct / totalEst) * 100) : 100;
  
  const recentDrops = [...myCompletedDrops].slice(-5);
  while(recentDrops.length < 5) {
    recentDrops.unshift(null as any);
  }

  // Chart Logic (Mocked for Dashboard)
  const chartWidth = 800;
  const chartHeight = 200;
  const padding = 20;
  const historyData = [
    { date: 'Jan', velocity: 0.8 },
    { date: 'Feb', velocity: 1.1 },
    { date: 'Mar', velocity: 0.9 },
    { date: 'Apr', velocity: 1.3 },
    { date: 'May', velocity: 1.1 },
    { date: 'Jun', velocity: 1.2 },
  ];
  const points = historyData.map((h, i) => {
    const x = (i / (historyData.length - 1)) * (chartWidth - padding * 2) + padding;
    const y = chartHeight - (h.velocity / 2) * (chartHeight - padding * 2) - padding;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full h-full bg-[#020617] overflow-y-auto pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#020617]/95 backdrop-blur-md px-8 pt-8 pb-6 border-b border-white/5 flex items-center justify-between">
        <h1 className="text-3xl font-bold font-sans tracking-tight text-slate-100 flex items-center gap-3">
          My Performance
        </h1>
      </div>

      <div className="w-full max-w-5xl mx-auto flex flex-col px-8 pt-8">
        {/* Top Metrics Row - Unified Scorecard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-10">
          {/* Personal Velocity */}
          <div className="bg-[#0a192f]/60 backdrop-blur-md border border-white/5 rounded-[24px] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group min-h-[200px]">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Zap className="w-16 h-16 text-cyan-400" />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Personal Velocity</p>
            <h2 className="text-4xl font-bold text-slate-100 font-mono">{personalVelocity}</h2>
            <p className="text-[10px] font-bold text-cyan-400 mt-6 uppercase tracking-widest">Drops / Day</p>
          </div>

          {/* Delivery Accuracy (% Late Score) */}
          <div className="bg-[#0a192f]/60 backdrop-blur-md border border-white/5 rounded-[24px] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group min-h-[200px]">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Target className="w-16 h-16 text-teal-400" />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Delivery Accuracy</p>
            <h2 className={cn("text-4xl font-bold font-mono", lateScore > 100 ? "text-amber-400" : "text-teal-400")}>
              {lateScore}%
            </h2>
            <p className={cn("text-[10px] font-bold mt-6 uppercase tracking-widest", lateScore > 100 ? "text-amber-500/70" : "text-teal-500/70")}>
              {lateScore > 100 ? "Latency (Slow)" : "High Precision (Fast)"}
            </p>
          </div>

          {/* Consistency Streak (Liquid Pulse) */}
          <div className="bg-[#0a192f]/60 backdrop-blur-md border border-white/5 rounded-[24px] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group min-h-[200px]">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Consistency Streak</p>
            <div className="flex items-center gap-1.5 w-full mt-2 px-2">
              {recentDrops.map((drop, idx) => {
                if (!drop) return <div key={idx} className="flex-1 h-8 rounded-md bg-white/[0.03]" />;
                const isOnTime = drop.completion_time <= drop.estimated_time;
                return (
                  <div 
                    key={drop.drop_id} 
                    className={cn(
                      "flex-1 h-8 rounded-md transition-all duration-500",
                      isOnTime ? "bg-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.4)]" : "bg-amber-500/40 border border-amber-500/20"
                    )}
                  />
                );
              })}
            </div>
            <p className="text-[10px] font-bold text-slate-500 mt-6 uppercase tracking-widest">Liquid Pulse Status</p>
          </div>
        </div>

        {/* Task 3: Integrated Trend Analysis */}
        <div className="w-full bg-[#0a192f]/40 backdrop-blur-md border border-white/5 rounded-[32px] p-8 pb-12 mb-10 overflow-hidden relative group">
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <History className="w-32 h-32 text-slate-400" />
           </div>
           <div className="flex justify-between items-end mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-100">Historical Velocity</h3>
                <p className="text-sm text-slate-400 mt-1">6-month delivery throughput</p>
              </div>
              <span className="text-[10px] font-bold text-slate-500 font-mono tracking-widest uppercase">Unit: Drops / Day</span>
           </div>
           
           <div className="relative w-full">
              <div className="h-48 w-full">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
                <motion.polyline
                  points={points}
                  fill="none"
                  stroke="url(#dash-gradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
                <defs>
                  <linearGradient id="dash-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0d9488" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
                {historyData.map((h, i) => {
                  const x = (i / (historyData.length - 1)) * (chartWidth - padding * 2) + padding;
                  const y = chartHeight - (h.velocity / 2) * (chartHeight - padding * 2) - padding;
                  return (
                    <g key={i} className="group/point">
                      <circle cx={x} cy={y} r="4" fill="#0a192f" stroke="#22d3ee" strokeWidth="2" className="group-hover/point:r-6 transition-all" />
                      <text 
                        x={x} 
                        y={y - 14} 
                        textAnchor="middle" 
                        className="text-[10px] font-bold fill-slate-600 transition-all duration-300 pointer-events-none group-hover/point:fill-slate-400 group-hover/point:text-[14px]"
                      >
                        {h.velocity}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            <div className="flex justify-between mt-4 px-2">
                {historyData.map(h => (
                  <span key={h.date} className="text-[10px] font-bold text-slate-600 font-mono tracking-widest">{h.date}</span>
                ))}
              </div>
           </div>
        </div>

        {/* Task 2: The 'Table Farm' */}
        <div className="w-full bg-[#0a192f]/60 backdrop-blur-md border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
          <div className="px-8 py-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <History className="w-5 h-5 text-slate-400" />
              Performance History (Table Farm)
            </h3>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">High Data Rate Feed</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400 border-collapse">
              <thead>
                <tr className="bg-slate-900/50 text-[10px] uppercase font-black text-slate-500 tracking-[0.15em] border-b border-white/5">
                  <th className="px-8 py-4 align-middle whitespace-nowrap">Stream</th>
                  <th className="px-8 py-4 align-middle whitespace-nowrap">Drop Title</th>
                  <th className="px-8 py-4 align-middle text-center whitespace-nowrap">Complexity</th>
                  <th className="px-8 py-4 align-middle text-right whitespace-nowrap">Hours (Est / Act)</th>
                  <th className="px-8 py-4 align-middle text-center whitespace-nowrap">Latency</th>
                  <th className="px-8 py-4 align-middle text-right whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {myCompletedDrops.map((drop, idx) => {
                  const sInfo = STAGING_STREAMS.find(s => s.id === (drop as any).streamId);
                  const sColor = getStreamColor(sInfo?.colorKey);
                  const isOnTime = drop.completion_time <= drop.estimated_time;
                  const latency = Math.round(((drop.completion_time - drop.estimated_time) / drop.estimated_time) * 100);
                  const rowSpan = streamRowSpans[idx];

                  return (
                    <tr key={drop.drop_id} className="hover:bg-white/[0.03] transition-colors group relative">
                      {rowSpan && (
                        <td rowSpan={rowSpan} className="px-8 py-4 align-top relative border-r border-white/5 bg-white/[0.01]">
                          {/* Identity Notch */}
                          <div className="absolute left-0 top-0 bottom-0 w-1 pointer-events-none" style={{ backgroundColor: sColor.hex }} />
                          <span className="text-[12px] font-bold text-slate-300 sticky top-4">
                             {sInfo ? sInfo.title.charAt(0).toUpperCase() + sInfo.title.slice(1).toLowerCase() : 'Unknown'}
                          </span>
                        </td>
                      )}
                      <td className="px-8 py-4 align-middle">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-200 group-hover:text-cyan-400 transition-colors cursor-pointer">{drop.title}</span>
                          <span className="text-[10px] font-mono text-slate-500 mt-0.5 uppercase tracking-tighter">{drop.drop_id}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4 align-middle text-center">
                        <span className="inline-block text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/50"
                          style={{ color: sColor.hex }}>
                          C{drop.complexity}
                        </span>
                      </td>
                      <td className="px-8 py-4 align-middle text-right tabular-nums font-mono font-bold text-slate-300">
                        {drop.estimated_time}h <span className="text-slate-600 mx-1">/</span> {drop.completion_time.toFixed(1)}h
                      </td>
                      <td className={cn("px-8 py-4 align-middle text-center font-mono font-bold", latency > 0 ? "text-amber-400" : "text-teal-400")}>
                        {latency > 0 ? `+${latency}%` : `${latency}%`}
                      </td>
                      <td className="px-8 py-4 align-middle text-right">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border whitespace-nowrap",
                          isOnTime ? "bg-teal-500/10 text-teal-400 border-teal-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        )}>
                          {isOnTime ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {isOnTime ? 'On-Time' : 'Late'}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {myCompletedDrops.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-slate-500 italic">
                      No completed drops recorded in the Table Farm.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Task 4: Oracle Audit AI Narrative */}
          <div className="p-8 bg-indigo-500/5 border-t border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Info className="w-12 h-12 text-indigo-400" />
            </div>
            <div className="flex items-center gap-3 mb-4">
               <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                  <Zap className="w-4 h-4" />
               </div>
               <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Oracle Audit Narrative</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed max-w-3xl italic font-medium">
              "Sarah is <span className="text-teal-400">15% faster</span> on API-related drops but has a <span className="text-amber-400">110% latency score</span> on Frontend tasks. Recommendation: Re-level technical focus to Backend-heavy streams to maximize firm velocity."
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
