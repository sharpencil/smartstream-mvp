'use client';

import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown, CheckCircle2, CircleDashed, Activity, ListChecks, Info, Zap, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STREAM_COLORS, getStreamColor } from '@/lib/streams';
import { STAGING_STREAMS, StagingStream, StagingDrop } from '@/lib/stagingData';
import { useState } from 'react';

// ── Drop Row ─────────────────────────────────────────────────────────────────

function DropRow({ drop, idx, streamColorHex }: { drop: StagingDrop; idx: number; streamColorHex: string }) {
  const [expanded, setExpanded] = useState(false);
  const isCompleted = drop.status === 'Completed';
  const isNotStarted = drop.status === 'Not Started';

  return (
    <div
      className={cn(
        'rounded-2xl border transition-all duration-300 overflow-hidden',
        isCompleted
          ? 'bg-green-950/10 border-green-500/20'
          : isNotStarted
          ? 'bg-slate-900/40 border-white/5'
          : 'bg-cyan-950/20 border-cyan-500/20'
      )}
    >
      {/* Drop header row */}
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center gap-4 px-5 py-3.5 text-left group/drop outline-none hover:bg-white/[0.02] transition-colors"
      >
        <span className="text-xs font-mono text-slate-600 font-bold w-5 shrink-0">{idx + 1}.</span>

        {/* Status icon */}
        {isCompleted ? (
          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
        ) : isNotStarted ? (
          <CircleDashed className="w-4 h-4 text-slate-500/60 shrink-0" />
        ) : (
          <div className="w-4 h-4 shrink-0 rounded-full border-2 border-cyan-400 flex items-center justify-center animate-pulse">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          </div>
        )}

        {/* Title */}
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'text-sm font-medium leading-snug line-clamp-2',
              isCompleted ? 'text-green-100' : isNotStarted ? 'text-slate-400' : 'text-cyan-100'
            )}
          >
            {drop.title}
          </p>
        </div>

        {/* Meta badges */}
        <div className="flex items-center gap-2 shrink-0">
          {drop.dependsOn && drop.dependsOn.length > 0 && (
            <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-950/30 text-amber-500 border border-amber-500/30">
              <Link2 className="w-2.5 h-2.5" />
              Dep: {drop.dependsOn.length}
            </span>
          )}
          <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/50"
            style={{ color: streamColorHex }}>
            C{drop.complexity}
          </span>
          <span className={cn(
            'text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border',
            isCompleted
              ? 'bg-green-950/40 text-green-400 border-green-500/30'
              : isNotStarted
              ? 'bg-slate-800/60 text-slate-500 border-slate-700/30'
              : 'bg-cyan-950/40 text-cyan-400 border-cyan-500/30'
          )}>
            {drop.status}
          </span>
          {drop.tasks.length > 0 && (
            <ChevronDown
              className={cn(
                'w-3.5 h-3.5 text-slate-500 transition-transform duration-200',
                expanded && 'rotate-180'
              )}
            />
          )}
        </div>
      </button>

      {/* Expandable task list */}
      {expanded && drop.tasks.length > 0 && (
        <div className="px-5 pb-4 pt-1 border-t border-white/5">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
            <ListChecks className="w-3 h-3" />
            Implementation Tasks ({drop.tasks.length})
          </p>
          <ul className="space-y-2">
            {drop.tasks.map((task, ti) => (
              <li key={ti} className="flex gap-2.5 text-[11px] text-slate-300 leading-relaxed">
                <span
                  className="shrink-0 w-4 h-4 rounded-full border flex items-center justify-center text-[8px] font-bold mt-0.5"
                  style={{ borderColor: `${streamColorHex}50`, color: streamColorHex }}
                >
                  {ti + 1}
                </span>
                <span>{task}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Stream Accordion ──────────────────────────────────────────────────────────

export function StreamAccordion({ type = 'drafted', showDrops = true }: { type?: 'drafted' | 'active'; showDrops?: boolean }) {
  // Use staging streams for both modes — 'drafted' shows all, 'active' shows ones with completed drops
  // Both modes show the STAGING_STREAMS in this project view
  const streams = STAGING_STREAMS;

  return (
    <Accordion.Root
      type="multiple"
      defaultValue={streams.slice(0, 2).map((s) => s.id)}
      className="w-full flex flex-col gap-4 z-10 max-w-4xl mx-auto"
    >
      {streams.map((stream) => {
        const colorHex = getStreamColor(stream.colorKey).hex;
        const totalDrops = stream.drops.length;
        const completedDrops = stream.drops.filter((d) => d.status === 'Completed').length;
        const notStarted = stream.drops.filter((d) => d.status === 'Not Started').length;
        const inProgress = totalDrops - completedDrops - notStarted;
        const progressPct = totalDrops > 0 ? Math.round((completedDrops / totalDrops) * 100) : 0;

        return (
          <Accordion.Item
            key={stream.id}
            value={stream.id}
            className="border border-white/5 bg-[#0a192f]/60 backdrop-blur-xl rounded-[24px] overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-all focus-within:border-teal-500/30 group"
          >
            <Accordion.Header className="flex m-0">
              <Accordion.Trigger
                className={cn(
                  'flex flex-1 items-center justify-between p-6 transition-all w-full outline-none relative overflow-hidden hover:bg-white/[0.02]'
                )}
              >
                {/* Color bar */}
                <div className="absolute top-0 left-0 bottom-0 w-1 opacity-80" style={{ backgroundColor: colorHex }} />

                <div className="flex items-center gap-5 flex-1 min-w-0">
                  {/* Initials badge */}
                  <div
                    className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 border shrink-0"
                    style={{ borderColor: `${colorHex}40`, boxShadow: `inset 0 0 12px ${colorHex}15` }}
                  >
                    <span className="font-mono text-xs font-bold leading-none text-center" style={{ color: colorHex }}>
                      {stream.initials}
                    </span>
                  </div>

                  <div className="flex flex-col items-start gap-1.5 flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-slate-100 tracking-wide leading-tight">{stream.title}</h3>

                    {/* Meta row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={cn(
                          'text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest border',
                          stream.priority === 'High'
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                            : stream.priority === 'Medium-High'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        )}
                      >
                        {stream.priority}
                      </span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest border bg-slate-800/60 text-slate-400 border-slate-700/30">
                        Complexity {stream.complexity}/9
                      </span>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                        {totalDrops} Drops · {completedDrops} done
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full max-w-xs h-1 bg-slate-800/80 rounded-full overflow-hidden mt-0.5">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${progressPct}%`,
                          backgroundColor: colorHex,
                          boxShadow: `0 0 8px ${colorHex}60`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {showDrops && (
                  <ChevronDown className="w-5 h-5 text-slate-400 group-data-[state=open]:rotate-180 group-data-[state=open]:text-teal-400 transition-transform duration-300 shrink-0 ml-4" />
                )}
              </Accordion.Trigger>
            </Accordion.Header>

            {showDrops && (
              <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down border-t border-white/5 bg-[#020617]/50 relative">
                <div className="p-6 flex flex-col gap-4">

                  {/* Stream description */}
                  {stream.description && (
                    <div className="flex gap-3 bg-slate-900/60 border border-white/5 rounded-2xl p-4">
                      <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-400 leading-relaxed">{stream.description}</p>
                    </div>
                  )}

                  {/* Status summary bar */}
                  <div className="flex items-center gap-0 bg-slate-900/60 border border-slate-800/50 rounded-xl overflow-hidden">
                    <div className="flex flex-col flex-1 items-center justify-center py-2.5 border-r border-slate-800/50">
                      <span className="text-[9px] uppercase font-bold text-slate-500 tracking-widest mb-0.5">Not Started</span>
                      <div className="flex items-center gap-1.5">
                        <CircleDashed className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-sm font-bold text-slate-400">{notStarted}</span>
                      </div>
                    </div>
                    <div className="flex flex-col flex-1 items-center justify-center py-2.5 border-r border-slate-800/50">
                      <span className="text-[9px] uppercase font-bold text-slate-500 tracking-widest mb-0.5">In Progress</span>
                      <div className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-sm font-bold text-cyan-300">{inProgress}</span>
                      </div>
                    </div>
                    <div className="flex flex-col flex-1 items-center justify-center py-2.5">
                      <span className="text-[9px] uppercase font-bold text-slate-500 tracking-widest mb-0.5">Completed</span>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-sm font-bold text-green-300">{completedDrops}</span>
                      </div>
                    </div>
                  </div>

                  {/* Drop list */}
                  <div className="flex flex-col gap-2">
                    {stream.drops.map((drop, idx) => (
                      <DropRow key={drop.drop_id} drop={drop} idx={idx} streamColorHex={colorHex} />
                    ))}
                  </div>
                </div>
              </Accordion.Content>
            )}
          </Accordion.Item>
        );
      })}
    </Accordion.Root>
  );
}
