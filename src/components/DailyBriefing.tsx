'use client';

import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { AlertTriangle, TrendingUp, X, Activity, Brain, TrendingDown, Link2, Maximize2, Coins, Zap, Target, Users, Shield, AlertCircle, ArrowRight } from 'lucide-react';
import { BurndownChart } from './BurndownChart';
import { cn } from '@/lib/utils';
import { usePersona } from '@/context/PersonaContext';

interface DailyBriefingProps {
  blockerCount: number;
  forecastSlipHours: number;
  forecastSlipStream: string;
  isAgentOpen?: boolean;
  onDismissBlocker?: () => void;
  onDismissForecast?: () => void;
  onClickBlocker?: () => void;
  isSandboxActive?: boolean;
  sandboxDelta?: { date: number, cost: number } | null;
  onToggleSandbox?: () => void;
  onCommitSandbox?: () => void;
  blockerResolutionCount?: number;
  onDismissResolution?: () => void;
  onBurndownClick?: () => void;
  onCapacityClick?: () => void;
}

const rowVariants: Variants = {
  initial: { opacity: 0, height: 0, marginTop: 0 },
  animate: {
    opacity: 1, height: 'auto', marginTop: 8,
    transition: { type: 'spring' as const, stiffness: 340, damping: 30, opacity: { duration: 0.2 } },
  },
  exit: {
    opacity: 0, height: 0, marginTop: 0,
    transition: { duration: 0.22, ease: 'easeIn' as const },
  },
};

const cardVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, y: -6 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, stiffness: 380, damping: 28 } },
  exit: { opacity: 0, scale: 0.95, y: -4, transition: { duration: 0.16, ease: 'easeIn' as const } },
};

