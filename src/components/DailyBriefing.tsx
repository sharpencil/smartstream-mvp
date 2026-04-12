'use client';

import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { AlertTriangle, Zap, TrendingUp, X, Activity, Brain, TrendingDown, Link2 } from 'lucide-react';
import { BurndownChart } from './BurndownChart';
import { cn } from '@/lib/utils';

interface DailyBriefingProps {
  blockerCount: number;
  idleCount: number;
  forecastSlipHours: number;
  forecastSlipStream: string;
  isAgentOpen?: boolean;
  onDismissBlocker?: () => void;
  onDismissIdle?: () => void;
  onDismissForecast?: () => void;
  onClickBlocker?: () => void;
  onClickIdle?: () => void;
  isSandboxActive?: boolean;
  sandboxDelta?: { date: number, cost: number } | null;
  onToggleSandbox?: () => void;
  onCommitSandbox?: () => void;
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
  exit:    { opacity: 0, scale: 0.95, y: -4, transition: { duration: 0.16, ease: 'easeIn' as const } },
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
    <div
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-3 px-4 h-[66px] rounded-2xl',
        'bg-[#0b1929]/70 border border-white/[0.07] backdrop-blur-sm',
        'transition-all duration-200',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DailyBriefing({
  blockerCount,
  idleCount,
  forecastSlipHours,
  forecastSlipStream,
  isAgentOpen,
  onDismissBlocker,
  onDismissIdle,
  onDismissForecast,
  onClickBlocker,
  onClickIdle,
  isSandboxActive,
  sandboxDelta,
  onToggleSandbox,
  onCommitSandbox,
}: DailyBriefingProps) {
  const hasAnyException = blockerCount > 0 || idleCount > 0 || forecastSlipHours > 0;

  return (
    <div className="relative z-20 border-b border-white/[0.06] bg-[#020617]/80 backdrop-blur-xl">
      {/*
        Outer padding drives both rows.
        pr-[392px] = 360px fixed panel + 32px gap → nothing clips behind the agent panel.
        Both rows inherit this, so alignment is guaranteed to match.
      */}
      <div
        className={cn(
          'px-8 pt-3.5 pb-3.5 transition-all duration-500',
          isAgentOpen ? 'pr-[392px]' : 'pr-8'
        )}
      >
        {isSandboxActive && (
          <div className="absolute inset-0 z-50 bg-[#020617]/95 backdrop-blur-xl flex items-center justify-between px-8 border-b-2 border-amber-500/50 shadow-[0_20px_50px_-12px_rgba(245,158,11,0.15)]">
            <div className="flex items-center gap-8 w-full justify-between">
              <div className="flex items-center gap-8">
                <div>
                  <h3 className="text-amber-500 font-bold tracking-widest uppercase text-[10px] mb-1 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Simulation Mode Active
                  </h3>
                  <p className="text-amber-100/70 text-xs font-medium">Evaluating what-if scenarios.</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <AnimatePresence>
                  {sandboxDelta && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                        Scenario Comparison
                      </p>
                      <div className="flex gap-5 bg-black/40 rounded-lg px-4 py-2 border border-white/5">
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
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

        {/* Label */}
        <div className="flex items-center gap-2 mb-2.5">
          <div className={cn(
            'w-1.5 h-1.5 rounded-full transition-colors duration-500',
            hasAnyException ? 'bg-rose-500 animate-pulse' : 'bg-green-500'
          )} />
          <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-slate-500">
            Pulse Overview
          </span>
          {!hasAnyException && (
            <motion.span
              key="nominal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[10px] text-green-500/60 font-medium tracking-wide"
            >
              — All systems nominal
            </motion.span>
          )}
        </div>

        {/* ── Row 1: Status Vitals ─────────────────────────────────────────── */}
        {/* flex-1 on each card stretches them evenly across the full available width */}
        <div className="flex gap-2.5">

          {/* Project Health */}
          <Widget className="flex-1 hover:border-green-500/20 hover:bg-green-950/10 group">
            <div className="w-9 h-9 rounded-full border-2 border-slate-700 relative flex items-center justify-center shrink-0">
              <div className="absolute inset-0 rounded-full border-2 border-green-500/80 [clip-path:inset(0_0_0_14%)]" />
              <Activity className="w-3.5 h-3.5 text-green-500" />
            </div>
            <div>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-none mb-1">Project Health</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[15px] font-bold text-slate-100 group-hover:text-green-50 transition-colors leading-none">88%</span>
                <span className="text-[9px] text-green-500/70 font-bold uppercase tracking-wide">On Track</span>
              </div>
            </div>
          </Widget>

          {/* Project Burndown */}
          <Widget className="flex-1 hover:border-teal-500/20 hover:bg-teal-950/10 group">
            <div className="w-9 h-9 rounded-xl bg-teal-950/50 border border-teal-500/20 flex items-center justify-center shrink-0">
              <TrendingDown className="w-3.5 h-3.5 text-teal-400" />
            </div>
            <div>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-none mb-1">Project Burndown</p>
              <div className="flex items-center gap-2.5">
                <span className="text-[15px] font-bold text-slate-100 group-hover:text-teal-50 transition-colors leading-none">72%</span>
                <BurndownChart />
              </div>
            </div>
          </Widget>

          {/* Completion Forecast */}
          <Widget className="flex-1 hover:border-indigo-500/20 hover:bg-indigo-950/10 group">
            <div className="w-9 h-9 rounded-xl bg-indigo-950/50 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <Brain className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-none mb-1">Completion Forecast</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[15px] font-bold text-slate-100 group-hover:text-indigo-50 transition-colors leading-none">Jun 12</span>
                <span className="text-[9px] text-green-500/70 font-bold tracking-widest uppercase">92% Conf</span>
              </div>
            </div>
          </Widget>

          {/* Upstream Health */}
          <Widget 
            onClick={() => {}} 
            className="flex-1 hover:border-purple-500/20 hover:bg-purple-950/10 group"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-950/50 border border-purple-500/20 flex items-center justify-center shrink-0 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-shadow">
              <Link2 className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-none mb-1">Upstream Health</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[13px] font-bold text-slate-100 group-hover:text-purple-100 transition-colors leading-tight">Blocked by API</span>
              </div>
            </div>
          </Widget>

        </div>

        {/* ── Row 2: Exception / Intervention Cards ───────────────────────── */}
        {/* The row itself animates in/out. Individual cards also animate in/out. */}
        <AnimatePresence initial={false}>
          {hasAnyException && (
            <motion.div
              key="exception-row"
              variants={rowVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="overflow-hidden"
            >
              <div className="flex gap-2.5">

                <AnimatePresence mode="popLayout">

                  {/* Blockers */}
                  {blockerCount > 0 && (
                    <motion.div key="blocker" variants={cardVariants} initial="initial" animate="animate" exit="exit" layout className="flex-1">
                      <Widget
                        onClick={onClickBlocker}
                        className={cn(
                          'w-full border-rose-500/30 hover:border-rose-500/60',
                          'shadow-[0_0_20px_rgba(225,29,72,0.12)] hover:shadow-[0_0_28px_rgba(225,29,72,0.25)]',
                          'before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:rounded-t-2xl',
                          'before:bg-gradient-to-r before:from-rose-600/0 before:via-rose-500/80 before:to-rose-600/0',
                        )}
                      >
                        <div className="relative shrink-0">
                          <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" />
                          <div className="w-9 h-9 rounded-full bg-rose-950/60 border border-rose-500/40 flex items-center justify-center relative z-10">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-bold text-rose-400 uppercase tracking-widest leading-none mb-1">
                            {blockerCount} Blocker{blockerCount !== 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-slate-300 leading-snug truncate">
                            {blockerCount === 1 ? '1 Drop blocked.' : `${blockerCount} Drops blocked.`}{' '}
                            <span className="text-rose-400 font-medium">Reassign →</span>
                          </p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDismissBlocker?.(); }}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-rose-700/50 hover:text-rose-300 hover:bg-rose-900/40 transition-all shrink-0"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Widget>
                    </motion.div>
                  )}

                  {/* Idle Capacity */}
                  {idleCount > 0 && (
                    <motion.div key="idle" variants={cardVariants} initial="initial" animate="animate" exit="exit" layout className="flex-1">
                      <Widget
                        onClick={onClickIdle}
                        className={cn(
                          'w-full border-cyan-500/25 hover:border-cyan-400/50',
                          'shadow-[0_0_20px_rgba(6,182,212,0.10)] hover:shadow-[0_0_28px_rgba(6,182,212,0.22)]',
                          'before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:rounded-t-2xl',
                          'before:bg-gradient-to-r before:from-cyan-600/0 before:via-cyan-400/80 before:to-cyan-600/0',
                        )}
                      >
                        <div className="relative shrink-0">
                          <div className="absolute inset-0 rounded-full bg-cyan-400/15 animate-[ping_2s_ease-out_infinite]" />
                          <div className="w-9 h-9 rounded-full bg-cyan-950/60 border border-cyan-400/40 flex items-center justify-center relative z-10">
                            <Zap className="w-3.5 h-3.5 text-cyan-400" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest leading-none mb-1">
                            Idle Capacity
                          </p>
                          <p className="text-xs text-slate-300 leading-snug truncate">
                            {idleCount === 1 ? '1 Drop' : `${idleCount} Drops`} ready.{' '}
                            <span className="text-cyan-400 font-medium">Assign now →</span>
                          </p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDismissIdle?.(); }}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-cyan-700/50 hover:text-cyan-300 hover:bg-cyan-900/40 transition-all shrink-0"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Widget>
                    </motion.div>
                  )}

                  {/* Forecast Slip */}
                  {forecastSlipHours > 0 && (
                    <motion.div key="forecast" variants={cardVariants} initial="initial" animate="animate" exit="exit" layout className="flex-1">
                      <Widget
                        className={cn(
                          'w-full border-amber-500/25 hover:border-amber-500/50',
                          'shadow-[0_0_20px_rgba(245,158,11,0.08)] hover:shadow-[0_0_28px_rgba(245,158,11,0.18)]',
                          'before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:rounded-t-2xl',
                          'before:bg-gradient-to-r before:from-amber-600/0 before:via-amber-400/80 before:to-amber-600/0',
                        )}
                      >
                        <div className="w-9 h-9 rounded-full bg-amber-950/60 border border-amber-500/30 flex items-center justify-center shrink-0">
                          <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-bold text-amber-400 uppercase tracking-widest leading-none mb-1">
                            Forecast Slip +{forecastSlipHours}h
                          </p>
                          <p className="text-xs text-slate-300 leading-snug truncate">
                            Due to <span className="text-amber-400 font-semibold">{forecastSlipStream}</span> complexity.
                          </p>
                        </div>
                        <button
                          onClick={onDismissForecast}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-amber-700/50 hover:text-amber-300 hover:bg-amber-900/40 transition-all shrink-0"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Widget>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
