'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgentPanel, FeedItem } from './AgentPanel';
import { Drop, DropState } from './Drop';
import { DailyBriefing } from './DailyBriefing';
import { cn } from '@/lib/utils';
import { GLOBAL_STREAMS, STREAM_COLORS, Reference } from '@/lib/streams';
import { Zap, PlayCircle, CheckCircle2 } from 'lucide-react';
import { BacklogTray } from './BacklogTray';

export interface DropData {
  id: string;
  lane: number;
  title: string;
  state: DropState;
  effortHours: number;
  xOffset: number;
  isBlocked?: boolean;
  references?: Reference[];
  streamId?: string;
  dependsOn?: string[];
}

interface Milestone {
  id: string;
  label: string;
  xOffset: number; // canvas-space x (pre-zoom)
}

const TEAM_MEMBERS = [
  { id: '1', name: 'Sarah' },
  { id: '2', name: 'Mike' },
  { id: '3', name: 'Alex' },
  { id: '4', name: 'Elena' },
  { id: '5', name: 'David' },
];

const MILESTONES: Milestone[] = [
  { id: 'm1', label: 'MVP Demo',        xOffset: 540 },
  { id: 'm2', label: 'Beta Release',    xOffset: 740 },
  { id: 'm3', label: 'Production Push', xOffset: 960 },
];

const INITIAL_DROPS: DropData[] = [
  { id: 'd1',  lane: 0, title: 'Auth Service',       state: 'completed', effortHours: 2.5, xOffset: 20,  streamId: 's_auth' },
  { id: 'd2',  lane: 0, title: 'API Routes',         state: 'active',    effortHours: 2,   xOffset: 260, streamId: 's_auth',   references: [{ type: 'doc', label: 'API Spec' }], dependsOn: ['d7'] },
  { id: 'd3',  lane: 0, title: 'Role Based Access',  state: 'ghost',     effortHours: 3,   xOffset: 480, streamId: 's_infra' },
  { id: 'd3b', lane: 0, title: 'OAuth Providers',    state: 'ghost',     effortHours: 2,   xOffset: 760, streamId: 's_ux' },

  { id: 'd4',  lane: 1, title: 'DB Migration',       state: 'completed', effortHours: 3,   xOffset: 50,  streamId: 's_infra' },
  { id: 'd5',  lane: 1, title: 'QA Defect Fixes',    state: 'active',    effortHours: 2,   xOffset: 320, isBlocked: true, streamId: 's_infra', references: [{ type: 'stream', targetId: 's_auth' }], dependsOn: ['d9', 'd13'] },
  { id: 'd5b', lane: 1, title: 'Performance Testing',state: 'ghost',     effortHours: 2,   xOffset: 550, streamId: 's_comms' },
  { id: 'd5c', lane: 1, title: 'Release Candidate',  state: 'ghost',     effortHours: 1.5, xOffset: 760, streamId: 's_comms' },

  { id: 'd6',  lane: 2, title: 'Onboarding UI',      state: 'completed', effortHours: 4,   xOffset: 0,   streamId: 's_ux' },
  { id: 'd7',  lane: 2, title: 'User Settings',      state: 'ghost',     effortHours: 3,   xOffset: 450, streamId: 's_ux' },
  { id: 'd7b', lane: 2, title: 'Profile Editing',    state: 'ghost',     effortHours: 2,   xOffset: 740, streamId: 's_billing' },

  { id: 'd8',  lane: 3, title: 'Payment Gateway',    state: 'active',    effortHours: 4.5, xOffset: 80,  streamId: 's_billing', references: [{ type: 'design', label: 'Figma' }] },
  { id: 'd9',  lane: 3, title: 'Invoice PDF',        state: 'ghost',     effortHours: 2,   xOffset: 560, streamId: 's_auth' },
  { id: 'd9b', lane: 3, title: 'Tax Integration',    state: 'ghost',     effortHours: 3,   xOffset: 760, streamId: 's_billing' },

  { id: 'd10', lane: 4, title: 'Email Templates',    state: 'completed', effortHours: 2,   xOffset: 30,  streamId: 's_comms' },
  { id: 'd11', lane: 4, title: 'Notification Logs',  state: 'completed', effortHours: 1.5, xOffset: 220, streamId: 's_comms' },
  { id: 'd12', lane: 4, title: 'Analytics Event',    state: 'active',    effortHours: 1.2, xOffset: 370, streamId: 's_infra' },
  { id: 'd13', lane: 4, title: 'Dashboard Chart',    state: 'ghost',     effortHours: 2,   xOffset: 530, streamId: 's_ux',   references: [{ type: 'stream', targetId: 's_billing' }] },
  { id: 'd14', lane: 4, title: 'Export PDF',         state: 'ghost',     effortHours: 1.5, xOffset: 740, streamId: 's_comms' },
];

