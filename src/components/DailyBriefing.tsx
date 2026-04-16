'use client';

import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { AlertTriangle, TrendingUp, X, Activity, Brain, TrendingDown, Link2 } from 'lucide-react';
import { BurndownChart } from './BurndownChart';
import { cn } from '@/lib/utils';

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
}: DailyBriefingProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const hasAnyException = blockerCount > 0 || forecastSlipHours > 0 || blockerResolutionCount > 0;

  return (
    <div className="relative z-20 border-b border-white/[0.06] bg-[#020617]/80 backdrop-blur-xl">
      <div
        className={cn(
          'pt-3.5 pb-3.5 transition-all duration-500 pl-0',
          isAgentOpen ? 'pr-[392px]' : 'pr-8'
        )}
      >
        {isSandboxActive && (
          <div className="absolute inset-0 z-50 bg-[#020617]/95 backdrop-blur-xl flex items-center justify-between px-0 border-b-2 border-amber-500/50 shadow-[0_20px_50px_-12px_rgba(245,158,11,0.15)]">
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

        {/* ── Row 1: Status Vitals ─────────────────────────────────────────── */}
        <div className="flex gap-2.5 mb-2.5">
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
            onClick={() => { }}
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

        {/* ── Row 2: Human Intervention Requests ───────────────────────── */}
        <div className="flex gap-2.5">
          <AnimatePresence mode="popLayout">
            {/* Blocker Resolution */}
            <motion.div key="resolution" variants={cardVariants} initial="initial" animate="animate" exit="exit" layout className="flex-1">
              <Widget
                className={cn(
                  'w-full transition-all duration-300',
                  blockerResolutionCount > 0 
                    ? 'border-rose-500/25 hover:border-rose-500/50 shadow-[0_0_20px_rgba(225,29,72,0.08)]' 
                    : 'opacity-40 grayscale-[0.5] border-white/5'
                )}
              >
                <div className={cn(
                  "w-9 h-9 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                  blockerResolutionCount > 0 ? "bg-rose-950/60 border-rose-500/30" : "bg-slate-900/40 border-slate-800"
                )}>
                  <AlertTriangle className={cn("w-3.5 h-3.5", blockerResolutionCount > 0 ? "text-rose-400" : "text-slate-600")} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-[9px] font-bold uppercase tracking-widest leading-none mb-1", blockerResolutionCount > 0 ? "text-rose-400" : "text-slate-500")}>
                    Blockers
                  </p>
                  <p className="text-xs text-slate-300 leading-snug truncate">
                    {blockerResolutionCount > 0 
                      ? <span className="text-rose-400 font-semibold">{blockerResolutionCount} required</span>
                      : 'No active blockers'}
                  </p>
                </div>
                {blockerResolutionCount > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDismissResolution?.(); }}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-rose-700/50 hover:text-rose-300 hover:bg-rose-900/40 transition-all shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </Widget>
            </motion.div>

            {/* Forecast Slip */}
            <motion.div key="forecast" variants={cardVariants} initial="initial" animate="animate" exit="exit" layout className="flex-1">
              <Widget
                className={cn(
                  'w-full transition-all duration-300',
                  forecastSlipHours > 0
                    ? 'border-amber-500/25 hover:border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.08)]'
                    : 'opacity-40 grayscale-[0.5] border-white/5'
                )}
              >
                <div className={cn(
                  "w-9 h-9 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                  forecastSlipHours > 0 ? "bg-amber-950/60 border-amber-500/30" : "bg-slate-900/40 border-slate-800"
                )}>
                  <TrendingUp className={cn("w-3.5 h-3.5", forecastSlipHours > 0 ? "text-amber-400" : "text-slate-600")} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-[9px] font-bold uppercase tracking-widest leading-none mb-1", forecastSlipHours > 0 ? "text-amber-400" : "text-slate-500")}>
                    Forecast Slip
                  </p>
                  <p className="text-xs text-slate-300 leading-snug truncate">
                    {forecastSlipHours > 0 
                      ? <><span className="text-amber-400 font-semibold">+{forecastSlipHours}h</span> slip</>
                      : 'On schedule'}
                  </p>
                </div>
                {forecastSlipHours > 0 && (
                  <button
                    onClick={onDismissForecast}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-amber-700/50 hover:text-amber-300 hover:bg-amber-900/40 transition-all shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </Widget>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