// ── Shared widget shell ───────────────────────────────────────────────────────
function Widget({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={onClick ? { scale: 1.02 } : {}}
      className={cn(
        'relative flex items-center gap-3 px-4 h-[66px] rounded-2xl',
        'bg-[#0b1929]/70 border border-white/[0.07] backdrop-blur-sm',
        'transition-all duration-200',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

export function DailyBriefing({
  blockerCount,
  forecastSlipHours,
  forecastSlipStream,
  isAgentOpen,
  onDismissBlocker,
  onDismissForecast,
  onClickBlocker,
  isSandboxActive,
  sandboxDelta,
  onToggleSandbox,
  onCommitSandbox,
  blockerResolutionCount = 0,
    onDismissResolution,
    onBurndownClick,
    onCapacityClick,
  }: DailyBriefingProps) {
    const { activePersona } = usePersona();
    const isOwner = activePersona === 'Org Owner';
    const hasAnyException = blockerCount > 0 || forecastSlipHours > 0 || blockerResolutionCount > 0;
  
    return (
      <div className="relative z-20 border-b border-white/[0.06] bg-[#020617]/80 backdrop-blur-xl">
        <div className="py-5 relative">
          {isSandboxActive && (
            <div className="absolute inset-0 z-50 bg-[#020617]/95 backdrop-blur-xl flex items-center justify-between px-0 border-b-2 border-amber-500/50 shadow-[0_20px_50px_-12px_rgba(245,158,11,0.15)] transition-all duration-500">
              <div className="flex items-center gap-8 w-full justify-between">
                <div className="flex items-center gap-8">
                  <div>
                    <h3 className="text-amber-500 font-bold tracking-widest uppercase text-[10px] mb-1 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      What-If Mode Active
                    </h3>
                    <p className="text-amber-100/70 text-xs font-medium">
                      {isOwner ? 'Evaluating Margin & Utilization Impact' : 'Evaluating draft scenarios.'}
                    </p>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <AnimatePresence>
                    {sandboxDelta && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                          {isOwner ? 'Strategic Impact Scorecard' : 'Scenario Comparison'}
                        </p>
                        <div className="flex gap-5 bg-black/40 rounded-lg px-4 py-2 border border-white/5">
                          {isOwner ? (
                            <>
                              <span className={cn("font-bold flex items-baseline gap-1 text-sm", sandboxDelta.cost <= 0 ? "text-emerald-400" : "text-amber-400")}>
                                {sandboxDelta.cost <= 0 ? "+" : "-"}${Math.abs(sandboxDelta.cost * 1.5).toFixed(1)}k
                                <span className={cn("text-[10px] uppercase font-bold", sandboxDelta.cost <= 0 ? "text-emerald-500/60" : "text-amber-500/60")}>
                                  Est. Margin
                                </span>
                              </span>
                              <div className="w-px h-full bg-white/10" />
                              <span className={cn("font-bold flex items-baseline gap-1 text-sm", sandboxDelta.date <= 0 ? "text-emerald-400" : "text-amber-400")}>
                                {sandboxDelta.date <= 0 ? "+" : "-"}{Math.abs(sandboxDelta.date * 2)}%
                                <span className={cn("text-[10px] uppercase font-bold", sandboxDelta.date <= 0 ? "text-emerald-500/60" : "text-amber-500/60")}>
                                  Firm Utilization
                                </span>
                              </span>
                            </>
                          ) : (
                            <>
                              <span className={cn("font-bold flex items-baseline gap-1 text-sm", sandboxDelta.date <= 0 ? "text-green-400" : "text-rose-400")}>
                                {sandboxDelta.date <= 0 ? "" : "+"}{sandboxDelta.date} Days
                                <span className={cn("text-[10px] uppercase font-bold", sandboxDelta.date <= 0 ? "text-green-500/60" : "text-rose-500/60")}>
                                  {sandboxDelta.date <= 0 ? "(Earlier)" : "(Later)"} | Finish Date
                                </span>
                              </span>
                              <div className="w-px h-full bg-white/10" />
                              <span className={cn("font-bold flex items-baseline gap-1 text-sm", sandboxDelta.cost <= 0 ? "text-green-400" : "text-rose-400")}>
                                {sandboxDelta.cost <= 0 ? "" : "+"}${sandboxDelta.cost}
                                <span className={cn("text-[10px] uppercase font-bold", sandboxDelta.cost <= 0 ? "text-green-500/60" : "text-rose-500/60")}>
                                  (Tokens) | Cost
                                </span>
                              </span>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}

        {/* ── Row 1: Executive / Status Vitals ─────────────────────────────────────────── */}
        <div className="flex gap-2.5 mb-2.5">
          {isOwner ? (
            <>
              {/* Project ROI */}
              <Widget className="flex-1 hover:border-amber-500/20 hover:bg-amber-950/10 group">
                <div className="w-9 h-9 rounded-xl bg-amber-950/50 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-none mb-1 whitespace-nowrap">Project ROI</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[14px] font-bold text-slate-100 group-hover:text-amber-50 transition-colors leading-none">$124k / $250k</span>
                    <div className="flex gap-0.5 items-end h-2.5">
                       {[30, 45, 35, 60, 55, 75, 70].map((h, i) => (
                         <div key={i} className="w-0.5 bg-amber-500/60 rounded-full" style={{ height: `${h}%` }} />
                       ))}
                    </div>
                  </div>
                </div>
              </Widget>

              {/* Scope Drift */}
              <Widget className="flex-1 hover:border-rose-500/20 hover:bg-rose-950/10 group">
                <div className="w-9 h-9 rounded-xl bg-rose-950/50 border border-rose-500/20 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-none mb-1 whitespace-nowrap">Scope Drift</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[15px] font-bold text-rose-400 transition-colors leading-none">+14%</span>
                    <span className="text-[9px] text-rose-500/70 font-bold uppercase tracking-wide">Amber Risk</span>
                  </div>
                </div>
              </Widget>

              {/* Predictive Stability */}
              <Widget className="flex-1 hover:border-emerald-500/20 hover:bg-emerald-950/10 group">
                <div className="w-9 h-9 rounded-xl bg-emerald-950/50 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-none mb-1 whitespace-nowrap">Predictive Stability</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[15px] font-bold text-slate-100 transition-colors leading-none">94%</span>
                    <span className="text-[9px] text-emerald-500/70 font-bold uppercase tracking-wide">Stable</span>
                  </div>
                </div>
              </Widget>

              {/* Talent ROI */}
              <Widget className="flex-1 hover:border-blue-500/20 hover:bg-blue-950/10 group">
                <div className="w-9 h-9 rounded-xl bg-blue-950/50 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-none mb-1 whitespace-nowrap">Talent Seniority Mix</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[14px] font-bold text-slate-100 transition-colors leading-none">3:1 Sr/Jr</span>
                    <span className="text-[9px] text-blue-500/70 font-bold uppercase tracking-wide">Balanced</span>
                  </div>
                </div>
              </Widget>
            </>
          ) : (
            <div className="flex flex-col gap-2.5 w-full">
              <div className="flex gap-2.5 w-full items-stretch">
                {/* Task 1: Narrative Oracle Briefing */}
                <div className="flex-[2.5] bg-[#0b1929]/40 border border-cyan-500/10 rounded-2xl p-5 flex flex-col justify-center relative overflow-hidden group shadow-[inset_0_0_40px_rgba(34,211,238,0.05)]">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500/50" />
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-cyan-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500/70">Oracle Briefing</span>
                  </div>
                  <p className="text-[14px] text-slate-100 font-medium leading-relaxed max-w-4xl">
                    Phoenix is on forecast for <span className="text-cyan-400 font-bold">June 12</span> at <span className="text-emerald-400 font-bold">92% confidence</span>. Confidence rose 5% since CDC cleared the dependency on legacy auth.
                  </p>
                </div>

                {/* Project Burndown */}
                <Widget 
                  onClick={onBurndownClick}
                  className="flex-[1] hover:border-teal-500/20 hover:bg-teal-950/10 group relative !h-auto min-h-[80px]"
                >
                  <div className="absolute top-2 right-2 transition-opacity">
                     <Maximize2 className="w-3.5 h-3.5 text-slate-500 group-hover:text-teal-400 transition-colors" />
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-teal-950/50 border border-teal-500/20 flex items-center justify-center shrink-0">
                    <TrendingDown className="w-3.5 h-3.5 text-teal-400" />
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-none mb-1 whitespace-nowrap">Project Burndown</p>
                    <div className="flex items-center gap-2.5">
                      <span className="text-[15px] font-bold text-slate-100 group-hover:text-teal-50 transition-colors leading-none">72%</span>
                      <BurndownChart />
                    </div>
                  </div>
                </Widget>
              </div>

              <div className="w-full bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex flex-col sm:flex-row overflow-hidden shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
                {/* Throughput */}
                <div className="flex-1 p-4 border-b sm:border-b-0 sm:border-r border-white/10 flex flex-col justify-center group hover:bg-white/[0.02] transition-colors relative cursor-pointer gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Throughput · 7D</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">Open <ArrowRight className="w-3 h-3" /></span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold text-slate-100 tracking-tight leading-none">14.2</span>
                      <span className="text-[10px] text-slate-500 font-medium leading-none">drops/day</span>
                    </div>
                    <span className="text-[10px] font-bold text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)] leading-none">▲ 8%</span>
                  </div>
                </div>

                {/* Capacity Used */}
                <div 
                  onClick={onCapacityClick}
                  className="flex-1 p-4 border-b sm:border-b-0 sm:border-r border-white/10 flex flex-col justify-center group hover:bg-white/[0.02] transition-colors relative cursor-pointer gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Capacity Used</span>
                    <span className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">Open <ArrowRight className="w-3 h-3" /></span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-slate-100 tracking-tight leading-none">87%</span>
                    <span className="text-[10px] font-bold text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] leading-none">2 hot teammates</span>
                  </div>
                </div>

                {/* On-Time Drop Rate */}
                <div className="flex-1 p-4 border-b sm:border-b-0 sm:border-r border-white/10 flex flex-col justify-center group hover:bg-white/[0.02] transition-colors relative cursor-pointer gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">On-Time Rate</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">Open <ArrowRight className="w-3 h-3" /></span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-slate-100 tracking-tight leading-none">91%</span>
                    <span className="text-[10px] font-bold text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)] leading-none">▲ 3%</span>
                  </div>
                </div>

                {/* Forecast Stability */}
                <div className="flex-1 p-4 flex flex-col justify-center group hover:bg-white/[0.02] transition-colors relative cursor-pointer gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Forecast Stability</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">Open <ArrowRight className="w-3 h-3" /></span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold text-slate-100 tracking-tight leading-none">±1.2</span>
                      <span className="text-[10px] text-slate-500 font-medium leading-none">days</span>
                    </div>
                    <span className="text-[10px] font-bold text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)] leading-none">tight band</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Row 2: Human Intervention / Executive Accountability ───────────────────────── */}
        {isOwner && (
          <div className="flex gap-2.5 mt-2.5">
            <>
              {/* Execution Accuracy */}
              <Widget className="flex-1 border-emerald-500/20 bg-emerald-950/10 group">
                <div className="w-9 h-9 rounded-xl bg-emerald-950/50 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[9px] text-emerald-500/50 font-bold uppercase tracking-wider leading-none mb-1 whitespace-nowrap">Execution Accuracy</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[15px] font-bold text-emerald-400 leading-none">108%</span>
                    <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wide">Latency</span>
                  </div>
                </div>
              </Widget>

              {/* Milestone Confidence */}
              <Widget className="flex-[1.5] border-cyan-500/20 bg-cyan-950/10 group relative overflow-hidden">
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />
                <div className="w-9 h-9 rounded-xl bg-cyan-950/50 border border-cyan-500/20 flex items-center justify-center shrink-0">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <p className="text-[9px] text-cyan-500/50 font-bold uppercase tracking-wider leading-none mb-1 whitespace-nowrap">Milestone Confidence</p>
                  <div className="flex items-center gap-4">
                    <span className="text-[15px] font-bold text-cyan-100 leading-none">Beta Launch (82%)</span>
                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '82%' }}
                        className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" 
                      />
                    </div>
                  </div>
                </div>
              </Widget>
            </>
          </div>
        )}
      </div>
    </div>
  );
}