const NOW_LINE_X = 420;

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the right edge x (canvas space) of a drop */
function dropRightEdge(drop: DropData, zoomScale: number) {
  const width = Math.max(120 * zoomScale, drop.effortHours * 80 * zoomScale);
  return (drop.xOffset * zoomScale) + width;
}

// ── Main Component ────────────────────────────────────────────────────────────

export function PulseDashboard() {
  const [drops, setDrops] = useState<DropData[]>(INITIAL_DROPS);
  const [unassignedDrops, setUnassignedDrops] = useState<DropData[]>([
    { id: 'b1', lane: -1, title: 'GDPR Compliance', state: 'ghost', effortHours: 3, xOffset: 0, streamId: 's_infra' },
    { id: 'b2', lane: -1, title: 'Telemetry Agent', state: 'ghost', effortHours: 2, xOffset: 0, streamId: 's_infra' },
    { id: 'b3', lane: -1, title: 'SSO Integration', state: 'ghost', effortHours: 4, xOffset: 0, streamId: 's_auth' }
  ]);
  const [zoomScale, setZoomScale] = useState(1);
  
  // Sandbox State
  const [isSandboxActive, setIsSandboxActive] = useState(false);
  const [sandboxSnapshot, setSandboxSnapshot] = useState<{ drops: DropData[], unassigned: DropData[] } | null>(null);

  const sandboxDelta = useMemo(() => {
    if (!isSandboxActive || !sandboxSnapshot) return null;
    let isDirty = false;
    let daysOffset = 0;
    for (const d of drops) {
      const snapD = sandboxSnapshot.drops.find(sd => sd.id === d.id);
      if (!snapD || snapD.xOffset !== d.xOffset || snapD.lane !== d.lane) {
        isDirty = true;
        if (snapD) daysOffset += Math.round((d.xOffset - snapD.xOffset) / 80);
      }
    }
    // Check if drops were removed or unassigned changed
    if (drops.length !== sandboxSnapshot.drops.length || unassignedDrops.length !== sandboxSnapshot.unassigned.length) {
      isDirty = true;
    }
    if (!isDirty) return null;
    // Add some variance or keep it simple
    const days = daysOffset === 0 ? -2 : daysOffset;
    const cost = days * -75; // arbitrary
    return { date: days, cost: Math.abs(cost) };
  }, [isSandboxActive, drops, unassignedDrops, sandboxSnapshot]);

  const [hoveredStreamId, setHoveredStreamId] = useState<string | null>(null);
  const [hoveredDropId, setHoveredDropId] = useState<string | null>(null);

  // Briefing dismissal state (independent of data — PM can snooze)
  const [blockerDismissed, setBlockerDismissed] = useState(false);
  const [idleDismissed, setIdleDismissed] = useState(false);
  const [forecastDismissed, setForecastDismissed] = useState(false);
  const [forecastSlipHours, setForecastSlipHours] = useState(4);

  const [memberVelocity, setMemberVelocity] = useState<Record<string, number>>({
    '1': 0, '2': -4, '3': 5, '4': 12, '5': -2
  });

  const [isAgentOpen, setIsAgentOpen] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [feed, setFeed] = useState<FeedItem[]>([
    {
      id: 'f1',
      type: 'suggestion',
      text: <span><span className="text-cyan-400 font-medium">Suggestion:</span> Sarah is projected to finish &quot;API Auth&quot; 2 hours early today. Should I pull &quot;Role Based Access&quot; into her afternoon Ghost Drop?</span>
    },
    {
      id: 'f2',
      type: 'alert',
      text: <span><span className="text-rose-400 font-medium">Blocker Risk:</span> The current active drop for Mike depends on the database migration, which has encountered 3 retry failures in QA.</span>
    }
  ]);

  // ── Derived Briefing State ───────────────────────────────────────────────

  const blockerCount = useMemo(() => drops.filter(d => d.isBlocked).length, [drops]);

  const idleLanes = useMemo<number[]>(() => {
    // A lane is 'idle' if its last active drop is completed and there's no subsequent active drop
    const result: number[] = [];
    TEAM_MEMBERS.forEach((_, laneIdx) => {
      const lane = drops.filter(d => d.lane === laneIdx);
      const hasActive = lane.some(d => d.state === 'active');
      const hasGhost = lane.some(d => d.state === 'ghost');
      const allDoneOrGhost = lane.every(d => d.state === 'completed' || d.state === 'ghost');
      if (!hasActive && allDoneOrGhost && hasGhost) result.push(laneIdx);
    });
    return result;
  }, [drops]);

  const idleCount = idleLanes.length;

  // ── Milestone Conflict Detection ──────────────────────────────────────────

  // A milestone is 'violated' only when a ghost drop genuinely CROSSES the line
  // (its start is before the milestone AND its right edge extends past it).
  // Drops entirely before or entirely after a milestone are not violations.
  const violatedMilestoneIds = useMemo<Set<string>>(() => {
    const violated = new Set<string>();
    drops
      .filter(d => d.state === 'ghost')
      .forEach(drop => {
        const rightEdge = drop.xOffset + (Math.max(120, drop.effortHours * 80));
        MILESTONES.forEach(m => {
          if (drop.xOffset < m.xOffset && rightEdge > m.xOffset) violated.add(m.id);
        });
      });
    return violated;
  }, [drops]);

  const violatingDropIds = useMemo<Set<string>>(() => {
    const result = new Set<string>();
    drops
      .filter(d => d.state === 'ghost')
      .forEach(drop => {
        const rightEdge = drop.xOffset + (Math.max(120, drop.effortHours * 80));
        if (MILESTONES.some(m => drop.xOffset < m.xOffset && rightEdge > m.xOffset)) result.add(drop.id);
      });
    return result;
  }, [drops]);

  // ── Drop Actions ────────────────────────────────────────────────────────

  const handleDropAction = (id: string, action: 'complete' | 'block' | 'in-progress' | 'ghost' | 'remove', rationale?: string) => {
    setIsThinking(true);

    setTimeout(() => {
      setDrops(prev => {
        const targetDropIdx = prev.findIndex(d => d.id === id);
        if (targetDropIdx === -1) return prev;

        const target = prev[targetDropIdx];
        const lane = target.lane;
        const shiftsLeft = action === 'complete' || action === 'remove';
        const shiftsRight = action === 'block';
        const unblocks = (action === 'in-progress' || action === 'ghost') && target.isBlocked;

        const SHIFT_AMOUNT = 80;
        let newDrops = [...prev];

        if (action === 'remove') {
          newDrops = newDrops.filter(d => d.id !== id);
        } else {
          let newState = target.state;
          if (action === 'complete') newState = 'completed';
          if (action === 'in-progress') newState = 'active';
          if (action === 'ghost') newState = 'ghost';

          newDrops[targetDropIdx] = {
            ...target,
            state: newState,
            isBlocked: action === 'block',
            xOffset: shiftsLeft ? target.xOffset - 20 : target.xOffset,
          };
        }

        if (action === 'complete') {
          setMemberVelocity(mPrev => ({ ...mPrev, [(lane + 1).toString()]: (mPrev[(lane + 1).toString()] || 0) + 2 }));
        } else if (action === 'block') {
          setMemberVelocity(mPrev => ({ ...mPrev, [(lane + 1).toString()]: (mPrev[(lane + 1).toString()] || 0) - 3 }));
        }

        const processShift = (dropId: string, shiftVal: number) => {
          const targetItem = newDrops.find(d => d.id === dropId);
          const deps = targetItem?.dependsOn || [];
          deps.forEach(depId => {
            const depIdx = newDrops.findIndex(d => d.id === depId);
            if (depIdx > -1) {
              newDrops[depIdx] = { ...newDrops[depIdx], xOffset: newDrops[depIdx].xOffset + shiftVal };
            }
          });
        };

        if (shiftsLeft || shiftsRight || unblocks) {
          let offsetShift = 0;
          if (shiftsLeft) offsetShift = -SHIFT_AMOUNT;
          if (shiftsRight) offsetShift = SHIFT_AMOUNT;
          if (unblocks) offsetShift = -SHIFT_AMOUNT;

          for (let i = 0; i < newDrops.length; i++) {
            if (newDrops[i].id !== id && newDrops[i].lane === lane && newDrops[i].xOffset > target.xOffset) {
              newDrops[i] = { ...newDrops[i], xOffset: newDrops[i].xOffset + offsetShift };
            }
          }
          processShift(id, offsetShift);
        }

        return newDrops;
      });

      // Oracle feed
      const feedMessages: Record<string, FeedItem> = {
        remove: { id: Date.now().toString(), type: 'update', text: <span><span className="text-blue-400 font-medium">Flow Re-leveled:</span> Drop removed. Timeline pulled forward.</span> },
        complete: { id: Date.now().toString(), type: 'update', text: <span><span className="text-blue-400 font-medium">Flow Re-leveled:</span> Drop completed early. Velocity registered.</span> },
        block: { id: Date.now().toString(), type: 'alert', text: <span><span className="text-rose-400 font-medium">Ripple Alert:</span> Drop blocked{rationale ? ` — "${rationale}"` : ''}. Dependency shifted.</span> },
        ghost: { id: Date.now().toString(), type: 'suggestion', text: <span><span className="text-cyan-400 font-medium">Reverted:</span> Drop rescheduled to Ghost projection.</span> },
        'in-progress': { id: Date.now().toString(), type: 'suggestion', text: <span><span className="text-cyan-400 font-medium">Resumed:</span> Drop set back to In Progress.</span> },
      };
      const msg = feedMessages[action];
      if (msg) setFeed(prev => [msg, ...prev]);

      setIsThinking(false);
    }, 1200);
  };

  const handleDragEnd = (id: string, clientX: number, clientY: number) => {
    setIsThinking(true);
    // Find drop target by temporarily hiding the dragged element?
    // Actually, simple approximation: lane Y starts at ~230. Each lane is ~100px.
    setTimeout(() => {
       const laneIdx = Math.max(0, Math.min(4, Math.floor((clientY - 230) / 100)));
       let newXOffset = Math.max(0, (clientX - 320) / zoomScale); // 320 for sidebar offset

       setDrops(prev => {
         const existing = prev.find(d => d.id === id);
         if (existing) {
           return prev.map(d => d.id === id ? { ...d, lane: laneIdx, xOffset: newXOffset } : d);
         } else {
           const backlog = unassignedDrops.find(d => d.id === id);
           if (backlog) {
             setUnassignedDrops(u => u.filter(d => d.id !== id));
             return [...prev, { ...backlog, lane: laneIdx, xOffset: Math.max(NOW_LINE_X, newXOffset) }];
           }
         }
         return prev;
       });
       
       setFeed(prev => [
         { id: Date.now().toString(), type: 'update', text: <span><span className="text-cyan-400 font-medium">Flow Recalculated:</span> Resources re-allocated. Forecast updated.</span> },
         ...prev
       ]);
       setForecastSlipHours(prev => Math.max(0, prev - 2)); // Ripple recovery
       setIsThinking(false);
    }, 800);
  };

  const toggleSandbox = () => {
    if (!isSandboxActive) {
      setSandboxSnapshot({ drops, unassigned: unassignedDrops });
      setIsSandboxActive(true);
      setFeed(prev => [{ id: Date.now().toString(), type: 'alert', text: <span><span className="text-amber-400 font-medium">Simulation Mode:</span> Now projecting what-if drafts.</span> }, ...prev]);
    } else {
      setIsSandboxActive(false);
      setSandboxSnapshot(null);
    }
  };

  const commitSandbox = () => {
    setIsSandboxActive(false);
    setSandboxSnapshot(null);
    setFeed(prev => [{ id: Date.now().toString(), type: 'update', text: <span><span className="text-green-400 font-medium">Committed:</span> Plan pushed to live team flow.</span> }, ...prev]);
  };

  const discardSandbox = () => {
    if (sandboxSnapshot) {
      setDrops(sandboxSnapshot.drops);
      setUnassignedDrops(sandboxSnapshot.unassigned);
    }
    setIsSandboxActive(false);
    setSandboxSnapshot(null);
    setFeed(prev => [{ id: Date.now().toString(), type: 'update', text: <span><span className="text-slate-400 font-medium">Discarded:</span> Simulation changes reverted.</span> }, ...prev]);
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className={cn("relative w-full h-full flex flex-col transition-all duration-500 ease-in-out bg-[#020617] text-slate-50",
      isSandboxActive && "border-[2px] border-amber-500 shadow-[inset_0_0_80px_rgba(245,158,11,0.15)]"
    )}>

      {/* ── Daily Briefing Header ── */}
      <DailyBriefing
        blockerCount={blockerDismissed ? 0 : blockerCount}
        idleCount={idleDismissed ? 0 : idleCount}
        forecastSlipHours={forecastDismissed ? 0 : forecastSlipHours}
        forecastSlipStream="Identity & Auth Hub"
        isAgentOpen={isAgentOpen}
        isSandboxActive={isSandboxActive}
        sandboxDelta={sandboxDelta}
        onToggleSandbox={toggleSandbox}
        onCommitSandbox={commitSandbox}
        onDismissBlocker={() => setBlockerDismissed(true)}
        onDismissIdle={() => setIdleDismissed(true)}
        onDismissForecast={() => setForecastDismissed(true)}
        onClickBlocker={() => {
          // Scroll to first blocked drop (future: auto-scroll)
          setHoveredStreamId(null);
        }}
        onClickIdle={() => setIdleDismissed(false)}
      />

      <div className="flex-1 flex relative overflow-hidden">
        {/* Scrollable Flow Area */}
        <div className={cn(
          'flex-1 flex flex-col pt-8 pb-32 pl-8 overflow-x-auto no-scrollbar relative min-w-0 transition-all duration-500',
          isAgentOpen ? 'pr-[392px]' : 'pr-8'
        )}>

          {/* Top toolbar */}
          <div className="sticky left-0 right-0 top-0 z-40 flex justify-between items-center mb-16 pointer-events-none">

            {/* Highlight Stream selector */}
            <div className="inline-flex items-center gap-2 bg-[#0a192f]/80 backdrop-blur-md rounded-[14px] p-1.5 border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] pointer-events-auto">
              <Zap className="w-4 h-4 ml-2 text-teal-400" />
              <span className="text-xs font-bold text-slate-300 mr-2 tracking-wide uppercase">Highlight Stream</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setHoveredStreamId(null)}
                  className={cn('px-3 py-1 rounded-[10px] text-[10px] font-bold tracking-widest transition-all',
                    !hoveredStreamId ? 'bg-slate-800 text-slate-200' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                  )}
                >
                  ALL
                </button>
                {Object.values(GLOBAL_STREAMS).map(stream => {
                  const colorHex = STREAM_COLORS[stream.colorKey].hex;
                  const isActive = hoveredStreamId === stream.id;
                  return (
                    <button
                      key={stream.id}
                      onClick={() => setHoveredStreamId(prev => prev === stream.id ? null : stream.id)}
                      className="px-3 py-1 rounded-[10px] text-[10px] font-bold tracking-widest transition-all"
                      style={{
                        backgroundColor: isActive ? `${colorHex}30` : 'transparent',
                        color: isActive ? colorHex : '#64748b',
                        boxShadow: isActive ? `inset 0 0 10px ${colorHex}20` : 'none',
                      }}
                    >
                      {stream.initials}
                    </button>
                  );
                })}
              </div>
            </div>

              {/* Zoom Scale */}
              <div className="inline-flex bg-[#0a192f]/80 backdrop-blur-md rounded-[14px] p-1 border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] pointer-events-auto">
                {([
                  [1,    '8h'],
                  [0.6,  '24h'],
                  [0.25, '1w'],
                ] as [number, string][]).map(([scale, label]) => (
                  <button
                    key={scale}
                    onClick={() => setZoomScale(scale)}
                    className={cn(
                      'px-4 py-1.5 rounded-[10px] text-xs font-bold tracking-wide transition-all',
                      zoomScale === scale
                        ? 'bg-teal-950/80 text-teal-400 shadow-inner shadow-teal-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Simulation Toggle and Actions */}
              <div className="ml-4 flex items-center">
                {!isSandboxActive && (
                  <button
                    onClick={toggleSandbox}
                    className="flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all pointer-events-auto bg-[#0a192f]/80 text-slate-400 border border-white/10 hover:text-slate-200 hover:bg-[#0a192f] shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                  >
                    <PlayCircle className="w-4 h-4" />
                    Run Simulation
                  </button>
                )}

                <AnimatePresence>
                  {isSandboxActive && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className="flex items-center gap-2 pointer-events-auto"
                    >
                      <button
                        onClick={commitSandbox}
                        className="px-5 py-2 bg-cyan-500 text-cyan-950 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-cyan-400 transition-colors shadow-lg"
                      >
                        Apply to Live
                      </button>
                      <button
                        onClick={discardSandbox}
                        className="px-5 py-2 bg-transparent text-rose-500 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rose-500/10 transition-colors"
                      >
                        Discard
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

          {/* Now Line */}
          <div
            className="absolute top-[120px] bottom-0 w-[2px] bg-gradient-to-b from-cyan-400/0 via-cyan-400 to-cyan-400/0 z-10
                       animate-time-pulse
                       before:absolute before:content-[''] before:left-1/2 before:-translate-x-1/2 before:-top-3
                       before:w-3.5 before:h-3.5 before:bg-cyan-400 before:rounded-full before:shadow-[0_0_10px_rgba(34,211,238,1)]
                       after:content-['NOW'] after:absolute after:-top-8 after:left-1/2 after:-translate-x-1/2
                       after:text-cyan-400 after:text-xs after:font-bold after:tracking-widest
                       transition-all duration-500"
            style={{ left: (NOW_LINE_X * zoomScale) + 240 }}
          />

          {/* Swimlanes container */}
          <div className="flex flex-col gap-0 mt-2 relative">

            {/* Dependency Traces SVG Layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-50 overflow-visible">
              <defs>
                <filter id="underwater-blur">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <AnimatePresence>
                {hoveredDropId && drops.map(targetDrop => {
                  if (targetDrop.id === hoveredDropId) return null;
                  
                  const isParent = drops.find(d => d.id === hoveredDropId)?.dependsOn?.includes(targetDrop.id);
                  const isChild = targetDrop.dependsOn?.includes(hoveredDropId);
                  
                  if (!isParent && !isChild) return null;

                  const src = isParent ? targetDrop : drops.find(d => d.id === hoveredDropId)!;
                  const dst = isParent ? drops.find(d => d.id === hoveredDropId)! : targetDrop;

                  const getCenter = (d: DropData) => {
                    const width = Math.max(120 * zoomScale, d.effortHours * 80 * zoomScale);
                    const isDraftX = isSandboxActive && sandboxSnapshot ? sandboxSnapshot.drops.find(sd => sd.id === d.id)?.xOffset !== d.xOffset : false;
                    const isDraftL = isSandboxActive && sandboxSnapshot ? sandboxSnapshot.drops.find(sd => sd.id === d.id)?.lane !== d.lane : false;

                    const effectiveLane = d.lane; // We use current manipulated values
                    return {
                      x: 240 + (d.xOffset * zoomScale) + width / 2,
                      y: (effectiveLane * 100) + 50,
                      isDraft: isDraftX || isDraftL
                    };
                  };

                  const p1 = getCenter(src);
                  const p2 = getCenter(dst);
                  
                  const isSimulating = isSandboxActive && (p1.isDraft || p2.isDraft);
                  
                  // Compute target stream color
                  const targetStreamDef = GLOBAL_STREAMS[dst.streamId || ''];
                  const traceColor = isSimulating ? '#f59e0b' : targetStreamDef ? STREAM_COLORS[targetStreamDef.colorKey].hex : '#94a3b8';

                  const dPath = `M ${p1.x} ${p1.y} C ${p1.x + 100} ${p1.y}, ${p2.x - 100} ${p2.y}, ${p2.x} ${p2.y}`;

                  return (
                    <motion.path
                      key={`${src.id}-${dst.id}`}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.6 }}
                      exit={{ opacity: 0, transition: { duration: 0.2 } }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      d={dPath}
                      fill="none"
                      stroke={traceColor}
                      strokeWidth="1.5"
                      filter="url(#underwater-blur)"
                    />
                  );
                })}
              </AnimatePresence>
            </svg>

            {/* Ideal Flow Line Background SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ minWidth: 2000 }}>
              <defs>
                <linearGradient id="idealFlow" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="rgba(34,211,238,0.2)" />
                  <stop offset="100%" stopColor="rgba(45,212,191,0.0)" />
                </linearGradient>
              </defs>
              <polygon points={`240,0 ${240 + NOW_LINE_X * zoomScale},0 2000,500 240,500`} fill="url(#idealFlow)" opacity="0.3" />
              <line x1={240 + 50} y1="0" x2={(240 + 800) * zoomScale} y2="500" stroke="rgba(34,211,238,0.3)" strokeWidth="2" strokeDasharray="10 10" />
            </svg>

            {/* ── Milestone Lines ── */}
            {MILESTONES.map(m => {
              const violated = violatedMilestoneIds.has(m.id);
              const lineX = (m.xOffset * zoomScale) + 4; // +4 for sidebar offset tweak

              return (
                <div
                  key={m.id}
                  className="absolute top-0 bottom-0 z-30 pointer-events-none"
                  style={{ left: 240 + lineX }}
                >
                  {/* Dashed vertical line */}
                  <div
                    className={cn(
                      'absolute top-0 bottom-0 w-px border-l border-dashed transition-colors duration-300',
                      violated ? 'border-amber-500/60' : 'border-slate-600/50'
                    )}
                  />
                  {/* Label chip */}
                  <div className={cn(
                    'absolute -top-1 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md border text-[9px] font-bold tracking-widest uppercase whitespace-nowrap transition-all duration-300',
                    violated
                      ? 'bg-amber-950/60 border-amber-500/40 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                      : 'bg-slate-900/70 border-slate-700/50 text-slate-500'
                  )}>
                    {violated && <span className="text-amber-500">⚠</span>}
                    {m.label}
                  </div>
                </div>
              );
            })}

            {/* ── Swimlane Rows ── */}
            {TEAM_MEMBERS.map((member, laneIndex) => {
              const laneDrops = drops.filter(d => d.lane === laneIndex);

              return (
                <div
                  key={member.id}
                  data-lane-idx={laneIndex}
                  className="relative flex items-center min-h-[100px] rounded-[30px] border border-slate-800/30 bg-[#0a192f]/10 hover:bg-[#0a192f]/30 transition-colors group"
                >
                  {/* Member sidebar */}
                  <div className="w-60 shrink-0 flex items-center justify-between py-4 px-6 sticky left-0 z-30 backdrop-blur-sm rounded-l-[30px] border-r border-[#0a192f]/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-950 to-[#0a192f] border border-cyan-800/30 flex items-center justify-center shadow-lg group-hover:border-cyan-400/50 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all">
                        <span className="text-cyan-200 font-bold text-lg">{member.name.charAt(0)}</span>
                      </div>
                      <span className="font-semibold text-slate-300 group-hover:text-white transition-colors">{member.name}</span>
                    </div>

                    {/* Velocity badge */}
                    {(() => {
                      const vel = memberVelocity[member.id] || 0;
                      const isPositive = vel >= 0;
                      return (
                        <div className={cn(
                          'text-[10px] font-bold px-2 py-1 rounded-md transition-all duration-500',
                          isPositive
                            ? 'bg-green-950/40 text-green-400 border border-green-500/30 shadow-[0_0_8px_rgba(34,197,94,0.1)]'
                            : 'bg-amber-950/40 text-amber-500 border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.1)]'
                        )}>
                          {isPositive ? '+' : ''}{vel}%
                        </div>
                      );
                    })()}
                  </div>

                  {/* Timeline track */}
                  <div className="flex-1 h-full relative border-l border-slate-800/30">
                    <div className="absolute inset-0 border-t border-dashed border-slate-800/50 top-1/2 w-[4000px] -z-10" />

                    <div className="absolute inset-0 flex items-center">
                      <AnimatePresence>
                        {laneDrops.map(drop => {
                          const streamDef = drop.streamId ? GLOBAL_STREAMS[drop.streamId] : undefined;
                          const streamColorHex = streamDef ? STREAM_COLORS[streamDef.colorKey].hex : undefined;
                          const isMilestoneViolation = violatingDropIds.has(drop.id);

                          return (
                            <Drop
                              key={drop.id}
                              id={drop.id}
                              title={drop.title}
                              state={drop.state}
                              effortHours={drop.effortHours}
                              xOffset={drop.xOffset}
                              isBlocked={drop.isBlocked}
                              isMilestoneViolation={isMilestoneViolation}
                              isDraft={isSandboxActive && (sandboxSnapshot?.drops.find(d => d.id === drop.id)?.lane !== drop.lane || sandboxSnapshot?.drops.find(d => d.id === drop.id)?.xOffset !== drop.xOffset)}
                              references={drop.references}
                              onAction={handleDropAction}
                              onDragEnd={handleDragEnd}
                              zoomScale={zoomScale}
                              streamId={drop.streamId}
                              streamInitials={streamDef?.initials}
                              streamColorHex={streamColorHex}
                              hoveredStreamId={hoveredStreamId}
                              onHoverStream={setHoveredStreamId}
                              hasDependencies={(drop.dependsOn && drop.dependsOn.length > 0) || drops.some(d => d.dependsOn?.includes(drop.id))}
                              isDependencyBlocked={drop.isBlocked}
                              onHoverDrop={setHoveredDropId}
                            />
                          );
                        })}
                    </AnimatePresence>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Agent Panel */}
        <AgentPanel
          feed={feed}
          briefing="Exception mode active. Oracle is monitoring 2 blocked drops and tracking 3 milestone proximity alerts."
          isThinking={isThinking}
          isOpen={isAgentOpen}
          onToggle={setIsAgentOpen}
        />
      </div>

      <BacklogTray unassignedDrops={unassignedDrops} onDragEnd={handleDragEnd} isSandboxActive={isSandboxActive} />
    </div>
  );
}
