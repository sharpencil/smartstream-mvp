'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgentPanel, FeedItem } from './AgentPanel';
import { Drop, DropState, getDropWidth } from './Drop';
import { DailyBriefing } from './DailyBriefing';
import { cn } from '@/lib/utils';
import { STREAM_COLORS, StreamColorKey, Reference } from '@/lib/streams';
import { Zap, PlayCircle, ChevronDown, AlertTriangle, Plus, Minus, Link } from 'lucide-react';
import { BacklogTray } from './BacklogTray';
import { STAGING_STREAMS, STAGING_DROPS, computeVelocityDelta } from '@/lib/stagingData';

export interface DropData {
  id: string;
  lane: number;
  title: string;
  state: DropState;
  effortHours: number;
  complexity?: number;
  description?: string;
  tasks?: string[];
  status?: string;
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

// ── Staging stream definition map ────────────────────────────────────────────
const STAGING_STREAM_MAP = Object.fromEntries(
  STAGING_STREAMS.map((s) => [
    s.id,
    { id: s.id, title: s.title, initials: s.initials, colorKey: s.colorKey as StreamColorKey },
  ])
);

const TEAM_MEMBERS = [
  { id: '1', name: 'Sarah' },
  { id: '2', name: 'Mike' },
  { id: '3', name: 'Alex' },
  { id: '4', name: 'Elena' },
];

const MILESTONES: Milestone[] = [
  { id: 'm1', label: 'Tracking MVP', xOffset: 600 },
  { id: 'm2', label: 'DB Migration', xOffset: 1100 },
  { id: 'm3', label: 'AI Eval Live', xOffset: 1600 },
  { id: 'm4', label: 'Beta Release', xOffset: 2200 },
  { id: 'm5', label: 'GA Launch', xOffset: 3000 },
];

// ── Build initial drops from staging CSV data ─────────────────────────────────
//  Completed   → left of NOW_LINE_BASE (pre-Now)
//  Not Started → ghost, right of NOW_LINE_BASE
//  In Progress → active, near NOW_LINE_BASE
const NOW_LINE_BASE = 420;

function buildInitialDrops(): DropData[] {
  const result: DropData[] = [];
  const laneTasks: Record<number, { completed: any[], active: any[], pending: any[] }> = {
    0: { completed: [], active: [], pending: [] },
    1: { completed: [], active: [], pending: [] },
    2: { completed: [], active: [], pending: [] },
    3: { completed: [], active: [], pending: [] }
  };

  // Collect all drops and distribute them round-robin to lanes
  let absoluteDropIdx = 0;
  STAGING_STREAMS.forEach((stream) => {
    stream.drops.forEach((drop) => {
      const lane = absoluteDropIdx % 4;
      const dropData = { ...drop, streamId: stream.id };

      if (drop.status === 'Completed') {
        laneTasks[lane].completed.push(dropData);
      } else if (drop.status === 'Not Started') {
        // Force the first "Not Started" drop of MOST lanes to be ACTIVE for demo realism
        // We leave lane 2 (Sam Taylor) idle to demonstrate "Idle Capacity" intervention
        if (laneTasks[lane].active.length === 0 && lane !== 2) {
          laneTasks[lane].active.push({
            ...dropData,
            isBlocked: lane === 0, // Keep Sarah's blocker for the demo
            status: 'Active'
          });
        } else {
          laneTasks[lane].pending.push(dropData);
        }
      } else {
        // Respect explicit in-progress status unless it's Lane 2 (Sam)
        if (lane === 2) {
          laneTasks[lane].completed.push(dropData); // Demote to completed to keep him idle
        } else {
          laneTasks[lane].active.push(dropData);
        }
      }
      absoluteDropIdx++;
    });
  });

  // Position drops per lane
  [0, 1, 2, 3].forEach(lane => {
    let lastActiveEnd = NOW_LINE_BASE + 20;

    // 1. Position ACTIVE drops at NOW_LINE (overlapping)
    laneTasks[lane].active.forEach((drop, i) => {
      const complexity = drop.complexity ?? 4;
      const cardWidth = 100 + complexity * 28;
      // Stagger the overlap so they start well before the line (e.g., 100-150px before)
      const staggerX = (lane * 35) % 90;
      const xOffset = NOW_LINE_BASE - 140 + staggerX + (i * 20);

      lastActiveEnd = Math.max(lastActiveEnd, xOffset + cardWidth);

      result.push({
        id: `staging-${drop.drop_id}`,
        lane,
        title: drop.title,
        description: drop.title,
        tasks: drop.tasks,
        status: drop.status,
        complexity,
        state: 'active',
        effortHours: drop.estimated_time || complexity,
        xOffset,
        streamId: drop.streamId,
        isBlocked: drop.isBlocked,
        dependsOn: drop.dependsOn?.map((d: string) => `staging-${d}`),
      });
    });

    // 2. Position COMPLETED drops working BACKWARDS from ACTIVE drops
    let earliestActiveX = NOW_LINE_BASE - 140;
    if (laneTasks[lane].active.length > 0) {
      earliestActiveX = Math.min(...result.filter(d => d.lane === lane && d.state === 'active').map(d => d.xOffset));
    }
    let currentXCompleted = earliestActiveX - 40;

    [...laneTasks[lane].completed].reverse().forEach((drop) => {
      const complexity = drop.complexity ?? 4;
      const cardWidth = 100 + complexity * 28;
      currentXCompleted -= (cardWidth + 24);
      result.push({
        id: `staging-${drop.drop_id}`,
        lane,
        title: drop.title,
        description: drop.title,
        tasks: drop.tasks,
        status: drop.status,
        complexity,
        state: 'completed',
        effortHours: drop.estimated_time || complexity,
        xOffset: currentXCompleted,
        streamId: drop.streamId,
        dependsOn: drop.dependsOn?.map((d: string) => `staging-${d}`),
      });
    });

    // 3. Position PENDING drops working FORWARDS from the END of ACTIVE work
    let currentXPending = Math.max(NOW_LINE_BASE + 80, lastActiveEnd + 40);
    laneTasks[lane].pending.forEach((drop) => {
      const complexity = drop.complexity ?? 4;
      const cardWidth = 100 + complexity * 28;
      result.push({
        id: `staging-${drop.drop_id}`,
        lane,
        title: drop.title,
        description: drop.title,
        tasks: drop.tasks,
        status: drop.status,
        complexity,
        state: 'ghost',
        effortHours: drop.estimated_time || complexity,
        xOffset: currentXPending,
        streamId: drop.streamId,
        dependsOn: drop.dependsOn?.map((d: string) => `staging-${d}`),
      });
      currentXPending += (cardWidth + 30);
    });
  });

  return result;
}

const INITIAL_DROPS: DropData[] = buildInitialDrops();

const RAW_MIN_X = Math.min(...INITIAL_DROPS.map(d => d.xOffset));
const X_SHIFT = -RAW_MIN_X + 24;
INITIAL_DROPS.forEach(d => { d.xOffset += X_SHIFT; });
MILESTONES.forEach(m => { m.xOffset += X_SHIFT; });

const INITIAL_MAX_X = Math.max(...INITIAL_DROPS.map(d => d.xOffset + getDropWidth({ effortHours: d.effortHours, complexity: d.complexity }, 1)));
const INITIAL_ZOOM = Math.min(1, 1000 / Math.max(INITIAL_MAX_X, 100));

// ── Seed velocity from estimated vs. completion time ─────────────────────────
function buildInitialVelocity(initialDrops: DropData[]): Record<string, number> {
  const result: Record<string, number> = {};

  // Calculate average delta for each lane's completed drops
  for (let lane = 0; lane < 4; lane++) {
    const laneId = (lane + 1).toString();
    const laneDrops = initialDrops.filter(d => d.lane === lane && d.state === 'completed');

    // We need the original StagingDrop data to get completion_time/estimated_time
    // But we can approximate it or map it back.
    // Better: compute from STAGING_DROPS filtered by the same logic
    const originalDrops = STAGING_DROPS.filter((_, idx) => (idx % 4) === lane && _.status === 'Completed');

    if (originalDrops.length > 0) {
      const totalDelta = originalDrops.reduce((acc, d) => acc + (d.estimated_time - d.completion_time), 0);
      result[laneId] = Math.round((totalDelta / originalDrops.length) * 10);
    } else {
      result[laneId] = 0;
    }
  }

  // Clamp to realistic values
  Object.keys(result).forEach((k) => {
    result[k] = Math.max(-25, Math.min(25, result[k]));
  });
  return result;
}

const INITIAL_VELOCITY: Record<string, number> = buildInitialVelocity(INITIAL_DROPS);

const NOW_LINE_X = NOW_LINE_BASE + X_SHIFT;

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the right edge x (canvas space) of a drop */
function dropRightEdge(drop: DropData, zoomScale: number) {
  const width = getDropWidth(drop, zoomScale);
  return (drop.xOffset * zoomScale) + width;
}

// ── Main Component ────────────────────────────────────────────────────────────

export function PulseDashboard() {
  const [viewLevel, setViewLevel] = useState<'streams' | 'people' | 'deadlines'>('streams');
  const [expandedStreamIds, setExpandedStreamIds] = useState<Set<string>>(new Set());
  const [activeMilestoneId, setActiveMilestoneId] = useState<string | null>(null);

  // Dynamic Sidebar widths to ensure Now Line and Milestones align in both views
  const SIDEBAR_DETAILED = 240; // w-60
  const SIDEBAR_OVERVIEW = 300; 
  const currentSidebarWidth = viewLevel === 'people' ? SIDEBAR_DETAILED : SIDEBAR_OVERVIEW;

  const toggleStreamExpand = (id: string) => {
    setExpandedStreamIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const [drops, setDrops] = useState<DropData[]>(INITIAL_DROPS);
  const [unassignedDrops, setUnassignedDrops] = useState<DropData[]>([]);
  const [zoomScale, setZoomScale] = useState(INITIAL_ZOOM);

  // Compute Critical Path Drops recursively
  const criticalPathDropIds = useMemo(() => {
    const dropEnds = drops.map(d => ({ id: d.id, end: d.xOffset + getDropWidth({ effortHours: d.effortHours, complexity: d.complexity }, 1) }));
    if (dropEnds.length === 0) return new Set<string>();
    const latestDrop = dropEnds.reduce((max, d) => (d.end > max.end ? d : max), dropEnds[0]);
    
    const paths = new Set<string>();
    const stack = [latestDrop.id];
    while (stack.length > 0) {
      const currentId = stack.pop()!;
      if (!paths.has(currentId)) {
        paths.add(currentId);
        const currentDrop = drops.find(d => d.id === currentId);
        if (currentDrop && currentDrop.dependsOn) {
          // Track staging and non-staging formats
          const dependencies = currentDrop.dependsOn
            .map(did => drops.find(d => d.id === did || d.id === `staging-${did}`)?.id)
            .filter(Boolean) as string[];
          stack.push(...dependencies);
        }
      }
    }
    return paths;
  }, [drops]);

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
  const [selectedDropId, setSelectedDropId] = useState<string | null>(null);
  const [selectedStreamDependencyId, setSelectedStreamDependencyId] = useState<string | null>(null);
  const [nodeYs, setNodeYs] = useState<Record<string, number>>({});

  useEffect(() => {
    const updatePositions = () => {
      const svgEl = document.getElementById('svg-overlay-container');
      if (!svgEl) return;
      const svgRect = svgEl.getBoundingClientRect();
      const newPositions: Record<string, number> = {};

      document.querySelectorAll('[data-stream-id]').forEach(el => {
        const id = el.getAttribute('data-stream-id')!;
        const rect = el.getBoundingClientRect();
        newPositions[`stream-${id}`] = (rect.top - svgRect.top) + (rect.height / 2);
      });

      document.querySelectorAll('[data-id]').forEach(el => {
        const id = el.getAttribute('data-id')!;
        const rect = el.getBoundingClientRect();
        newPositions[`drop-${id}`] = (rect.top - svgRect.top) + (rect.height / 2);
      });

      setNodeYs(prev => {
         const keys = Object.keys(newPositions);
         if (keys.length !== Object.keys(prev).length) return newPositions;
         for (const k of keys) {
           if (Math.abs(newPositions[k] - prev[k]) > 1) return newPositions;
         }
         return prev; // unchanged
      });
    };

    // Delay slight processing for layout animations to settle
    const to1 = setTimeout(updatePositions, 50);
    const to2 = setTimeout(updatePositions, 500);
    return () => { clearTimeout(to1); clearTimeout(to2); };
  }, [viewLevel, expandedStreamIds, drops, activeMilestoneId, hoveredDropId, selectedDropId, selectedStreamDependencyId]);

  // Briefing dismissal state (independent of data — PM can snooze)
  const [blockerDismissed, setBlockerDismissed] = useState(false);
  const [forecastDismissed, setForecastDismissed] = useState(false);
  const [resolutionDismissed, setResolutionDismissed] = useState(false);
  const [forecastSlipHours, setForecastSlipHours] = useState(4);


  const [memberVelocity, setMemberVelocity] = useState<Record<string, number>>(INITIAL_VELOCITY);

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

  const streamStats = useMemo(() => {
    return STAGING_STREAMS.map(s => {
      const sDrops = drops.filter(d => d.streamId === s.id);
      const completed = sDrops.filter(d => d.state === 'completed').length;
      const total = sDrops.length;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      const hasBlocker = sDrops.some(d => d.isBlocked);
      const contributors = Array.from(new Set(sDrops.map(d => d.lane)));
      return { id: s.id, percent, hasBlocker, contributors, drops: sDrops };
    });
  }, [drops]);

  // ── Milestone Conflict Detection ──────────────────────────────────────────

  // A milestone is 'violated' only when a ghost drop genuinely CROSSES the line
  // (its start is before the milestone AND its right edge extends past it).
  // Drops entirely before or entirely after a milestone are not violations.
  const violatedMilestoneIds = useMemo<Set<string>>(() => {
    const violated = new Set<string>();
    drops
      .filter(d => d.state === 'ghost')
      .forEach(drop => {
        const rightEdge = drop.xOffset + (getDropWidth(drop, 1));
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
        const rightEdge = drop.xOffset + (getDropWidth(drop, 1));
        if (MILESTONES.some(m => drop.xOffset < m.xOffset && rightEdge > m.xOffset)) result.add(drop.id);
      });
    return result;
  }, [drops]);

  // Find stream dependencies if a stream link is triggered
  const activeStreamDependencyPaths = useMemo(() => {
    if (!selectedStreamDependencyId) return [];
    const paths: { srcStreamId: string, dstStreamId: string, isParent: boolean }[] = [];
    
    const baseDrops = drops.filter(d => d.streamId === selectedStreamDependencyId);
    baseDrops.forEach(baseDrop => {
      // Upstream (Parents)
      if (baseDrop.dependsOn) {
        baseDrop.dependsOn.forEach(depId => {
          const parentDrop = drops.find(d => d.id === depId || d.id === `staging-${depId}`);
          if (parentDrop && parentDrop.streamId && parentDrop.streamId !== selectedStreamDependencyId) {
            paths.push({ srcStreamId: parentDrop.streamId, dstStreamId: selectedStreamDependencyId, isParent: true });
          }
        });
      }
      // Downstream (Children)
      const children = drops.filter(d => d.dependsOn?.includes(baseDrop.id) || d.dependsOn?.includes(baseDrop.id.replace('staging-', '')));
      children.forEach(childDrop => {
        if (childDrop.streamId && childDrop.streamId !== selectedStreamDependencyId) {
          paths.push({ srcStreamId: selectedStreamDependencyId, dstStreamId: childDrop.streamId, isParent: false });
        }
      });
    });
    
    // Dedup
    const unique = new Set<string>();
    return paths.filter(p => {
      const key = `${p.srcStreamId}-${p.dstStreamId}`;
      if(unique.has(key)) return false;
      unique.add(key);
      return true;
    });
  }, [selectedStreamDependencyId, drops]);

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
    <div className={cn("relative w-full h-full flex flex-col pt-8 pb-8 pr-8 pl-0 transition-all duration-500 ease-in-out text-slate-50",
      viewLevel === 'deadlines' ? "bg-black contrast-[1.05] brightness-[0.98]" : "bg-[#020617]",
      isSandboxActive && "border-[2px] border-amber-500 shadow-[inset_0_0_80px_rgba(245,158,11,0.15)]"
    )}>

      {/* Header Controls */}
      <div className={cn(
        "flex items-center justify-between pb-5 border-b border-white/5 sticky top-0 backdrop-blur-md z-40 relative pl-10 transition-all duration-500",
        viewLevel === 'deadlines' ? 'bg-black/80' : 'bg-[#020617]/90',
        isAgentOpen ? 'pr-[392px]' : 'pr-8'
      )}>
        <h1 className="text-3xl font-bold font-sans tracking-tight text-slate-100 whitespace-nowrap">
          Pulse
        </h1>
      </div>

      {/* ── Main Scroll Context (Vertical) ── */}
      <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar">
        {/* Daily Briefing (Scrollable) */}
        <div className="pl-10">
          <DailyBriefing
            blockerCount={blockerDismissed ? 0 : blockerCount}
            forecastSlipHours={forecastDismissed ? 0 : forecastSlipHours}
            forecastSlipStream="Identity & Auth Hub"
            isAgentOpen={isAgentOpen}
            isSandboxActive={isSandboxActive}
            sandboxDelta={sandboxDelta}
            onToggleSandbox={toggleSandbox}
            onCommitSandbox={commitSandbox}
            onDismissBlocker={() => setBlockerDismissed(true)}
            onDismissForecast={() => setForecastDismissed(true)}
            blockerResolutionCount={resolutionDismissed ? 0 : 1}
            onDismissResolution={() => setResolutionDismissed(true)}
            onClickBlocker={() => {
              // Scroll to first blocked drop (future: auto-scroll)
              setHoveredStreamId(null);
            }}
          />
        </div>

        {/* Timeline Section */}
        <div className="relative">
          {/* Scrollable Flow Area (Horizontal) */}
          <div className={cn(
            'flex flex-col pt-0 pb-32 overflow-x-auto no-scrollbar relative min-w-0 transition-all duration-500 pl-10',
            isAgentOpen ? 'pr-[392px]' : 'pr-8'
          )}>

            {/* Top toolbar (Sticky within the vertical scroll container) */}
            <div className="sticky left-0 right-0 top-0 z-40 flex justify-between items-center pointer-events-none bg-[#020617]/40 backdrop-blur-md py-5 rounded-b-2xl border-b border-white/5 shadow-2xl">

            {/* View Level Toggle - Centered relative to visible area */}
            <div className="absolute left-1/2 -translate-x-1/2 flex flex-nowrap bg-[#0a192f]/60 p-1.5 border border-slate-800/60 rounded-full shadow-inner shadow-black/20 backdrop-blur-md pointer-events-auto">
              <button
                onClick={() => setViewLevel('streams')}
                className={cn(
                  'px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-all relative whitespace-nowrap',
                  viewLevel === 'streams' ? 'bg-teal-950/80 text-teal-400 shadow-inner shadow-teal-500/20 border border-teal-500/20' : 'text-slate-500 hover:text-slate-300'
                )}
              >
                Streams
              </button>
              <button
                onClick={() => setViewLevel('people')}
                className={cn(
                  'px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-all relative whitespace-nowrap',
                  viewLevel === 'people' ? 'bg-teal-950/80 text-teal-400 shadow-inner shadow-teal-500/20 border border-teal-500/20' : 'text-slate-500 hover:text-slate-300'
                )}
              >
                People
              </button>
              <button
                onClick={() => { setViewLevel('deadlines'); setActiveMilestoneId(null); }}
                className={cn(
                  'px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-all relative whitespace-nowrap',
                  viewLevel === 'deadlines' ? 'bg-rose-950/80 text-rose-400 shadow-inner shadow-rose-500/20 border border-rose-500/20' : 'text-slate-500 hover:text-slate-300'
                )}
              >
                Deadlines
              </button>
            </div>

            {/* Zoom Scale Controls */}
            <div className="inline-flex items-center bg-[#0a192f]/80 backdrop-blur-md rounded-xl p-1 h-10 border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] pointer-events-auto">
              <button
                onClick={() => setZoomScale(prev => Math.max(0.1, prev - 0.15))}
                className="w-8 h-full flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-white/10 mx-1" />
              <button
                onClick={() => setZoomScale(prev => Math.min(2, prev + 0.15))}
                className="w-8 h-full flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Simulation Toggle and Actions */}
            <div className="ml-4 flex items-center">
              {!isSandboxActive && (
                <button
                  onClick={toggleSandbox}
                  className="flex items-center justify-center gap-2 px-6 h-10 rounded-xl text-xs font-bold uppercase tracking-widest transition-all pointer-events-auto bg-[#0a192f]/80 text-slate-400 border border-white/10 hover:text-slate-200 hover:bg-[#0a192f] shadow-[0_0_20px_rgba(0,0,0,0.5)] whitespace-nowrap flex-nowrap"
                >
                  <PlayCircle className="w-4 h-4 shrink-0" />
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
                      className="px-5 h-10 flex items-center justify-center bg-cyan-500 text-cyan-950 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-cyan-400 transition-colors shadow-lg"
                    >
                      Apply to Live
                    </button>
                    <button
                      onClick={discardSandbox}
                      className="px-5 h-10 flex items-center justify-center bg-transparent text-rose-500 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rose-500/10 transition-colors"
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
            style={{ left: (NOW_LINE_X * zoomScale) + currentSidebarWidth }}
          />

          {/* Swimlanes container */}
          <div className="flex flex-col gap-0 mt-5 relative">

            {/* Dependency Traces SVG Layer */}
            <svg id="svg-overlay-container" className="absolute inset-0 w-full h-full pointer-events-none z-50 overflow-visible">
              <defs>
                <filter id="underwater-blur">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <AnimatePresence>
                {/* 1. Stream Dependency Arcs */}
                {activeStreamDependencyPaths.map(path => {
                  const srcY = nodeYs[`stream-${path.srcStreamId}`];
                  const dstY = nodeYs[`stream-${path.dstStreamId}`];
                  if (!srcY || !dstY) return null;

                  const targetStreamDef = STAGING_STREAM_MAP[path.srcStreamId];
                  const traceColor = targetStreamDef ? STREAM_COLORS[targetStreamDef.colorKey].hex : '#94a3b8';

                  const startX = currentSidebarWidth - 20; 
                  const midX = startX + 50; 
                  const dPath = `M ${startX} ${srcY} C ${midX} ${srcY}, ${midX} ${dstY}, ${startX} ${dstY}`;

                  return (
                    <motion.path
                      key={`stream-${path.srcStreamId}-${path.dstStreamId}`}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.8 }}
                      exit={{ opacity: 0, transition: { duration: 0.2 } }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                      d={dPath}
                      fill="none"
                      stroke={traceColor}
                      strokeWidth="3"
                      filter="url(#underwater-blur)"
                    />
                  );
                })}

                {/* 2. Drop Dependency Traces */}
                {(hoveredDropId || selectedDropId) && drops.map(targetDrop => {
                  const activeDropId = hoveredDropId || selectedDropId;
                  if (!activeDropId || targetDrop.id === activeDropId) return null;

                  const isParent = drops.find(d => d.id === activeDropId)?.dependsOn?.includes(targetDrop.id) || drops.find(d => d.id === activeDropId)?.dependsOn?.includes(targetDrop.id.replace('staging-', ''));
                  const isChild = targetDrop.dependsOn?.includes(activeDropId) || targetDrop.dependsOn?.includes(activeDropId.replace('staging-', ''));

                  if (!isParent && !isChild) return null;

                  const src = isParent ? targetDrop : drops.find(d => d.id === activeDropId)!;
                  const dst = isParent ? drops.find(d => d.id === activeDropId)! : targetDrop;

                  const getCenter = (d: DropData) => {
                    const width = getDropWidth(d, zoomScale);
                    const isDraftX = isSandboxActive && sandboxSnapshot ? sandboxSnapshot.drops.find(sd => sd.id === d.id)?.xOffset !== d.xOffset : false;
                    const isDraftL = isSandboxActive && sandboxSnapshot ? sandboxSnapshot.drops.find(sd => sd.id === d.id)?.lane !== d.lane : false;

                    const storedY = nodeYs[`drop-${d.id}`];
                    // Fallback to literal calculation if layout not parsed (e.g. initial view constraint)
                    const y = storedY ?? ((d.lane * 100) + 50);

                    return {
                      x: currentSidebarWidth + (d.xOffset * zoomScale) + width / 2,
                      y,
                      isDraft: isDraftX || isDraftL
                    };
                  };

                  const p1 = getCenter(src);
                  const p2 = getCenter(dst);

                  const isSimulating = isSandboxActive && (p1.isDraft || p2.isDraft);

                  const targetStreamDef = STAGING_STREAM_MAP[dst.streamId || ''];
                  const traceColor = isSimulating ? '#f59e0b' : targetStreamDef ? STREAM_COLORS[targetStreamDef.colorKey].hex : '#94a3b8';

                  const dPath = `M ${p1.x} ${p1.y} C ${p1.x + 100} ${p1.y}, ${p2.x - 100} ${p2.y}, ${p2.x} ${p2.y}`;

                  return (
                    <motion.path
                      key={`drop-${src.id}-${dst.id}`}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.8 }}
                      exit={{ opacity: 0, transition: { duration: 0.2 } }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      d={dPath}
                      fill="none"
                      stroke={traceColor}
                      strokeWidth={selectedDropId ? "3" : "1.5"}
                      filter="url(#underwater-blur)"
                    />
                  );
                })}
              </AnimatePresence>
            </svg>



            {/* ── Milestone Lines ── */}
            {MILESTONES.map(m => {
              const violated = violatedMilestoneIds.has(m.id);
              const lineX = (m.xOffset * zoomScale) + 4; // +4 for sidebar offset tweak
              
              const isDeadlinesView = viewLevel === 'deadlines';
              const isSelected = activeMilestoneId === m.id;
              
              const diffToNow = m.xOffset - NOW_LINE_X;
              const daysToNow = Math.round(diffToNow / 80); // 80px nominal day
              const tMinusText = daysToNow >= 0 ? `T-Minus ${daysToNow} Days` : `T+ ${Math.abs(daysToNow)} Days`;

              return (
                <div
                  key={m.id}
                  className={cn("absolute top-0 bottom-0 z-30 transition-all", isDeadlinesView ? "pointer-events-auto cursor-pointer group/mline" : "pointer-events-none")}
                  style={{ left: currentSidebarWidth + lineX }}
                  onClick={() => isDeadlinesView && setActiveMilestoneId(activeMilestoneId === m.id ? null : m.id)}
                >
                  {/* Dashed vertical line */}
                  <div
                    className={cn(
                      'absolute top-0 bottom-0 w-px border-l transition-colors duration-300',
                      violated ? 'border-amber-500/60 border-dashed' : 
                      (isSelected ? 'border-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.8)]' : 'border-slate-600/50 border-dashed group-hover/mline:border-slate-400')
                    )}
                  />
                  {/* Label chip */}
                  <div className={cn(
                    'absolute -top-1 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md border text-[9px] font-bold tracking-widest uppercase whitespace-nowrap transition-all duration-300',
                    isSelected ? 'bg-teal-950/80 border-teal-400 text-teal-300 shadow-[0_0_15px_rgba(45,212,191,0.3)] scale-110 origin-bottom-left z-50 -top-3' : 
                    violated
                      ? 'bg-amber-950/60 border-amber-500/40 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                      : 'bg-slate-900/70 border-slate-700/50 text-slate-500 group-hover/mline:text-slate-300'
                  )}>
                    {(violated && !isSelected) && <span className="text-amber-500">⚠</span>}
                    {isDeadlinesView ? (
                      <div className="flex flex-col">
                        <span className="text-[7.5px] opacity-70 mb-[1px] leading-none">{m.label}</span>
                        <span className="leading-none">{tMinusText}</span>
                      </div>
                    ) : m.label}
                  </div>
                </div>
              );
            })}

            {/* ── Swimlane Rows ── */}
            {viewLevel === 'people' ? (
              TEAM_MEMBERS.map((member, laneIndex) => {
                const laneDrops = drops.filter(d => d.lane === laneIndex);
                return (
                  <motion.div
                    key={member.id}
                    layout
                    className="relative flex items-center min-h-[100px] rounded-[30px] border border-slate-800/30 bg-[#0a192f]/10 hover:bg-[#0a192f]/30 transition-colors group mb-4"
                  >
                    {/* Member sidebar */}
                    <div className="w-60 shrink-0 flex items-center justify-between py-4 px-10 sticky left-0 z-30 border-r border-[#0a192f]/50 bg-[#020617] shadow-[10px_0_30px_rgba(0,0,0,0.5)]">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-950 to-[#0a192f] border border-cyan-800/30 flex items-center justify-center shadow-lg group-hover:border-cyan-400/50 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all">
                          <span className="text-cyan-200 font-bold text-lg">{member.name.charAt(0)}</span>
                        </div>
                        <span className="font-semibold text-slate-300 group-hover:text-white transition-colors whitespace-nowrap">{member.name}</span>
                      </div>
                      <div className={cn(
                        'text-[10px] font-bold px-2 py-1 rounded-md transition-all duration-500',
                        (memberVelocity[member.id] || 0) >= 0
                          ? 'bg-green-950/40 text-green-400 border border-green-500/30 shadow-[0_0_8px_rgba(34,197,94,0.1)]'
                          : 'bg-amber-950/40 text-amber-500 border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.1)]'
                      )}>
                        {(memberVelocity[member.id] || 0) >= 0 ? '+' : ''}{memberVelocity[member.id] || 0}%
                      </div>
                    </div>

                    {/* Timeline track */}
                    <div className="flex-1 h-full relative border-l border-slate-800/30">
                      <div className="absolute inset-0 border-t border-dashed border-slate-800/50 top-1/2 w-[4000px] -z-10" />
                      <div className="absolute inset-0 flex items-center">
                        <AnimatePresence>
                          {laneDrops.map(drop => (
                            <Drop
                              key={drop.id}
                              {...drop}
                              streamInitials={drop.streamId ? STAGING_STREAM_MAP[drop.streamId]?.initials : undefined}
                              streamColorHex={drop.streamId ? STREAM_COLORS[STAGING_STREAM_MAP[drop.streamId]?.colorKey].hex : undefined}
                              isMilestoneViolation={violatingDropIds.has(drop.id)}
                              onAction={handleDropAction}
                              onDragEnd={handleDragEnd}
                              zoomScale={zoomScale}
                              onHoverStream={setHoveredStreamId}
                              hoveredStreamId={hoveredStreamId}
                              onHoverDrop={setHoveredDropId}
                              selectedDropId={selectedDropId}
                              onSelectDrop={setSelectedDropId}
                              variant="full"
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              // ── OVERVIEW (STREAM-FIRST) OR DEADLINES VIEW ──
              [...STAGING_STREAMS].filter(stream => {
                  if (viewLevel !== 'deadlines' || !activeMilestoneId) return true;
                  const streamDrops = drops.filter(d => d.streamId === stream.id);
                  if (streamDrops.length === 0) return true;
                  const end = Math.max(...streamDrops.map(d => dropRightEdge(d, 1)), 0);
                  const mAfter = MILESTONES.find(m => m.xOffset >= end) || MILESTONES[MILESTONES.length - 1];
                  return mAfter && mAfter.id === activeMilestoneId;
              }).sort((a, b) => {
                if (viewLevel === 'deadlines') {
                  const endA = Math.max(...drops.filter(d => d.streamId === a.id).map(d => dropRightEdge(d, 1)), 0);
                  const endB = Math.max(...drops.filter(d => d.streamId === b.id).map(d => dropRightEdge(d, 1)), 0);
                  const mAfterA = MILESTONES.find(m => m.xOffset >= endA) || MILESTONES[MILESTONES.length - 1];
                  const mAfterB = MILESTONES.find(m => m.xOffset >= endB) || MILESTONES[MILESTONES.length - 1];
                  const gapA = mAfterA ? mAfterA.xOffset - endA : Infinity;
                  const gapB = mAfterB ? mAfterB.xOffset - endB : Infinity;
                  return gapA - gapB; // Smallest gap (or highly negative collisions) bubble up.
                } else {
                  const minA = Math.min(...drops.filter(d => d.streamId === a.id).map(d => d.xOffset), Infinity);
                  const minB = Math.min(...drops.filter(d => d.streamId === b.id).map(d => d.xOffset), Infinity);
                  return minA - minB;
                }
              }).map((stream) => {
                const stats = streamStats.find(s => s.id === stream.id)!;
                const isExpanded = expandedStreamIds.has(stream.id);
                const streamColor = STREAM_COLORS[stream.colorKey as StreamColorKey];
                
                // Deadlines properties calculation per stream
                const streamDrops = drops.filter(d => d.streamId === stream.id);
                const streamEnd = Math.max(...streamDrops.map(d => dropRightEdge(d, 1)), 0);
                const nearestM = MILESTONES.find(m => m.xOffset >= streamEnd) || MILESTONES[MILESTONES.length - 1];
                const gapToNearestM = nearestM ? nearestM.xOffset - streamEnd : 0;
                
                return (
                  <motion.div
                    key={stream.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-2"
                    data-stream-id={stream.id}
                  >
                    {/* Stream Header Row */}
                    <div className="flex items-center relative group">
                      {/* Stream Sidebar */}
                      <div 
                        className="shrink-0 flex items-center gap-4 py-4 px-8 sticky left-0 z-30 border-r border-[#0a192f]/50 bg-[#020617] shadow-[15px_0_30px_rgba(0,0,0,0.4)]"
                        style={{ width: SIDEBAR_OVERVIEW }}
                      >
                        {/* Stream Content Stack */}
                        <div className="flex-1 min-w-0 flex flex-col gap-2.5">
                          {/* Top Line: Name and Blocker */}
                          <div className="flex items-center gap-2 group/title cursor-pointer p-0.5 -mx-0.5 rounded transition-colors hover:bg-white/5">
                            <h3 className="flex-1 font-bold text-slate-100 group-hover/title:text-white transition-colors text-sm truncate tracking-tight">
                              {stream.title}
                            </h3>
                            <button
                               onClick={() => setSelectedStreamDependencyId(selectedStreamDependencyId === stream.id ? null : stream.id)}
                               className={cn("p-1 rounded-md opacity-0 group-hover/title:opacity-100 transition-all ml-1",
                               selectedStreamDependencyId === stream.id ? "opacity-100 bg-sky-900/40 text-cyan-400" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800")}
                            >
                               <Link className="w-3.5 h-3.5" />
                            </button>
                            {stats.hasBlocker && (
                              <div className="shrink-0 animate-pulse ml-2">
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
                              </div>
                            )}
                          </div>

                          {/* Bottom Line: Avatar + Progress Bar + % */}
                          <div className="flex items-center gap-3">
                            <div
                              className="h-6 w-9 shrink-0 rounded-md flex items-center justify-center font-black text-[8px] shadow-sm border relative"
                              style={{
                                backgroundColor: `${streamColor.hex}15`,
                                borderColor: `${streamColor.hex}40`,
                                color: streamColor.hex
                              }}
                            >
                              {stream.initials}
                            </div>
                            
                            <div className="flex-1 flex items-center gap-2.5">
                              <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${stats.percent}%` }}
                                  className="h-full rounded-full"
                                  style={{ backgroundColor: streamColor.hex, boxShadow: `0 0 10px ${streamColor.hex}50` }}
                                />
                              </div>
                              <span className="text-[10px] font-black text-slate-400 tabular-nums">{stats.percent}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Expand button on the far right of sidebar */}
                        <button
                          onClick={() => toggleStreamExpand(stream.id)}
                          className={cn(
                            'shrink-0 w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center transition-all hover:bg-white/5',
                            isExpanded ? 'bg-cyan-500 text-[#020617] border-cyan-400' : 'text-slate-500'
                          )}
                        >
                          <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-300', isExpanded && 'rotate-180')} />
                        </button>
                      </div>

                      {/* Timeline Area (Collapsed View) */}
                      <div className="flex-1 h-full relative border-l border-slate-800/30 overflow-visible">
                        <div className="absolute inset-0 flex items-center">
                          {viewLevel === 'deadlines' && (
                            <>
                              {/* Safety Bridge */}
                              <div 
                                className={cn(
                                  "absolute h-1.5 top-1/2 -translate-y-1/2 rounded-full transition-all duration-500",
                                  gapToNearestM < 0 ? "bg-rose-500 shadow-[0_0_15px_rgba(243,24,72,0.8)] z-40" :
                                  gapToNearestM <= 80 ? "bg-amber-500/50" : "bg-green-500/20"
                                )}
                                style={{ 
                                  left: gapToNearestM < 0 ? nearestM.xOffset * zoomScale : streamEnd * zoomScale, 
                                  width: Math.abs(gapToNearestM) * zoomScale 
                                }}
                              />
                              {/* Collision Alert Label */}
                              {gapToNearestM < 0 && (
                                <div 
                                  className="absolute top-1/2 -translate-y-1/2 -mt-6 rounded px-2 py-0.5 bg-rose-950 border border-rose-500 text-[9px] font-bold text-rose-400 uppercase tracking-widest whitespace-nowrap animate-pulse z-50 shadow-[0_0_20px_rgba(244,63,94,0.5)]"
                                  style={{ left: (streamEnd * zoomScale) + 10 }}
                                >
                                  Late {Math.round(Math.abs(gapToNearestM)/80)} Days
                                </div>
                              )}
                            </>
                          )}
                          <AnimatePresence>
                            {!isExpanded && stats.drops.map(drop => {
                              // Calculate Overlap Intensity
                              const dropWidth = getDropWidth(drop, zoomScale);
                              const dropStart = drop.xOffset;
                              const dropEnd = drop.xOffset + (dropWidth / zoomScale);

                              const intensity = stats.drops.filter(other => {
                                if (other.id === drop.id) return false;
                                const otherWidth = getDropWidth(other, zoomScale);
                                const otherStart = other.xOffset;
                                const otherEnd = other.xOffset + (otherWidth / zoomScale);
                                // Check overlap
                                return dropStart < otherEnd && dropEnd > otherStart;
                              }).length + 1;

                              const owner = TEAM_MEMBERS[drop.lane]?.name || 'Unknown';

                              return (
                                <Drop
                                  key={`${stream.id}-${drop.id}`}
                                  {...drop}
                                  ownerName={owner}
                                  intensity={intensity}
                                  streamInitials={stream.initials}
                                  streamColorHex={streamColor.hex}
                                  isMilestoneViolation={violatingDropIds.has(drop.id)}
                                  isDraft={isSandboxActive && (sandboxSnapshot?.drops.find(d => d.id === drop.id)?.lane !== drop.lane || sandboxSnapshot?.drops.find(d => d.id === drop.id)?.xOffset !== drop.xOffset)}
                                  references={drop.references}
                                  onAction={handleDropAction}
                                  onDragEnd={handleDragEnd}
                                  zoomScale={zoomScale}
                                  onHoverStream={setHoveredStreamId}
                                  hoveredStreamId={hoveredStreamId}
                                  onHoverDrop={setHoveredDropId}
                                  selectedDropId={selectedDropId}
                                  onSelectDrop={setSelectedDropId}
                                  hasDependencies={(drop.dependsOn && drop.dependsOn.length > 0) || drops.some(d => d.dependsOn?.includes(drop.id))}
                                  isDependencyBlocked={drop.isBlocked}
                                  forceDimmed={viewLevel === 'deadlines' && !criticalPathDropIds.has(drop.id)}
                                  isCriticalPath={viewLevel === 'deadlines' && criticalPathDropIds.has(drop.id)}
                                  variant="minimal"
                                />
                              );
                            })}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Sub-Lanes */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-x border-b border-slate-800/30 rounded-b-[30px] bg-slate-950/20"
                        >
                          <div className="pl-16 relative">
                            {/* Hierarchy Line */}
                            <div className="absolute left-10 top-0 bottom-10 w-px border-l border-dashed border-slate-700/50" />

                            {stats.contributors.map(laneIdx => {
                              const member = TEAM_MEMBERS[laneIdx];
                              const memberDrops = stats.drops.filter(d => d.lane === laneIdx);
                              if (memberDrops.length === 0) return null;

                              return (
                                <div key={laneIdx} className="relative flex items-center min-h-[85px] border-t border-slate-800/30 group/sublane">
                                  {/* Sub-Header Horizontal connector */}
                                  <div className="absolute left-[-24px] top-1/2 w-6 border-t border-dashed border-slate-700/50" />

                                  <div className="w-64 shrink-0 flex items-center gap-3 px-8 py-4 backdrop-blur-sm border-r border-slate-800/30">
                                    <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700/50 flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover/sublane:border-cyan-500/50 transition-colors">
                                      {member.name.charAt(0)}
                                    </div>
                                    <span className="text-xs font-semibold text-slate-400 group-hover/sublane:text-white transition-colors whitespace-nowrap">
                                      {member.name}
                                    </span>
                                  </div>

                                  <div className="flex-1 h-full relative">
                                    <div className="absolute inset-0 flex items-center">
                                      {memberDrops.map(drop => (
                                        <Drop
                                          key={`${stream.id}-${member.id}-${drop.id}`}
                                          {...drop}
                                          streamInitials={stream.initials}
                                          streamColorHex={streamColor.hex}
                                          isMilestoneViolation={violatingDropIds.has(drop.id)}
                                          isDraft={isSandboxActive && (sandboxSnapshot?.drops.find(d => d.id === drop.id)?.lane !== drop.lane || sandboxSnapshot?.drops.find(d => d.id === drop.id)?.xOffset !== drop.xOffset)}
                                          references={drop.references}
                                          onAction={handleDropAction}
                                          onDragEnd={handleDragEnd}
                                          zoomScale={zoomScale}
                                          onHoverStream={setHoveredStreamId}
                                          hoveredStreamId={hoveredStreamId}
                                          onHoverDrop={setHoveredDropId}
                                          selectedDropId={selectedDropId}
                                          onSelectDrop={setSelectedDropId}
                                          hasDependencies={(drop.dependsOn && drop.dependsOn.length > 0) || drops.some(d => d.dependsOn?.includes(drop.id))}
                                          isDependencyBlocked={drop.isBlocked}
                                          variant="full"
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
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

      <BacklogTray unassignedDrops={unassignedDrops} onDragEnd={handleDragEnd} isSandboxActive={isSandboxActive} />
    </div>
  );
}
