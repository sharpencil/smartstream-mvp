'use client';

import React, { useState, useMemo } from 'react';
import { Activity, AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, TrendingUp, Zap, Target, Calendar, Coins, AlertCircle, Link, BarChart3, LayoutGrid } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell, BarChart, Bar, Legend } from 'recharts';
import { cn } from '@/lib/utils';
import { STREAM_COLORS } from '@/lib/streams';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersona } from '@/context/PersonaContext';
import * as Popover from '@radix-ui/react-popover';
import { ComparativeAnalytics } from './ComparativeAnalytics';

const SPARK_UP = [20, 25, 30, 45, 50, 60, 65, 80, 85, 90, 95];
const SPARK_DOWN = [90, 85, 82, 70, 65, 50, 45, 30, 25, 20, 15];
const SPARK_STABLE = [50, 52, 48, 55, 45, 50, 53, 47, 51, 49, 50];

export interface FirmProject {
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
  // Comparative Metrics
  avgVelocity: number;
  forecastStability: number;
  costPerDrop: number;
  scopeCreep: number;
  avgLatency: number;
  resources: {
    senior: number;
    mid: number;
    junior: number;
  };
}

export const MOCK_FIRM_PROJECTS: FirmProject[] = [
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
    avgVelocity: 88,
    forecastStability: 94,
    costPerDrop: 1131,
    scopeCreep: 2,
    avgLatency: 108,
    resources: { senior: 4, mid: 2, junior: 1 }
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
    avgVelocity: 42,
    forecastStability: 65,
    costPerDrop: 2242,
    scopeCreep: 18,
    avgLatency: 145,
    resources: { senior: 2, mid: 3, junior: 4 }
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
    avgVelocity: 75,
    forecastStability: 92,
    costPerDrop: 818,
    scopeCreep: 1,
    avgLatency: 102,
    resources: { senior: 3, mid: 2, junior: 0 }
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
    avgVelocity: 55,
    forecastStability: 45,
    costPerDrop: 7000,
    scopeCreep: 12,
    avgLatency: 112,
    resources: { senior: 5, mid: 1, junior: 2 }
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
    avgVelocity: 82,
    forecastStability: 88,
    costPerDrop: 1614,
    scopeCreep: 3,
    avgLatency: 105,
    resources: { senior: 2, mid: 2, junior: 1 }
  }
];

