'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Trophy, AlertTriangle, UserCheck, LayoutGrid, List, Activity, Zap, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockEmployees, Employee } from '@/lib/mockTeam';
import { STAGING_DROPS } from '@/lib/stagingData';

export function TalentIntelligenceDashboard() {
  const [viewMode, setViewMode] = useState<'skills' | 'table'>('table');

  // --- Task 1: Executive Talent Vitals ---
  const firmVelocity = useMemo(() => {
    const total = mockEmployees.reduce((acc, emp) => acc + emp.velocity, 0);
    return Math.round(total / mockEmployees.length);
  }, []);

  const utilizationRate = useMemo(() => {
    const assigned = mockEmployees.filter(emp => emp.isAssigned).length;
    return Math.round((assigned / mockEmployees.length) * 100);
  }, []);

  const firmAccuracyScore = 92; // Derived or hardcoded for MVP. 92% on-time delivery.

  // --- Task 2: Global Skill Heatmap ---
  const skillDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    mockEmployees.forEach(emp => {
      emp.skills.forEach(skill => {
        counts[skill] = (counts[skill] || 0) + 1;
      });
    });
    
    return Object.entries(counts).map(([skill, count]) => ({
      skill,
      count,
      isAtRisk: count === 1 // Knowledge Silo
    })).sort((a, b) => b.count - a.count);
  }, []);

  // --- Task 3: Efficiency Leaderboard ---
  const leaderboardData = useMemo(() => {
    return mockEmployees.map(emp => {
      // Find actual completed drops for this person
      // mockEmployees IDs are like 'emp-1', but STAGING_DROPS owner_id is '1', '2', etc.
      const rawId = emp.id.replace('emp-', '');
      const drops = STAGING_DROPS.filter(d => d.owner_id === rawId);
      const completed = drops.filter(d => d.status === 'Completed').length;
      
      // Calculate a deterministic but mock % late score based on their velocity
      // Higher velocity -> lower late score
      const deterministicRandom = parseInt(rawId) || 1;
      const lateScore = Math.max(0, 100 - emp.velocity - (deterministicRandom * 1.5));

      return {
        ...emp,
        completedDrops: completed > 0 ? completed : 10 + (deterministicRandom * 3),
        lateScore: lateScore,
        primarySkill: emp.skills[0] || 'Generalist'
      };
    }).sort((a, b) => a.lateScore - b.lateScore); // Sort by lowest late score first (best performers)
  }, []);

  // --- Task 5: Utilization Heatmap Data ---
  const heatmapData = useMemo(() => {
    // Generate 14 days of flow hours for each employee
    return mockEmployees.map(emp => {
      const days = Array.from({ length: 14 }).map((_, i) => {
        // Base hours on their availability and a bit of randomness
        let base = emp.availability === 'saturated' ? 8 : (emp.availability === 'available' ? 4 : 0);
        // Add sinusoidal variance
        const variance = Math.sin(i + parseInt(emp.id.replace('emp-', ''))) * 3;
        let hours = Math.round(base + variance);
        if (hours < 0) hours = 0;
        if (hours > 12) hours = 12;
        return hours;
      });
      return { id: emp.id, name: emp.name, days };
    });
  }, []);

  return (
    <div className="w-full h-full bg-[#020617] overflow-y-auto pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#020617]/95 backdrop-blur-md px-8 pt-8 pb-6 border-b border-white/5 flex items-center justify-between">
        <h1 className="text-3xl font-bold font-sans tracking-tight text-slate-100 flex items-center gap-3">
          Talent Intelligence
        </h1>
      </div>

      <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 px-8 pt-8">
        
        {/* Vitals Bar Row (Moved below unified header) */}
        <div className="flex flex-col md:flex-row justify-end items-center gap-6 mb-4">
          
          <div className="flex gap-4">
            <div className="bg-[#0a192f]/60 backdrop-blur-md border border-teal-500/20 rounded-2xl p-4 flex flex-col items-center justify-center min-w-[140px]">
              <div className="text-teal-400 text-sm font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><Zap className="w-4 h-4"/> Velocity</div>
              <div className="text-3xl font-bold text-slate-100">{firmVelocity}<span className="text-slate-500 text-lg ml-1">avg</span></div>
            </div>
            <div className="bg-[#0a192f]/60 backdrop-blur-md border border-blue-500/20 rounded-2xl p-4 flex flex-col items-center justify-center min-w-[140px]">
              <div className="text-blue-400 text-sm font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><UserCheck className="w-4 h-4"/> Utilized</div>
              <div className="text-3xl font-bold text-slate-100">{utilizationRate}%</div>
            </div>
            <div className="bg-[#0a192f]/60 backdrop-blur-md border border-emerald-500/20 rounded-2xl p-4 flex flex-col items-center justify-center min-w-[140px]">
              <div className="text-emerald-400 text-sm font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><Trophy className="w-4 h-4"/> Accuracy</div>
              <div className="text-3xl font-bold text-slate-100">{firmAccuracyScore}%</div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Column (View Toggle & Content) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            
            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-[#0a192f]/60 p-1.5 rounded-xl border border-white/5 w-fit">
              <button
                onClick={() => setViewMode('table')}
                className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all", viewMode === 'table' ? "bg-slate-800 text-slate-100 shadow-md" : "text-slate-500 hover:text-slate-300")}
              >
                <List className="w-4 h-4" />
                Leaderboard
              </button>
              <button
                onClick={() => setViewMode('skills')}
                className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all", viewMode === 'skills' ? "bg-slate-800 text-slate-100 shadow-md" : "text-slate-500 hover:text-slate-300")}
              >
                <LayoutGrid className="w-4 h-4" />
                Skill Aura Map
              </button>
            </div>

            <AnimatePresence mode="wait">
              
              {/* TABLE VIEW */}
              {viewMode === 'table' && (
                <motion.div
                  key="table"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-[#0a192f]/60 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden shadow-xl"
                >
                  <div className="px-6 py-5 border-b border-white/5 bg-slate-900/50 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-100">Efficiency vs. Latency</h2>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Sorted by Best Performers</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 bg-slate-900/20 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          <th className="px-6 py-4">Talent</th>
                          <th className="px-6 py-4">Primary Skill</th>
                          <th className="px-6 py-4">Avg Velocity</th>
                          <th className="px-6 py-4">Late Score</th>
                          <th className="px-6 py-4">Completed Drops</th>
                          <th className="px-6 py-4">Adaptability</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {leaderboardData.map((emp, i) => (
                          <tr key={emp.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-teal-400 border border-teal-500/20">
                                  {emp.avatar}
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-200">{emp.name}</div>
                                  <div className="text-xs text-slate-500">{emp.role}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 rounded bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700 whitespace-nowrap">
                                {emp.primarySkill}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-teal-400">{emp.velocity}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className={cn("font-bold", emp.lateScore > 15 ? "text-amber-400" : "text-emerald-400")}>
                                {emp.lateScore.toFixed(1)}%
                              </div>
                            </td>
                            <td className="px-6 py-4 text-slate-300 font-medium">
                              {emp.completedDrops}
                            </td>
                            <td className="px-6 py-4">
                              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${emp.reliability}%` }} />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* SKILLS VIEW */}
              {viewMode === 'skills' && (
                <motion.div
                  key="skills"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-[#0a192f]/60 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden shadow-xl p-8"
                >
                  <h2 className="text-xl font-bold text-slate-100 mb-6">Global Skill Topology</h2>
                  <div className="flex flex-wrap gap-4">
                    {skillDistribution.map(skill => {
                      // Visual intensity based on headcount
                      const sizeClass = skill.count > 2 ? "px-6 py-4 text-lg" : "px-4 py-2 text-sm";
                      const glowClass = skill.count > 2 ? "shadow-[0_0_30px_rgba(45,212,191,0.15)] border-teal-500/40 bg-teal-500/10 text-teal-300" : 
                                        "border-slate-700 bg-slate-800/50 text-slate-400";
                      
                      return (
                        <div 
                          key={skill.skill}
                          className={cn(
                            "relative rounded-2xl border font-bold flex items-center gap-3 transition-all hover:scale-105 cursor-default",
                            sizeClass,
                            skill.isAtRisk ? "border-amber-500/50 bg-amber-500/10 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)]" : glowClass
                          )}
                        >
                          {skill.skill}
                          <span className={cn("px-2 py-0.5 rounded-full text-xs font-black", skill.isAtRisk ? "bg-amber-500/20" : "bg-slate-900/50")}>
                            {skill.count}
                          </span>
                          
                          {skill.isAtRisk && (
                            <div className="absolute -top-2 -right-2 bg-amber-500 text-slate-900 p-1 rounded-full shadow-lg">
                              <AlertTriangle className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  
                  <div className="mt-8 flex items-center gap-2 text-sm text-slate-400 bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    Skills marked in <span className="text-amber-400 font-bold">Amber</span> represent Knowledge Silos (only 1 expert available). These are critical at-risk areas.
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            {/* UTILIZATION HEATMAP */}
            <div className="bg-[#0a192f]/60 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden shadow-xl mt-2">
              <div className="px-6 py-5 border-b border-white/5 bg-slate-900/50">
                <h2 className="text-lg font-bold text-slate-100">Firm-Wide Utilization Heatmap</h2>
                <p className="text-sm text-slate-400 mt-1">Daily Assigned Flow Hours (Next 14 Days)</p>
              </div>
              <div className="p-6 overflow-x-auto">
                <div className="min-w-[600px]">
                  {/* Heatmap Header (Days) */}
                  <div className="flex mb-2 ml-32">
                    {Array.from({ length: 14 }).map((_, i) => (
                      <div key={i} className="flex-1 text-center text-[10px] font-bold text-slate-500 uppercase">
                        D{i+1}
                      </div>
                    ))}
                  </div>
                  
                  {/* Heatmap Rows */}
                  <div className="space-y-1">
                    {heatmapData.map(row => (
                      <div key={row.id} className="flex items-center gap-4 hover:bg-white/[0.02] p-1 rounded-lg transition-colors">
                        <div className="w-28 text-sm font-semibold text-slate-300 truncate text-right">
                          {row.name}
                        </div>
                        <div className="flex flex-1 gap-1">
                          {row.days.map((hours, i) => {
                            // Color mapping: 0 = empty, 1-6 = blue, 7-8 = emerald, >8 = amber (burnout)
                            let bgClass = "bg-slate-800 border-white/5";
                            if (hours > 8) bgClass = "bg-amber-500/80 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)] z-10";
                            else if (hours >= 7) bgClass = "bg-emerald-500/60 border-emerald-400/50";
                            else if (hours > 0) bgClass = "bg-blue-500/40 border-blue-400/30";

                            return (
                              <div 
                                key={i} 
                                className={cn("flex-1 h-8 rounded border flex items-center justify-center transition-all group relative", bgClass)}
                              >
                                {hours > 0 && <span className={cn("text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity", hours > 8 ? "text-slate-900" : "text-white")}>{hours}h</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6 flex items-center gap-6 text-xs font-semibold text-slate-400">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-slate-800" /> Bench (0h)</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-blue-500/40" /> Active (1-6h)</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-500/60" /> Saturated (7-8h)</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-amber-500/80 shadow-[0_0_10px_rgba(245,158,11,0.5)]" /> Burnout Risk ({'>'}8h)</div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Predictive Talent Gaps (The Oracle Scout) */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-gradient-to-b from-[#0a192f] to-[#020617] border border-indigo-500/20 rounded-3xl overflow-hidden shadow-2xl relative">
              {/* Oracle Glow */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-indigo-500/10 blur-[50px] pointer-events-none" />
              
              <div className="p-6 border-b border-white/5 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                  <Activity className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-100">The Oracle Scout</h3>
                <p className="text-sm text-slate-400 mt-1">Predictive Talent Gap Analysis</p>
              </div>

              <div className="p-6 space-y-6 relative z-10">
                <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
                  <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4" />
                    Critical Deficit Predicted
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Based on upcoming <strong>DB Consolidation</strong> streams mapped in the reservoir, the firm will face a <span className="text-white font-bold bg-amber-500/20 px-1 rounded">40-hour/week deficit</span> in <strong>PostgreSQL</strong> expertise starting in 14 days.
                  </p>
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Recommendation</h5>
                    <button className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-sm transition-colors shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                      Onboard 1 Senior DB Engineer
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                  <h4 className="text-sm font-bold text-indigo-400 flex items-center gap-2 mb-3">
                    <Info className="w-4 h-4" />
                    Resource Optimization
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    <strong>React</strong> utilization is currently at 45%. You can safely pull forward 3 drops from the <em>Mobile App Refresh</em> stream without risking timeline saturation.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
