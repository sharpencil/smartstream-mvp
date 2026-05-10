'use client';

import React, { useState, useMemo } from 'react';
import { Activity, AlertTriangle, CheckCircle2, ChevronDown, TrendingUp, Zap, Target, Calendar, Coins, AlertCircle, Link } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STREAM_COLORS } from '@/lib/streams';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import * as Popover from '@radix-ui/react-popover';

const SPARK_UP = [20, 25, 30, 45, 50, 60, 65, 80, 85, 90, 95];
const SPARK_DOWN = [90, 85, 82, 70, 65, 50, 45, 30, 25, 20, 15];
const SPARK_STABLE = [50, 52, 48, 55, 45, 50, 53, 47, 51, 49, 50];

interface FirmProject {
  id: string;
  name: string;
  lead: string;
  progress: number; // 0-100
  status: 'healthy' | 'at-risk' | 'delayed';
  totalDrops: number;
  completedDrops: number;
  finalMilestone: string;
  colorKey: keyof typeof STREAM_COLORS;
  tokenBurn: number;
  daysSlipped: number;
  velocityTrend: number[];
  tokenTrend: number[];
  accuracyTrend: number[];
}

const MOCK_FIRM_PROJECTS: FirmProject[] = [
  {
    id: 'p1',
    name: 'SmartStream AI-CFM Core',
    lead: 'Sarah Jenkins',
    progress: 78,
    status: 'healthy',
    totalDrops: 142,
    completedDrops: 110,
    finalMilestone: 'Beta Launch',
    colorKey: 'cyan',
    tokenBurn: 124500,
    daysSlipped: 0,
    velocityTrend: SPARK_UP,
    tokenTrend: SPARK_STABLE,
    accuracyTrend: SPARK_UP,
  },
  {
    id: 'p2',
    name: 'Database Consolidation',
    lead: 'Mike Ross',
    progress: 45,
    status: 'delayed',
    totalDrops: 85,
    completedDrops: 38,
    finalMilestone: 'Zero Downtime Cutover',
    colorKey: 'rose' as any,
    tokenBurn: 85200,
    daysSlipped: 14,
    velocityTrend: SPARK_DOWN,
    tokenTrend: SPARK_UP,
    accuracyTrend: SPARK_DOWN,
  },
  {
    id: 'p3',
    name: 'Mobile App Refresh',
    lead: 'Elena Gomez',
    progress: 92,
    status: 'healthy',
    totalDrops: 60,
    completedDrops: 55,
    finalMilestone: 'App Store Submission',
    colorKey: 'emerald',
    tokenBurn: 45000,
    daysSlipped: 0,
    velocityTrend: SPARK_STABLE,
    tokenTrend: SPARK_DOWN,
    accuracyTrend: SPARK_UP,
  },
  {
    id: 'p4',
    name: 'Enterprise Billing Gateway',
    lead: 'David Kim',
    progress: 25,
    status: 'at-risk',
    totalDrops: 120,
    completedDrops: 30,
    finalMilestone: 'Stripe Integration',
    colorKey: 'amber' as any,
    tokenBurn: 210000,
    daysSlipped: 5,
    velocityTrend: SPARK_STABLE,
    tokenTrend: SPARK_UP,
    accuracyTrend: SPARK_DOWN,
  },
  {
    id: 'p5',
    name: 'Identity & Access Platform',
    lead: 'Alex Chen',
    progress: 60,
    status: 'healthy',
    totalDrops: 95,
    completedDrops: 57,
    finalMilestone: 'SSO Go-Live',
    colorKey: 'violet',
    tokenBurn: 92000,
    daysSlipped: 0,
    velocityTrend: SPARK_UP,
    tokenTrend: SPARK_STABLE,
    accuracyTrend: SPARK_STABLE,
  }
];