export function OrgOwnerDashboard() {
  const { setActivePersona, setIsDeepDive, setSelectedProjectId } = usePersona();
  const [sortMode, setSortMode] = useState<'Alphabetical' | 'Highest Cost' | 'Most at Risk'>('Highest Cost');
  const [viewMode, setViewMode] = useState<'grid' | 'analytics'>('grid');

  const sortedProjects = useMemo(() => {
    return [...MOCK_FIRM_PROJECTS].sort((a, b) => {
      if (sortMode === 'Highest Cost') return b.tokenBurn - a.tokenBurn;
      if (sortMode === 'Most at Risk') return b.daysSlipped - a.daysSlipped;
      return a.name.localeCompare(b.name);
    });
  }, [sortMode]);

  const handleDeepDive = (projectId: string) => {
    setSelectedProjectId(projectId);
    setIsDeepDive(true);
  };

  return (
    <div className="w-full h-full bg-[#020617] overflow-y-auto pb-32">
      {/* Header & Sort */}
      <div className="sticky top-0 z-40 bg-[#020617]/95 backdrop-blur-md px-8 pt-8 pb-6 border-b border-white/5 flex items-center justify-between relative">
        <h1 className="text-3xl font-bold font-sans tracking-tight text-slate-100 flex items-center gap-3">
          Firm Pulse
        </h1>
        
        {/* View Switcher - Center Aligned */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center p-1.5 bg-[#0a192f]/60 border border-slate-800/60 rounded-full shadow-inner shadow-black/20 backdrop-blur-md">
          <button 
            onClick={() => setViewMode('grid')}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap",
              viewMode === 'grid' 
                ? "bg-teal-950/80 text-teal-400 shadow-inner shadow-teal-500/20 border border-teal-500/20" 
                : "text-slate-500 hover:text-slate-300"
            )}
          >
            <LayoutGrid className="w-4 h-4" /> Project Grid
          </button>
          <button 
            onClick={() => setViewMode('analytics')}
            className={cn(
              "flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap",
              viewMode === 'analytics' 
                ? "bg-teal-950/80 text-teal-400 shadow-inner shadow-teal-500/20 border border-teal-500/20" 
                : "text-slate-500 hover:text-slate-300"
            )}
          >
            <BarChart3 className="w-4 h-4" /> Comparative Analytics
          </button>
        </div>

        <div className="flex items-center gap-6">
          {viewMode === 'grid' && (
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
          )}
        </div>
      </div>

      <div className="w-full flex flex-col px-8 pt-8">
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div 
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8"
            >
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
                      "relative bg-[#0f172a]/80 backdrop-blur-xl rounded-3xl p-6 flex flex-col gap-6 cursor-pointer overflow-hidden transition-all duration-500 group border hover:bg-[#111c33]/90",
                      isAlert 
                        ? "border-rose-500/40 shadow-[0_0_30px_rgba(244,63,94,0.1)] hover:border-rose-500/60" 
                        : "border-white/5 hover:border-white/20 shadow-xl"
                    )}
                    whileHover={{ 
                      scale: 1.02, 
                      y: -4,
                      boxShadow: `0 20px 40px -12px rgba(0,0,0,0.5), 0 0 15px ${c.hex}15`
                    }}
                  >
                    {/* Alert Glow */}
                    {isAlert && (
                      <div className="absolute inset-0 bg-rose-500/5 pointer-events-none animate-pulse" />
                    )}

                    {/* Header */}
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h2 className="text-xl font-bold text-slate-100 group-hover:text-white transition-colors line-clamp-1">{project.name}</h2>
                      </div>
                      <p className="text-sm font-medium text-slate-500">Lead: <span className="text-slate-300">{project.lead}</span></p>
                    </div>

                    {/* Mini-Flow (Progress) */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-2">
                        <span className="text-slate-400">{project.completedDrops} / {project.totalDrops} Drops</span>
                        <span className="text-slate-300">{project.progress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-900 border border-white/5 overflow-hidden flex">
                        {(() => {
                          const healthColor = project.status === 'healthy' ? '#10b981' : project.status === 'at-risk' ? '#f59e0b' : '#f43f5e';
                          return (
                            <>
                              <div 
                                className="h-full transition-all duration-1000"
                                style={{ 
                                  width: `${project.progress}%`,
                                  backgroundColor: healthColor,
                                  boxShadow: `0 0 10px ${healthColor}60`
                                }}
                              />
                              <div 
                                className="h-full opacity-10"
                                style={{ 
                                  width: `${100 - project.progress}%`,
                                  backgroundColor: healthColor,
                                }}
                              />
                            </>
                          );
                        })()}
                      </div>
                      <div className="mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">
                        Target: {project.finalMilestone}
                      </div>
                    </div>

                    {/* Executive Intelligence Grid (3x2) */}
                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/5">
                      {/* Financial ROI */}
                      <div className="flex flex-col bg-[#0a192f]/50 border border-white/5 rounded-xl p-3 relative group/widget">
                        <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <Coins className="w-3 h-3 text-amber-400" /> ROI
                        </div>
                        <div className="text-xs font-bold text-slate-200 font-mono mt-auto">
                          ${(project.tokenBurn / 1000).toFixed(1)}k <span className="text-[9px] text-slate-500">/ $250k</span>
                        </div>
                      </div>

                      {/* Scope Drift */}
                      <div className="flex flex-col bg-[#0a192f]/50 border border-white/5 rounded-xl p-3 relative group/widget">
                        <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <Target className="w-3 h-3 text-rose-400" /> Drift
                        </div>
                        <div className="text-xs font-bold text-rose-400 mt-auto">
                          +{Math.floor(project.daysSlipped * 2.5)}% <span className="text-[9px] opacity-70">Drift</span>
                        </div>
                      </div>

                      {/* AI Stability */}
                      <div className="flex flex-col bg-[#0a192f]/50 border border-white/5 rounded-xl p-3 relative group/widget">
                        <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <Activity className="w-3 h-3 text-cyan-400" /> Stability
                        </div>
                        <div className="text-xs font-bold text-cyan-50 mt-auto">
                          94% <span className="text-[9px] text-cyan-500/80">Stable</span>
                        </div>
                      </div>

                      {/* Talent Mix */}
                      <div className="flex flex-col bg-[#0a192f]/50 border border-white/5 rounded-xl p-3 relative group/widget">
                        <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <Zap className="w-3 h-3 text-indigo-400" /> Talent
                        </div>
                        <div className="text-xs font-bold text-slate-200 mt-auto">
                          3:1 <span className="text-[9px] text-slate-500">Sr/Jr</span>
                        </div>
                      </div>

                      {/* Execution Accuracy */}
                      <div className="flex flex-col bg-[#0a192f]/50 border border-white/5 rounded-xl p-3 relative group/widget">
                        <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <Activity className="w-3 h-3 text-emerald-400" /> Accuracy
                        </div>
                        <div className="text-xs font-bold text-emerald-400 mt-auto">
                          108% <span className="text-[9px] opacity-70">Latent</span>
                        </div>
                      </div>

                      {/* Milestone Confidence */}
                      <div className="flex flex-col bg-[#0a192f]/50 border border-white/5 rounded-xl p-3 relative group/widget">
                        <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <TrendingUp className="w-3 h-3 text-amber-400" /> Conf.
                        </div>
                        <div className="text-xs font-bold text-amber-400 mt-auto">
                          82% <span className="text-[9px] opacity-70">Prob.</span>
                        </div>
                      </div>
                    </div>

                    {/* Project Pulse Action (Standardized with Team Page) */}
                    <div className="mt-auto pt-4 flex items-center justify-center border-t border-white/5">
                      <div className="w-full py-2.5 rounded-full bg-transparent border border-cyan-500/50 text-cyan-400 text-xs font-medium uppercase tracking-[0.1em] hover:bg-cyan-500 hover:text-[#020617] transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:-translate-y-1">
                        Project Pulse
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <ComparativeAnalytics projects={MOCK_FIRM_PROJECTS} onProjectClick={handleDeepDive} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