export function OrgOwnerDashboard() {
  const { setActivePersona, setIsDeepDive } = usePersona();
  const [sortMode, setSortMode] = useState<'Alphabetical' | 'Highest Cost' | 'Most at Risk'>('Highest Cost');

  const sortedProjects = useMemo(() => {
    return [...MOCK_FIRM_PROJECTS].sort((a, b) => {
      if (sortMode === 'Highest Cost') return b.tokenBurn - a.tokenBurn;
      if (sortMode === 'Most at Risk') return b.daysSlipped - a.daysSlipped;
      return a.name.localeCompare(b.name);
    });
  }, [sortMode]);

  const handleDeepDive = (projectId: string) => {
    // In a real app, we would set the selected project ID globally here
    setIsDeepDive(true);
    setActivePersona('Project Manager');
  };

  return (
    <div className="w-full flex flex-col p-8 h-full bg-[#020617] overflow-y-auto pb-32">
      {/* Header & Sort */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5 sticky top-0 bg-[#020617]/90 backdrop-blur-md z-40 relative">
        <h1 className="text-3xl font-bold font-sans tracking-tight text-slate-100 flex items-center gap-3">
          Firm Pulse
        </h1>
        
        <div className="flex items-center gap-4">
          <Popover.Root>
            <Popover.Trigger asChild>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#0a192f] border border-white/10 rounded-xl text-sm font-bold text-slate-300 hover:text-white transition-colors">
                Sort: {sortMode} <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>
            </Popover.Trigger>
            <Popover.Content align="end" className="w-48 bg-[#0f172a] border border-white/10 rounded-xl p-2 shadow-2xl z-50">
              {['Highest Cost', 'Most at Risk', 'Alphabetical'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setSortMode(mode as any)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all",
                    sortMode === mode ? "bg-teal-500/20 text-teal-400" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  )}
                >
                  {mode}
                </button>
              ))}
            </Popover.Content>
          </Popover.Root>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto flex flex-col">

        {/* Executive Project Cards Grid */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {sortedProjects.map((project) => {
              const c = STREAM_COLORS[project.colorKey as string] || STREAM_COLORS.cyan;
              const isAlert = project.daysSlipped > 0 || project.status === 'delayed';

              return (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  onClick={() => handleDeepDive(project.id)}
                  className={cn(
                    "relative bg-[#0f172a]/80 backdrop-blur-xl rounded-3xl p-6 flex flex-col gap-6 cursor-pointer overflow-hidden transition-all duration-300 group hover:-translate-y-1 hover:shadow-2xl border",
                    isAlert ? "border-rose-500/40 shadow-[0_0_30px_rgba(244,63,94,0.15)]" : "border-white/5 hover:border-white/20"
                  )}
                >
                  {/* Identity Notch */}
                  <div className="absolute left-0 top-0 bottom-0 w-2" style={{ backgroundColor: c.hex }} />
                  
                  {/* Alert Glow */}
                  {isAlert && (
                    <div className="absolute inset-0 bg-rose-500/5 pointer-events-none animate-pulse" />
                  )}

                  {/* Header */}
                  <div className="pl-2">
                    <div className="flex justify-between items-start mb-1">
                      <h2 className="text-xl font-bold text-slate-100 group-hover:text-white transition-colors line-clamp-1">{project.name}</h2>
                    </div>
                    <p className="text-sm font-medium text-slate-500">Lead: <span className="text-slate-300">{project.lead}</span></p>
                  </div>

                  {/* Mini-Flow (Progress) */}
                  <div className="pl-2">
                    <div className="flex justify-between text-xs font-semibold mb-2">
                      <span className="text-slate-400">{project.completedDrops} / {project.totalDrops} Drops</span>
                      <span className="text-slate-300">{project.progress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-900 border border-white/5 overflow-hidden flex">
                      <div 
                        className="h-full"
                        style={{ 
                          width: `${project.progress}%`,
                          backgroundColor: c.hex,
                          boxShadow: `0 0 10px ${c.hex}80`
                        }}
                      />
                      <div 
                        className="h-full opacity-30"
                        style={{ 
                          width: `${100 - project.progress}%`,
                          backgroundColor: c.hex,
                        }}
                      />
                    </div>
                    <div className="mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">
                      Target: {project.finalMilestone}
                    </div>
                  </div>

                  {/* Intelligence Grid */}
                  <div className="pl-2 grid grid-cols-3 gap-3 pt-4 border-t border-white/5">
                    
                    {/* Project Health */}
                    <div className="flex flex-col bg-[#0a192f]/50 border border-white/5 rounded-xl p-3 relative group/widget cursor-default">
                      <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <Activity className="w-3 h-3 text-teal-400" /> Health
                      </div>
                      <div className="flex items-center gap-2 mt-auto">
                        <div className="relative w-6 h-6 shrink-0">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none" />
                            <circle cx="12" cy="12" r="10" stroke={project.status === 'healthy' ? '#2dd4bf' : project.status === 'at-risk' ? '#f59e0b' : '#f43f5e'} strokeWidth="2" fill="none" strokeDasharray="63" strokeDashoffset={63 - (63 * project.progress / 100)} className="drop-shadow-[0_0_3px_currentColor]" />
                          </svg>
                        </div>
                        <div className="text-sm font-bold text-slate-200">
                          {project.progress}%
                        </div>
                      </div>
                    </div>

                    {/* AI Forecast */}
                    <div className="flex flex-col bg-[#0a192f]/50 border border-white/5 rounded-xl p-3 relative group/widget cursor-default">
                      <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <Calendar className="w-3 h-3 text-cyan-400" /> Forecast
                      </div>
                      <div className="text-sm font-bold text-cyan-50 mt-auto">
                        Jun {12 + project.daysSlipped}
                      </div>
                      <div className="text-[9px] font-bold text-cyan-500/80 uppercase tracking-widest mt-0.5">
                        92% Conf
                      </div>
                    </div>

                    {/* Token Burn */}
                    <div className="flex flex-col bg-[#0a192f]/50 border border-white/5 rounded-xl p-3 relative group/widget cursor-default">
                      <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <Coins className="w-3 h-3 text-amber-400" /> Tokens
                      </div>
                      <div className="text-sm font-bold text-slate-200 font-mono mt-auto">
                        ${(project.tokenBurn / 1000).toFixed(1)}k
                      </div>
                    </div>

                    {/* Active Blockers */}
                    <div className={cn("flex flex-col bg-[#0a192f]/50 border rounded-xl p-3 relative group/widget cursor-help transition-all", project.status !== 'healthy' ? "border-rose-500/30 bg-rose-500/5 shadow-[0_0_15px_rgba(244,63,94,0.1)]" : "border-white/5")}>
                      <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <AlertCircle className={cn("w-3 h-3", project.status !== 'healthy' ? "text-rose-400" : "text-slate-500")} /> Blockers
                      </div>
                      <div className={cn("text-sm font-bold mt-auto", project.status !== 'healthy' ? "text-rose-400" : "text-slate-400")}>
                        {project.status === 'delayed' ? 3 : project.status === 'at-risk' ? 1 : 0} Blocked
                      </div>
                      {project.status !== 'healthy' && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 opacity-0 group-hover/widget:opacity-100 transition-opacity bg-[#030b1a]/95 backdrop-blur-xl border border-rose-500/30 p-3 rounded-xl shadow-2xl pointer-events-none z-50">
                          <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1">Active Blocker</p>
                          <p className="text-xs text-slate-300">Awaiting security clearance for prod access.</p>
                        </div>
                      )}
                    </div>

                    {/* Forecast Slip */}
                    <div className={cn("flex flex-col bg-[#0a192f]/50 border rounded-xl p-3 relative group/widget cursor-help transition-all", project.daysSlipped > 0 ? "border-amber-500/30 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.1)]" : "border-white/5")}>
                      <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <TrendingUp className={cn("w-3 h-3", project.daysSlipped > 0 ? "text-amber-400" : "text-slate-500")} /> Slip
                      </div>
                      <div className={cn("text-sm font-bold mt-auto", project.daysSlipped > 0 ? "text-amber-400" : "text-slate-400")}>
                        +{project.daysSlipped} Days
                      </div>
                      {project.daysSlipped > 0 && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 opacity-0 group-hover/widget:opacity-100 transition-opacity bg-[#030b1a]/95 backdrop-blur-xl border border-amber-500/30 p-3 rounded-xl shadow-2xl pointer-events-none z-50">
                          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Slip Rationale</p>
                          <p className="text-xs text-slate-300">Underestimated complexity of legacy API migration.</p>
                        </div>
                      )}
                    </div>

                    {/* Upstream Health */}
                    <div className="flex flex-col bg-[#0a192f]/50 border border-white/5 rounded-xl p-3 relative group/widget cursor-default">
                      <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <Link className="w-3 h-3 text-blue-400" /> Upstream
                      </div>
                      <div className={cn("text-[11px] font-bold leading-tight mt-auto", project.status === 'delayed' ? "text-rose-400" : "text-blue-100")}>
                        {project.status === 'delayed' ? 'Blocked By Ext' : 'Stable'}
                      </div>
                    </div>

                  </div>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
