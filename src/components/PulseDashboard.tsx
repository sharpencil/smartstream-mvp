'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AgentPanel, FeedItem } from './AgentPanel';
import { Drop, DropState, getDropWidth } from './Drop';
import { DailyBriefing } from './DailyBriefing';
import { cn } from '@/lib/utils';
import { STAGING_DROPS, STAGING_STREAMS } from '@/lib/stagingData';
import { STREAM_COLORS, StreamColorKey, Reference, PALETTE_KEYS, getStreamColor } from '@/lib/streams';
import { Zap, PlayCircle, ChevronDown, AlertTriangle, Plus, Minus, Link, X, Crosshair, Search, Clock } from 'lucide-react';
import { format, addDays, startOfDay, addHours, differenceInDays, differenceInWeeks, isWeekend, startOfWeek } from 'date-fns';
import { BacklogTray } from './BacklogTray';
import { mockEmployees } from '@/lib/mockTeam';

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
  isReady?: boolean;
  milestoneId?: string;
}

export interface Milestone {
  id: string;
  label: string;
  xOffset: number; // canvas-space x (pre-zoom)
}

const DAY_WIDTH = 80;
const START_DATE = startOfDay(new Date());

// Helper to map xOffset to Date
function xToDate(x: number, nowX: number): Date {
  const daysFromNow = (x - nowX) / DAY_WIDTH;
  return addDays(new Date(), daysFromNow);
}

// ── TimeAxis Component ──────────────────────────────────────────────────────
function TimeAxis({ zoomScale, nowX, totalWidth, sidebarWidth, hoveredDrop, selectedDrop }: {
  zoomScale: number,
  nowX: number,
  totalWidth: number,
  sidebarWidth: number,
  hoveredDrop?: DropData | null,
  selectedDrop?: DropData | null
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dayWidth = DAY_WIDTH * zoomScale;
  
  // Transitions: Weeks (default) -> Days (zoomed)
  const weekOpacity = Math.max(0, Math.min(1, (0.85 - zoomScale) / 0.1));
  const dayOpacity = Math.max(0, Math.min(1, (zoomScale - 0.75) / 0.1));

  const layers = useMemo(() => {
    if (!mounted) return { weeks: [], days: [] };
    
    const startOfToday = START_DATE;
    const startOfThisWeek = startOfWeek(startOfToday, { weekStartsOn: 1 });
    
    // Dynamic range based on viewport
    const startDay = Math.floor(-nowX / DAY_WIDTH) - 10;
    const endDay = Math.ceil((totalWidth / zoomScale - nowX) / DAY_WIDTH) + 2;
    
    const res = { weeks: [] as any[], days: [] as any[] };

    // 1. Weeks
    if (weekOpacity > 0) {
      for (let i = startDay - 7; i < endDay + 7; i++) {
        const date = addDays(startOfToday, i);
        const dayOfThisWeek = (date.getDay() + 6) % 7;
        const isMacro = zoomScale < 0.35;

        if (isMacro) {
          const weekOffset = differenceInWeeks(date, startOfThisWeek);
          const weekStep = zoomScale < 0.2 ? 4 : 2;
          if (dayOfThisWeek !== 0 || Math.abs(weekOffset) % weekStep !== 0) continue;
        } else if (zoomScale < 0.7) {
          if (dayOfThisWeek !== 0) continue;
        } else {
          if (dayOfThisWeek !== 0) continue;
        }

        const x = (i * DAY_WIDTH + nowX) * zoomScale;
        res.weeks.push({ x, label: `WK ${format(date, 'w')}` });
      }
    }

    // 2. Days
    if (dayOpacity > 0) {
      // Adaptive day stepping: show every 2nd day if zoom is low
      const dayStep = zoomScale < 1.0 ? 2 : 1;
      for (let i = startDay; i < endDay; i++) {
        if (i % dayStep !== 0) continue;
        const date = addDays(startOfToday, i);
        const x = (i * DAY_WIDTH + nowX) * zoomScale;
        res.days.push({ x, label: format(date, 'EEE d') });
      }
    }

    return res;
  }, [mounted, zoomScale, nowX, totalWidth, weekOpacity, dayOpacity]);

  return (
    <div 
      className="sticky top-0 z-[110] h-12 border-b border-white/5 bg-[#020617]/80 backdrop-blur-md pointer-events-none" 
      style={{ width: totalWidth + sidebarWidth }}
      suppressHydrationWarning
    >
      <div className="relative h-full" style={{ marginLeft: sidebarWidth }} suppressHydrationWarning>
        {/* Weeks */}
        <div className="absolute inset-0 transition-opacity duration-300" style={{ opacity: weekOpacity }}>
          {layers.weeks.map((item, i) => (
            <div key={i} className="absolute top-0 bottom-0 flex flex-col justify-end pb-2" style={{ left: item.x }}>
              <span className="text-[9px] font-bold tracking-widest uppercase text-slate-400 whitespace-nowrap pl-1.5 pb-0.5">{item.label}</span>
            </div>
          ))}
        </div>
        {/* Days */}
        <div className="absolute inset-0 transition-opacity duration-300" style={{ opacity: dayOpacity }}>
          {layers.days.map((item, i) => (
            <div key={i} className="absolute top-0 bottom-0 flex flex-col justify-end pb-2" style={{ left: item.x }}>
              <span className="text-[9px] font-bold tracking-widest uppercase text-slate-300 whitespace-nowrap px-1">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── GridLayer Component ─────────────────────────────────────────────────────
function GridLayer({ zoomScale, nowX, totalWidth, sidebarWidth }: {
  zoomScale: number,
  nowX: number,
  totalWidth: number,
  sidebarWidth: number
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dayWidth = DAY_WIDTH * zoomScale;
  const startOfToday = START_DATE;
  const startOfThisWeek = startOfWeek(startOfToday, { weekStartsOn: 1 });

  // Dynamic range based on viewport
  const startDay = Math.floor(-nowX / DAY_WIDTH) - 10;
  const endDay = Math.ceil((totalWidth / zoomScale - nowX) / DAY_WIDTH) + 2;

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" style={{ marginLeft: sidebarWidth }} suppressHydrationWarning>
      {Array.from({ length: endDay - startDay + 20 }).map((_, i) => {
        const offset = startDay + i;
        const date = addDays(startOfToday, offset);
        const isLowZoom = zoomScale < 0.4;

        // Synchronize with TimeAxis step logic (Mondays)
        if (isLowZoom) {
          const dayOfThisWeek = differenceInDays(date, startOfWeek(date, { weekStartsOn: 1 }));
          if (dayOfThisWeek !== 0) return null;

          const weekOffset = differenceInWeeks(date, startOfThisWeek);
          const weekStep = zoomScale < 0.15 ? 4 : 2;
          if (Math.abs(weekOffset) % weekStep !== 0) return null;
        }

        const x = (offset * DAY_WIDTH + nowX) * zoomScale;
        const weekend = isWeekend(date);

        return (
          <React.Fragment key={offset}>
            {/* Weekend Trench */}
            {weekend && (
              <div
                className="absolute top-0 bottom-0 bg-black/20 backdrop-brightness-75"
                style={{ left: x, width: dayWidth }}
              >
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_#0ea5e9_1px,_transparent_1px)] bg-[size:12px_12px]" />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}



// ── Staging stream definition map ────────────────────────────────────────────
const STAGING_STREAM_MAP = Object.fromEntries(
  STAGING_STREAMS.map((s, idx) => [
    s.id,
    {
      id: s.id,
      title: s.title,
      initials: s.initials,
      colorKey: PALETTE_KEYS[idx % PALETTE_KEYS.length]
    },
  ])
);

const PREDEFINED_NAMES = ['Sarah', 'Mike', 'Alex', 'Elena', 'Sam', 'David', 'Laura', 'Chris'];
const uniqueOwnerIds = Array.from(new Set(STAGING_DROPS.map(d => d.owner_id).filter(Boolean)));
export const TEAM_MEMBERS = uniqueOwnerIds.map((id, index) => ({
  id,
  name: PREDEFINED_NAMES[index % PREDEFINED_NAMES.length] || `Member ${index + 1}`
}));
if (TEAM_MEMBERS.length === 0) {
  TEAM_MEMBERS.push({ id: '1', name: 'Sarah' });
}
let DEFAULT_MILESTONES: Milestone[] = [
  { id: 'm1', label: 'Tracking MVP', xOffset: 800, status: 'locked', date: 'May 15' },
  { id: 'm2', label: 'DB Migration', xOffset: 1600, status: 'locked', date: 'Jun 10' },
  { id: 'm3', label: 'AI Eval Live', xOffset: 2400, status: 'locked', date: 'Jul 15' }
];

//  Completed   → left of NOW_LINE_BASE (pre-Now)
//  Not Started → ghost, right of NOW_LINE_BASE
//  In Progress → active, near NOW_LINE_BASE
let NOW_LINE_BASE = 420;

function buildInitialData(): { drops: DropData[], unassigned: DropData[] } {
  const dropsMap = new Map<string, DropData>();
  const unassigned: DropData[] = [];

  // Specific drops to move to the 'Reservoir' (Backlog)
  const BACKLOG_DROP_IDS = ['8999', '9000'];

  STAGING_STREAMS.forEach((stream) => {
    stream.drops.forEach((drop) => {
      let lane = 0;
      const tIdx = TEAM_MEMBERS.findIndex(m => m.id === drop.owner_id);
      if (tIdx > -1) lane = tIdx;

      let state: 'ghost' | 'active' | 'completed' = 'ghost';
      if (drop.status === 'Completed') state = 'completed';
      else if (drop.status === 'Active' || drop.status === 'In Progress') state = 'active';

      // Mark blocked / red trace if missing completion date and past due date
      const isBroken = Boolean(!drop.completion_date && drop.due_date && new Date() > new Date(drop.due_date));

      const dropId = `staging-${drop.drop_id}`;
      const dropData: DropData = {
        id: dropId,
        lane,
        title: drop.title,
        description: drop.title,
        tasks: drop.tasks,
        status: drop.status,
        complexity: drop.complexity || 4,
        state,
        effortHours: drop.estimated_time || drop.complexity || 4,
        xOffset: 0,
        streamId: stream.id,
        isBlocked: isBroken,
        dependsOn: (drop.dependsOn || []).map((d: string) => `staging-${d}`),
      };

      if (BACKLOG_DROP_IDS.includes(drop.drop_id)) {
        unassigned.push(dropData);
      } else {
        dropsMap.set(dropId, dropData);
      }
    });
  });

  const allDrops = Array.from(dropsMap.values());

  const getTopologicalOrder = (nodes: DropData[]): string[] => {
    const inDegree = new Map<string, number>();
    const graph = new Map<string, string[]>();
    nodes.forEach(d => {
      inDegree.set(d.id, 0);
      if (!graph.has(d.id)) graph.set(d.id, []);
    });

    // Reverse dependency graph (A depends on B -> B to A edge)
    nodes.forEach(d => {
      (d.dependsOn || []).forEach(depId => {
        if (graph.has(depId)) {
          graph.get(depId)!.push(d.id);
          inDegree.set(d.id, (inDegree.get(d.id) || 0) + 1);
        }
      });
    });

    const queue: string[] = [];
    inDegree.forEach((count, id) => { if (count === 0) queue.push(id); });

    const order: string[] = [];
    while (queue.length > 0) {
      const u = queue.shift()!;
      order.push(u);
      graph.get(u)!.forEach(v => {
        inDegree.set(v, inDegree.get(v)! - 1);
        if (inDegree.get(v) === 0) queue.push(v);
      });
    }

    nodes.forEach(d => { if (!order.includes(d.id)) order.push(d.id); });
    return order;
  };

  let INITIAL_MAX_X = 420;

  const order = getTopologicalOrder(allDrops);
  const laneEndTimes: Record<number, number> = {};

  order.forEach(id => {
    const d = dropsMap.get(id);
    if (!d) return;

    let baseStart = 400; // Large logical padding to ensure visibility behind sidebar shadow at max zoom-out

    if (d.dependsOn) {
      d.dependsOn.forEach(depId => {
        const p = dropsMap.get(depId);
        if (p) {
          const pEnd = p.xOffset + getDropWidth({ effortHours: p.effortHours, complexity: p.complexity }, 1) + 20;
          if (pEnd > baseStart) baseStart = pEnd;
        }
      });
    }

    const lEnd = laneEndTimes[d.lane] || 0;
    const actualStart = Math.max(baseStart, lEnd + 15);
    d.xOffset = actualStart;

    const nodeEnd = actualStart + getDropWidth({ effortHours: d.effortHours, complexity: d.complexity }, 1);
    laneEndTimes[d.lane] = nodeEnd;

    if (nodeEnd > INITIAL_MAX_X) {
      INITIAL_MAX_X = nodeEnd;
    }
  });

  // Calculate NOW_LINE_BASE at 25% of the total project duration
  NOW_LINE_BASE = INITIAL_MAX_X * 0.25;

  let didAssignBlocker = false;

  // Adjust drop visualizations (states) based strictly on their physical relation to the 25% NOW mark
  allDrops.forEach(d => {
    const nodeRightEdge = d.xOffset + getDropWidth({ effortHours: d.effortHours, complexity: d.complexity }, 1);
    const isOverlapping = d.xOffset < NOW_LINE_BASE + 20 && nodeRightEdge > NOW_LINE_BASE;

    if (isOverlapping && !didAssignBlocker) {
      d.isBlocked = true;
      didAssignBlocker = true;
    }

    if (d.isBlocked) {
      d.state = 'active';
      d.isReady = false;
    } else if (nodeRightEdge <= NOW_LINE_BASE + 20) {
      d.state = 'completed';
      d.isReady = false;
    } else if (isOverlapping) {
      d.state = 'active';
      d.isReady = false;
    } else {
      d.state = 'ghost';

      // Calculate `isReady` visually if child is pending but parent is completed
      let parentCompleted = false;
      if (d.dependsOn) {
        d.dependsOn.forEach(depId => {
          const p = dropsMap.get(depId);
          if (p && p.state === 'completed') parentCompleted = true;
        });
      }
      if (parentCompleted) d.isReady = true;
    }
  });

  allDrops.forEach(d => {
    const nodeRightEdge = d.xOffset + getDropWidth({ effortHours: d.effortHours, complexity: d.complexity }, 1);
    const m = DEFAULT_MILESTONES.find(m => m.xOffset >= nodeRightEdge);
    d.milestoneId = m ? m.id : DEFAULT_MILESTONES[DEFAULT_MILESTONES.length - 1].id;
  });

  return { drops: allDrops, unassigned };
}

const { drops: INITIAL_DROPS, unassigned: INITIAL_UNASSIGNED_DROPS } = buildInitialData();

const RAW_MIN_X = Math.min(...INITIAL_DROPS.map(d => d.xOffset));
const X_SHIFT = -RAW_MIN_X + 24;
INITIAL_DROPS.forEach(d => { d.xOffset += X_SHIFT; });
DEFAULT_MILESTONES.forEach(m => { m.xOffset += X_SHIFT; });

const PROJECT_END_X = Math.max(
  Math.max(...INITIAL_DROPS.map(d => d.xOffset + getDropWidth({ effortHours: d.effortHours, complexity: d.complexity }, 1))),
  Math.max(...DEFAULT_MILESTONES.map(m => m.xOffset))
) + 100; // Tighter padding for last milestone label

const INITIAL_ZOOM = Math.min(1, 1400 / Math.max(PROJECT_END_X, 100));

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

    // Force negative for visual variety on Alex (Lane 3)
    if (laneId === '3') result[laneId] = -14;
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
  const [viewLevel, setViewLevel] = useState<'streams' | 'team' | 'milestones'>('streams');
  const [focusedStreamId, setFocusedStreamId] = useState<string | null>(null);
  const [focusedMilestoneId, setFocusedMilestoneId] = useState<string | null>(null);
  const [focusedMemberId, setFocusedMemberId] = useState<string | null>(null);
  const [expandedStreamIds, setExpandedStreamIds] = useState<Set<string>>(new Set());
  const [expandedMilestoneIds, setExpandedMilestoneIds] = useState<Set<string>>(new Set());
  const [expandedMemberIds, setExpandedMemberIds] = useState<Set<string>>(new Set());
  const [activeMilestoneId, setActiveMilestoneId] = useState<string | null>(null);

  const [milestones, setMilestones] = useState<Milestone[]>(DEFAULT_MILESTONES);
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Dynamic Sidebar widths to ensure Now Line and Milestones align in both views
  const SIDEBAR_DETAILED = 320; // Matches Team View's w-80 sidebar
  const SIDEBAR_OVERVIEW = 300;
  const SIDEBAR_FOCUS = 360;
  const currentSidebarWidth = viewLevel === 'team' ? SIDEBAR_DETAILED : (focusedStreamId ? SIDEBAR_FOCUS : SIDEBAR_OVERVIEW);

  const [drops, setDrops] = useState<DropData[]>(INITIAL_DROPS);
  const [unassignedDrops, setUnassignedDrops] = useState<DropData[]>(INITIAL_UNASSIGNED_DROPS);

  const [zoomScale, setZoomScale] = useState(INITIAL_ZOOM);
  const [minZoom, setMinZoom] = useState(0.05);
  const [isNowLineHovered, setIsNowLineHovered] = useState(false);

  // Initial zoom calculation to fit the whole timeline in the available real estate
  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollContainerRef.current) {
        // Calculate available width: container width minus the sidebar and a safety margin
        const containerWidth = scrollContainerRef.current.clientWidth - currentSidebarWidth - 120;
        if (containerWidth > 0 && PROJECT_END_X > 0) {
          const fitZoom = containerWidth / PROJECT_END_X;
          const finalZoom = Math.min(1.2, Math.max(0.05, fitZoom));
          setZoomScale(finalZoom);
          setMinZoom(finalZoom);
        }
      }
    }, 150); // Delay to ensure layout and AgentPanel state are settled
    return () => clearTimeout(timer);
  }, [currentSidebarWidth]);


  // Auto-scroll to keep the NOW line centered when zooming
  useEffect(() => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.clientWidth;
      const targetScrollLeft = (NOW_LINE_X * zoomScale) + currentSidebarWidth - (containerWidth / 2);
      scrollContainerRef.current.scrollTo({ left: Math.max(0, targetScrollLeft), behavior: 'smooth' });
    }
  }, [zoomScale, currentSidebarWidth]);

  const toggleStreamExpand = (id: string) => {
    if (viewLevel === 'streams') {
      setFocusedStreamId(prev => prev === id ? null : id);
      // Automatically expand if focusing
      setExpandedStreamIds(prev => {
        const next = new Set(prev);
        if (focusedStreamId === id) next.delete(id);
        else next.add(id);
        return next;
      });
      return;
    }

    setExpandedStreamIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleMilestoneExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedMilestoneIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setFocusedMilestoneId(null);
      } else {
        // Isolation logic: only focus if we are in milestones view
        if (viewLevel === 'milestones') {
          setFocusedMilestoneId(id);
        }
        next.add(id);
      }
      return next;
    });
  };

  const toggleMemberExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedMemberIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setFocusedMemberId(null);
      } else {
        // Isolation logic: only focus if we are in team view
        if (viewLevel === 'team') {
          setFocusedMemberId(id);
        }
        next.add(id);
      }
      return next;
    });
  };

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

  const handleHoverDrop = (id: string | null) => {
    setHoveredDropId(id);
  };
  const [selectedDropId, setSelectedDropId] = useState<string | null>(null);
  const [selectedStreamDependencyId, setSelectedStreamDependencyId] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number, y: number }>>({});

  useEffect(() => {
    const updatePositions = () => {
      const svgEl = document.getElementById('svg-overlay-container');
      if (!svgEl) return;
      const svgRect = svgEl.getBoundingClientRect();
      const newPositions: Record<string, { x: number, y: number }> = {};

      document.querySelectorAll('[data-stream-id]').forEach(el => {
        const id = el.getAttribute('data-stream-id')!;
        const rect = el.getBoundingClientRect();
        newPositions[`stream-${id}`] = {
          x: (rect.left - svgRect.left) + (rect.width / 2),
          y: (rect.top - svgRect.top) + (rect.height / 2)
        };
      });

      document.querySelectorAll('[data-id]').forEach(el => {
        const id = el.getAttribute('data-id')!;
        const rect = el.getBoundingClientRect();
        newPositions[`drop-${id}`] = {
          x: (rect.left - svgRect.left) + (rect.width / 2),
          y: (rect.top - svgRect.top) + (rect.height / 2)
        };
      });

      setNodePositions(prev => {
        const keys = Object.keys(newPositions);
        if (keys.length !== Object.keys(prev).length) return newPositions;
        for (const k of keys) {
          if (Math.abs(newPositions[k].x - prev[k].x) > 1 || Math.abs(newPositions[k].y - prev[k].y) > 1) return newPositions;
        }
        return prev; // unchanged
      });
    };

    // Delay slight processing for layout animations to settle
    const to1 = setTimeout(updatePositions, 50);
    const to2 = setTimeout(updatePositions, 500);
    return () => { clearTimeout(to1); clearTimeout(to2); };
  }, [
    viewLevel,
    expandedStreamIds,
    drops,
    activeMilestoneId,
    hoveredDropId,
    selectedDropId,
    selectedStreamDependencyId,
    focusedMemberId,
    focusedMilestoneId,
    expandedMilestoneIds,
    focusedStreamId
  ]);

  // Briefing dismissal state (independent of data — PM can snooze)
  const [blockerDismissed, setBlockerDismissed] = useState(false);
  const [forecastDismissed, setForecastDismissed] = useState(false);
  const [resolutionDismissed, setResolutionDismissed] = useState(false);
  const [forecastSlipHours, setForecastSlipHours] = useState(4);


  const [memberVelocity, setMemberVelocity] = useState<Record<string, number>>(INITIAL_VELOCITY);

  const [isAgentOpen, setIsAgentOpen] = useState(false);
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
        milestones.forEach(m => {
          if (drop.xOffset < m.xOffset && rightEdge > m.xOffset) violated.add(m.id);
        });
      });
    return violated;
  }, [drops, milestones]);

  const violatingDropIds = useMemo<Set<string>>(() => {
    const result = new Set<string>();
    drops
      .filter(d => d.state === 'ghost')
      .forEach(drop => {
        const rightEdge = drop.xOffset + (getDropWidth(drop, 1));
        if (milestones.some(m => drop.xOffset < m.xOffset && rightEdge > m.xOffset)) result.add(drop.id);
      });
    return result;
  }, [drops, milestones]);

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
      if (unique.has(key)) return false;
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
          const children = newDrops.filter(d => d.dependsOn?.includes(dropId));
          children.forEach(c => {
            const cIdx = newDrops.findIndex(x => x.id === c.id);
            if (cIdx > -1) {
              newDrops[cIdx] = { ...newDrops[cIdx], xOffset: newDrops[cIdx].xOffset + shiftVal };
              processShift(c.id, shiftVal);
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
        let newDrops = [...prev];
        const existingIdx = prev.findIndex(d => d.id === id);
        let shiftVal = 0;

        if (existingIdx > -1) {
          shiftVal = newXOffset - prev[existingIdx].xOffset;
          newDrops[existingIdx] = { ...prev[existingIdx], lane: laneIdx, xOffset: newXOffset };
        } else {
          const backlog = unassignedDrops.find(d => d.id === id);
          if (backlog) {
            setUnassignedDrops(u => u.filter(d => d.id !== id));
            const clampedX = Math.max(NOW_LINE_X, newXOffset);
            shiftVal = 0; // initial drop
            newDrops.push({ ...backlog, lane: laneIdx, xOffset: clampedX });
          }
        }

        const shiftChildren = (parentId: string, amount: number) => {
          if (amount === 0) return;
          const children = newDrops.filter(d => d.dependsOn?.includes(parentId));
          children.forEach(c => {
            const cIdx = newDrops.findIndex(x => x.id === c.id);
            if (cIdx > -1) {
              newDrops[cIdx] = { ...newDrops[cIdx], xOffset: newDrops[cIdx].xOffset + amount };
              shiftChildren(c.id, amount);
            }
          });
        };

        shiftChildren(id, shiftVal);
        return newDrops;
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
      setFeed(prev => [{ id: Date.now().toString(), type: 'alert', text: <span><span className="text-amber-400 font-medium">What-If Mode:</span> Now projecting draft changes.</span> }, ...prev]);
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
    setFeed(prev => [{ id: Date.now().toString(), type: 'update', text: <span><span className="text-slate-400 font-medium">Discarded:</span> What-If changes reverted.</span> }, ...prev]);
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <>
      <div className={cn("w-full flex flex-col p-8 min-h-full transition-all duration-500 ease-in-out text-slate-50 pb-32",
        "bg-[#020617]",
        isSandboxActive && "border-[2px] border-amber-500 shadow-[inset_0_0_80px_rgba(245,158,11,0.15)]",
        isAgentOpen ? "pr-[392px]" : "pr-8"
      )}>

        {/* Header Controls */}
        <div className={cn(
          "flex items-center justify-between pb-5 border-b border-white/5 sticky top-0 backdrop-blur-md z-40 relative transition-all duration-500 bg-[#020617]/90"
        )}>
          <h1 className="text-3xl font-bold font-sans tracking-tight text-slate-100 flex items-center gap-3">
            Pulse
          </h1>
        </div>

        {/* ── Main Scroll Context (Vertical) ── */}
        <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar">
          {/* Daily Briefing (Scrollable) */}
          <div>
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
              blockerResolutionCount={resolutionDismissed ? 0 : blockerCount}
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
            <div
              ref={scrollContainerRef}
              onClick={(e) => {
                if (e.target === e.currentTarget) setSelectedDropId(null);
              }}
              className={cn(
                'flex flex-col pt-0 pb-32 overflow-x-auto custom-scrollbar relative min-w-0 transition-all duration-500'
              )}>

              {/* Invisible Scroll Width Spacer */}
              <div style={{ minWidth: (PROJECT_END_X * zoomScale) + currentSidebarWidth, height: 1 }} className="shrink-0 pointer-events-none" />

              {/* Top toolbar (Sticky within the vertical scroll container) */}
              <div className="sticky left-0 right-0 top-0 z-[80] flex justify-between items-center pointer-events-none bg-[#020617]/40 backdrop-blur-md py-5 rounded-b-2xl border-b border-white/5 shadow-2xl">

                {/* View Level Toggle - Centered relative to visible area */}
                <div className="absolute left-1/2 -translate-x-1/2 flex flex-nowrap bg-[#0a192f]/60 p-1.5 border border-slate-800/60 rounded-full shadow-inner shadow-black/20 backdrop-blur-md pointer-events-auto">
                  <button
                    onClick={() => {
                      setViewLevel('streams');
                      setFocusedStreamId(null);
                      setFocusedMemberId(null);
                      setFocusedMilestoneId(null);
                      setHoveredStreamId(null);
                      setHoveredDropId(null);
                    }}
                    className={cn(
                      'px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-all relative whitespace-nowrap',
                      viewLevel === 'streams' ? 'bg-teal-950/80 text-teal-400 shadow-inner shadow-teal-500/20 border border-teal-500/20' : 'text-slate-500 hover:text-slate-300'
                    )}
                  >
                    Streams
                  </button>
                  <button
                    onClick={() => {
                      setViewLevel('team');
                      setFocusedStreamId(null);
                      setFocusedMemberId(null);
                      setFocusedMilestoneId(null);
                      setHoveredStreamId(null);
                      setHoveredDropId(null);
                    }}
                    className={cn(
                      'px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-all relative whitespace-nowrap',
                      viewLevel === 'team' ? 'bg-teal-950/80 text-teal-400 shadow-inner shadow-teal-500/20 border border-teal-500/20' : 'text-slate-500 hover:text-slate-300'
                    )}
                  >
                    Team
                  </button>
                  <button
                    onClick={() => {
                      setViewLevel('milestones');
                      setFocusedStreamId(null);
                      setFocusedMemberId(null);
                      setFocusedMilestoneId(null);
                      setActiveMilestoneId(null);
                      setHoveredStreamId(null);
                      setHoveredDropId(null);
                    }}
                    className={cn(
                      'px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-all relative whitespace-nowrap',
                      viewLevel === 'milestones' ? 'bg-teal-950/80 text-teal-400 shadow-inner shadow-teal-500/20 border border-teal-500/20' : 'text-slate-500 hover:text-slate-300'
                    )}
                  >
                    Milestones
                  </button>
                </div>

                <div className="inline-flex items-center bg-[#0a192f]/80 backdrop-blur-md rounded-xl p-1 h-10 border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] pointer-events-auto">
                  <button
                    onClick={() => setZoomScale(prev => Math.max(minZoom, prev - 0.1))}
                    className="w-8 h-full flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all disabled:opacity-30"
                    disabled={zoomScale <= minZoom}
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <div className="px-3 flex items-center">
                    <input
                      type="range"
                      min={minZoom}
                      max={2}
                      step={0.01}
                      value={zoomScale}
                      onChange={(e) => setZoomScale(parseFloat(e.target.value))}
                      className="w-32 h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-cyan-500
                                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500
                                [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(34,211,238,0.8)]
                                hover:[&::-webkit-slider-thumb]:scale-125 transition-transform"
                    />
                  </div>

                  <button
                    onClick={() => setZoomScale(prev => Math.min(2, prev + 0.1))}
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
                      What-If
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
              
              <TimeAxis 
                zoomScale={zoomScale} 
                nowX={NOW_LINE_X} 
                totalWidth={PROJECT_END_X * zoomScale} 
                sidebarWidth={currentSidebarWidth}
                hoveredDrop={hoveredDropId ? drops.find(d => d.id === hoveredDropId) : null}
                selectedDrop={selectedDropId ? drops.find(d => d.id === selectedDropId) : null}
              />

              {/* Now Line Distance Gauge (Hover-based) */}
              <AnimatePresence>
                {isNowLineHovered && selectedDropId && (drops.find(d => d.id === selectedDropId)?.xOffset || 0) > NOW_LINE_BASE && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute top-[135px] pointer-events-none z-[120] flex items-center gap-2 bg-cyan-500 text-cyan-950 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                    style={{ left: (NOW_LINE_X * zoomScale) + currentSidebarWidth + 10 }}
                  >
                    <Clock className="w-3 h-3" />
                    T-minus {Math.max(1, Math.round((drops.find(d => d.id === selectedDropId)!.xOffset - NOW_LINE_BASE) / DAY_WIDTH))} days
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Now Line */}
              <div
                className="absolute top-[120px] bottom-0 w-[2px] bg-gradient-to-b from-cyan-400/0 via-cyan-400 to-cyan-400/0 z-[120]
                       animate-time-pulse pointer-events-none
                       before:absolute before:content-[''] before:left-1/2 before:-translate-x-1/2 before:-top-3
                       before:w-3.5 before:h-3.5 before:bg-cyan-400 before:rounded-full before:shadow-[0_0_10px_rgba(34,211,238,1)]
                       before:hover:scale-125 before:transition-transform before:pointer-events-auto before:cursor-pointer
                       after:content-['NOW'] after:absolute after:-top-8 after:left-1/2 after:-translate-x-1/2
                       after:text-cyan-400 after:text-xs after:font-bold after:tracking-widest
                       transition-all duration-500"
                style={{ left: (NOW_LINE_X * zoomScale) + currentSidebarWidth }}
                onMouseEnter={() => setIsNowLineHovered(true)}
                onMouseLeave={() => setIsNowLineHovered(false)}
              >
              </div>

              {/* Swimlanes container */}
              <div className="flex flex-col gap-0 mt-6 relative">
                <GridLayer
                  zoomScale={zoomScale}
                  nowX={NOW_LINE_X}
                  totalWidth={PROJECT_END_X * zoomScale}
                  sidebarWidth={currentSidebarWidth}
                />


                {/* Dependency Traces SVG Layer - Elevated above popups with additive blending */}
                <svg id="svg-overlay-container" className="absolute inset-0 w-full h-full pointer-events-none z-[1500] overflow-visible" style={{ mixBlendMode: 'plus-lighter' }}>
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
                      const srcPos = nodePositions[`stream-${path.srcStreamId}`];
                      const dstPos = nodePositions[`stream-${path.dstStreamId}`];
                      if (!srcPos || !dstPos) return null;

                      const targetStreamDef = STAGING_STREAM_MAP[path.srcStreamId];
                      const traceColor = targetStreamDef ? getStreamColor(targetStreamDef.colorKey).hex : '#94a3b8';

                      const startX = currentSidebarWidth - 20;
                      const midX = startX + 50;
                      const dPath = `M ${startX} ${srcPos.y} C ${midX} ${srcPos.y}, ${midX} ${dstPos.y}, ${startX} ${dstPos.y}`;

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
                          style={{ filter: `drop-shadow(0 0 5px ${traceColor}80)` }}
                        />
                      );
                    })}

                    {/* 2. Drop Dependency Traces */}
                    {(() => {
                      const linksToDraw: { src: DropData, dst: DropData }[] = [];
                      const activeDropId = hoveredDropId || selectedDropId;
                      const added = new Set<string>();
                      const focusedMemberLaneIndex = focusedMemberId ? TEAM_MEMBERS.findIndex(m => m.id === focusedMemberId) : -1;

                      drops.forEach(drop => {
                        if (drop.dependsOn) {
                          drop.dependsOn.forEach(depId => {
                            const parent = drops.find(d => d.id === depId || d.id === `staging-${depId}`);
                            if (parent) {
                              // Enforce strict same-stream dependency visibility
                              if (parent.streamId !== drop.streamId) return;

                              // FOCUS MODE FILTER: Only show lines if at least one end is in the focused view
                              if (focusedStreamId && (drop.streamId !== focusedStreamId && parent.streamId !== focusedStreamId)) {
                                return;
                              }
                              if (focusedMilestoneId && (drop.milestoneId !== focusedMilestoneId && parent.milestoneId !== focusedMilestoneId)) {
                                return;
                              }
                              if (focusedMemberLaneIndex !== -1 && (drop.lane !== focusedMemberLaneIndex && parent.lane !== focusedMemberLaneIndex)) {
                                return;
                              }

                              if (drop.id === selectedDropId || parent.id === selectedDropId) {
                                const key = `${parent.id}-${drop.id}`;
                                // Only draw if BOTH ends are rendered in the DOM (have stored positions)
                                const bothRendered = nodePositions[`drop-${parent.id}`] !== undefined && nodePositions[`drop-${drop.id}`] !== undefined;

                                if (!added.has(key) && bothRendered) {
                                  added.add(key);
                                  linksToDraw.push({ src: parent, dst: drop });
                                }
                              }
                            }
                          });
                        }
                      });
                      return linksToDraw;
                    })().map(({ src, dst }) => {
                      const getCenter = (d: DropData) => {
                        const isDraftX = isSandboxActive && sandboxSnapshot ? sandboxSnapshot.drops.find(sd => sd.id === d.id)?.xOffset !== d.xOffset : false;
                        const isDraftL = isSandboxActive && sandboxSnapshot ? sandboxSnapshot.drops.find(sd => sd.id === d.id)?.lane !== d.lane : false;

                        const storedPos = nodePositions[`drop-${d.id}`];

                        if (storedPos) {
                          return { x: storedPos.x, y: storedPos.y, isDraft: isDraftX || isDraftL };
                        }

                        // Fallback (should be rare with visibility filtering)
                        const width = getDropWidth(d, zoomScale);
                        const y = (d.lane * 100) + 50;
                        return {
                          x: currentSidebarWidth + (d.xOffset * zoomScale) + width / 2,
                          y,
                          isDraft: isDraftX || isDraftL
                        };
                      };

                      const p1 = getCenter(src);
                      const p2 = getCenter(dst);

                      const isSimulating = isSandboxActive && (p1.isDraft || p2.isDraft);
                      const isBroken = dst.isBlocked;

                      const targetStreamDef = STAGING_STREAM_MAP[dst.streamId || ''];
                      const traceColor = isSimulating ? '#f59e0b' : (isBroken ? '#f43f5e' : (targetStreamDef ? getStreamColor(targetStreamDef.colorKey).hex : '#94a3b8'));

                      const dPath = `M ${p1.x} ${p1.y} C ${p1.x + 100} ${p1.y}, ${p2.x - 100} ${p2.y}, ${p2.x} ${p2.y}`;

                      return (
                        <motion.path
                          key={`drop-${src.id}-${dst.id}`}
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{
                            pathLength: 1,
                            opacity: (hoveredDropId === src.id || hoveredDropId === dst.id || selectedDropId === src.id || selectedDropId === dst.id) ? 1 : 0.6,
                            strokeDashoffset: (selectedDropId === src.id || selectedDropId === dst.id) ? [0, -20] : 0
                          }}
                          exit={{ opacity: 0, transition: { duration: 0.2 } }}
                          transition={{
                            pathLength: { duration: 0.5, ease: "easeInOut" },
                            strokeDashoffset: { repeat: Infinity, duration: 1, ease: "linear" }
                          }}
                          d={dPath}
                          fill="none"
                          stroke={traceColor}
                          strokeWidth={(hoveredDropId === src.id || hoveredDropId === dst.id || selectedDropId === src.id || selectedDropId === dst.id) || isBroken ? "3" : "1.5"}
                          strokeDasharray={(selectedDropId === src.id || selectedDropId === dst.id) ? "10,5" : "none"}
                          className={cn(isBroken && !isSimulating && 'animate-pulse')}
                          style={{
                            filter: (hoveredDropId === src.id || hoveredDropId === dst.id || selectedDropId === src.id || selectedDropId === dst.id)
                              ? `drop-shadow(0 0 8px ${traceColor})`
                              : 'none'
                          }}
                        />
                      );
                    })}
                  </AnimatePresence>
                </svg>



                {/* ── Milestone Lines ── */}
                {milestones.map(m => {
                  const violated = violatedMilestoneIds.has(m.id);
                  const lineX = (m.xOffset * zoomScale) + 4; // +4 for sidebar offset tweak

                  const isMilestonesView = viewLevel === 'milestones';
                  const isSelected = activeMilestoneId === m.id;

                  const diffToNow = m.xOffset - NOW_LINE_X;
                  const daysToNow = Math.round(diffToNow / 80); // 80px nominal day
                  const tMinusText = daysToNow >= 0 ? `T-Minus ${daysToNow} Days` : `T+ ${Math.abs(daysToNow)} Days`;

                  return (
                    <div
                      key={m.id}
                      className={cn("absolute top-0 bottom-0 z-30 transition-all", isMilestonesView ? "pointer-events-auto cursor-pointer group/mline" : "pointer-events-none")}
                      style={{ left: currentSidebarWidth + lineX }}
                      onClick={() => isMilestonesView && setActiveMilestoneId(activeMilestoneId === m.id ? null : m.id)}
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
                        {isMilestonesView ? (
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
                {viewLevel === 'team' ? (
                  <div className="flex flex-col gap-0">
                    <AnimatePresence mode="popLayout">
                      {TEAM_MEMBERS
                        .filter(m => !focusedMemberId || m.id === focusedMemberId)
                        .map((member, laneIndex) => {
                          const memberDrops = drops.filter(d => d.lane === laneIndex);
                          const isFocused = focusedMemberId === member.id;
                          const empData = mockEmployees.find(e => e.name.toLowerCase().includes(member.name.toLowerCase())) || mockEmployees[0];

                          // For Focused Mode, group drops by stream
                          const dropsByStream: Record<string, DropData[]> = {};
                          if (isFocused) {
                            memberDrops.forEach(d => {
                              const sId = d.streamId || 'unassigned';
                              if (!dropsByStream[sId]) dropsByStream[sId] = [];
                              dropsByStream[sId].push(d);
                            });
                          }

                          return (
                            <motion.div
                              key={member.id}
                              layout
                              initial={{ opacity: 0, y: 20, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95, transition: { duration: 0.3 } }}
                              className={cn(
                                "transition-all duration-700",
                                isFocused ? "border-2 border-cyan-500/30 bg-cyan-950/5 shadow-[0_0_40px_rgba(34,211,238,0.1)] p-1" : "border-b border-white/5"
                              )}
                              style={{ minWidth: (PROJECT_END_X * zoomScale) + 320 }}
                            >
                              <div className="flex items-center relative group">
                                {/* Member Sidebar */}
                                <div
                                  className={cn(
                                    "shrink-0 flex items-center gap-4 py-6 px-8 sticky left-0 z-[60] border-r border-[#0a192f]/50 bg-[#020617] transition-all duration-500 w-80 shadow-[15px_0_40px_rgba(0,0,0,0.7)]",
                                    isFocused && "shadow-[30px_0_60px_rgba(0,0,0,0.8)] rounded-l-[38px]"
                                  )}
                                >
                                  <div className="flex-1 min-w-0 flex flex-col gap-4">
                                    <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-950 to-[#0a192f] border border-cyan-800/30 flex items-center justify-center shadow-lg group-hover:border-cyan-400/50 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all">
                                        <span className="text-cyan-200 font-bold text-lg">{member.name.charAt(0)}</span>
                                      </div>
                                      <div className="flex flex-col min-w-0">
                                        <span className="font-bold text-slate-100 truncate text-lg tracking-tight">{member.name}</span>
                                        <div className={cn(
                                          'text-[10px] font-bold px-1.5 py-0.5 rounded transition-all duration-500 w-fit mt-0.5 border',
                                          (memberVelocity[member.id] || 0) >= 0
                                            ? 'bg-green-950/40 text-green-400 border-green-500/20 shadow-[0_0_8px_rgba(34,197,94,0.1)]'
                                            : 'bg-amber-950/40 text-amber-500 border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.1)]'
                                        )}>
                                          {(memberVelocity[member.id] || 0) >= 0 ? '+' : ''}{memberVelocity[member.id] || 0}%
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <button
                                    onClick={(e) => toggleMemberExpand(member.id, e)}
                                    className={cn(
                                      'shrink-0 w-8 h-8 rounded-xl border border-white/10 flex items-center justify-center transition-all hover:bg-white/5',
                                      isFocused ? 'bg-cyan-500 text-[#020617] border-cyan-400' : 'text-slate-500'
                                    )}
                                  >
                                    <ChevronDown className={cn('w-4 h-4 transition-transform duration-300', isFocused && 'rotate-180')} />
                                  </button>
                                </div>

                                {/* Timeline / Macro-Bar */}
                                <div className="flex-1 h-full relative border-l border-slate-800/30 min-h-[100px] flex items-center">
                                  {!isFocused ? (
                                    /* MACRO-FLATTENED VIEW: Liquid Tube using Drop component */
                                    <div className="absolute inset-0 flex items-center">
                                      <AnimatePresence>
                                        {memberDrops.map(drop => {
                                          const streamDef = STAGING_STREAM_MAP[drop.streamId || ''];
                                          const streamColorHex = streamDef ? getStreamColor(streamDef.colorKey).hex : '#64748b';
                                          const intensity = 1.2; // Consistent intensity for macro view
                                          return (
                                            <Drop
                                              key={`macro-${member.id}-${drop.id}`}
                                              {...drop}
                                              variant="minimal"
                                              intensity={intensity}
                                              streamColorHex={streamColorHex}
                                              zoomScale={zoomScale}
                                              onHoverStream={setHoveredStreamId}
                                              hoveredStreamId={hoveredStreamId}
                                              onHoverDrop={handleHoverDrop}
                                              selectedDropId={selectedDropId}
                                              onSelectDrop={setSelectedDropId}
                                              isMilestoneViolation={violatingDropIds.has(drop.id)}
                                              hasDependencies={(drop.dependsOn && drop.dependsOn.length > 0) || drops.some(d => d.dependsOn?.includes(drop.id))}
                                              isBlocked={drop.isBlocked}
                                              isReady={drop.isReady}
                                              ownerName={member.name}
                                            />
                                          );
                                        })}
                                      </AnimatePresence>
                                    </div>
                                  ) : (
                                    /* FOCUSED VIEW PLACEHOLDER (Actual sub-lanes are rendered below) */
                                    <div className="flex-1" />
                                  )}
                                </div>
                              </div>

                              {/* Focus Mode Sub-Lanes */}
                              <AnimatePresence>
                                {isFocused && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="border-x border-b border-slate-800/30 rounded-b-[40px] bg-slate-900/20 overflow-visible"
                                  >
                                    <div className="pl-16 relative py-4">
                                      {/* Hierarchy Line */}
                                      <div className="absolute left-10 top-0 bottom-10 w-px border-l border-dashed border-slate-700/50" />

                                      {Object.entries(dropsByStream).map(([streamId, streamDrops]) => {
                                        const stream = STAGING_STREAM_MAP[streamId];
                                        const streamColor = stream ? getStreamColor(stream.colorKey).hex : '#475569';

                                        return (
                                          <div
                                            key={streamId}
                                            className="relative flex items-center min-h-[85px] border-t border-slate-800/30 group/sublane"
                                            style={{ minWidth: (PROJECT_END_X * zoomScale) + 320 - 64 }}
                                          >
                                            {/* Sub-Header Horizontal connector */}
                                            <div className="absolute left-[-24px] top-1/2 w-6 border-t border-dashed border-slate-700/50" />

                                            <div
                                              className="shrink-0 flex items-center gap-3 px-8 py-4 border-r border-slate-800/30 sticky left-0 z-[55] bg-[#020617] shadow-[12px_0_35px_rgba(0,0,0,0.6)]"
                                              style={{ width: 320 - 64 }}
                                            >
                                              <div
                                                className="w-2 h-8 rounded-full"
                                                style={{ backgroundColor: streamColor }}
                                              />
                                              <div className="flex flex-col min-w-0">
                                                <span className="text-xs font-bold text-slate-100 truncate group-hover/sublane:text-white transition-colors">
                                                  {stream?.title || 'Unassigned'}
                                                </span>
                                                <span className="text-[9px] font-medium text-slate-500 uppercase tracking-tighter">
                                                  {streamDrops.length} Drops
                                                </span>
                                              </div>
                                            </div>

                                            <div className="flex-1 h-full relative">
                                              <div className="absolute inset-0 flex items-center">
                                                {streamDrops.map(drop => {
                                                  const streamDef = STAGING_STREAM_MAP[drop.streamId || ''];
                                                  const streamColorHex = streamDef ? getStreamColor(streamDef.colorKey).hex : '#64748b';
                                                  const isLateCriticalPath = criticalPathDropIds.has(drop.id) && violatingDropIds.has(drop.id);

                                                  return (
                                                    <Drop
                                                      key={drop.id}
                                                      {...drop}
                                                      ownerName={member.name}
                                                      streamColorHex={streamColorHex}
                                                      streamName={streamDef?.title}
                                                      ownerVelocity={memberVelocity[member.id]}
                                                      isMilestoneViolation={violatingDropIds.has(drop.id)}
                                                      isDraft={isSandboxActive && (sandboxSnapshot?.drops.find(d => d.id === drop.id)?.lane !== drop.lane || sandboxSnapshot?.drops.find(d => d.id === drop.id)?.xOffset !== drop.xOffset)}
                                                      references={drop.references}
                                                      onAction={handleDropAction}
                                                      onDragEnd={handleDragEnd}
                                                      zoomScale={zoomScale}
                                                      onHoverStream={setHoveredStreamId}
                                                      hoveredStreamId={hoveredStreamId}
                                                      onHoverDrop={handleHoverDrop}
                                                      selectedDropId={selectedDropId}
                                                      onSelectDrop={setSelectedDropId}
                                                      hasDependencies={(drop.dependsOn && drop.dependsOn.length > 0) || drops.some(d => d.dependsOn?.includes(drop.id))}
                                                      isBlocked={drop.isBlocked}
                                                      forceDimmed={false}
                                                      isCriticalPath={false}
                                                      isLateCriticalPath={false}
                                                      isReady={drop.isReady}
                                                      variant="full"
                                                      enableStreamHover={false}
                                                    />
                                                  );
                                                })}
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
                        })}
                    </AnimatePresence>
                  </div>
                ) : viewLevel === 'milestones' ? (
                  // ── MILESTONES VIEW ──
                  <div className="flex flex-col gap-0">
                    <AnimatePresence mode="popLayout">
                      {milestones
                        .filter(m => !focusedMilestoneId || m.id === focusedMilestoneId)
                        .map((milestone) => {
                          const milestoneDrops = drops.filter(d => d.milestoneId === milestone.id);
                          const maxDropEnd = Math.max(...milestoneDrops.map(d => dropRightEdge(d, 1)), 0);
                          const isViolated = maxDropEnd > milestone.xOffset;
                          const isExpanded = expandedMilestoneIds.has(milestone.id);
                          const isFocused = focusedMilestoneId === milestone.id;

                          // Get contributors to this milestone
                          const contributors = Array.from(new Set(milestoneDrops.map(d => d.lane)));

                          return (
                            <motion.div
                              key={milestone.id}
                              layout
                              initial={{ opacity: 0, y: 20, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95, transition: { duration: 0.3 } }}
                              className={cn(
                                "transition-all duration-700",
                                isFocused ? "border-2 border-cyan-500/30 bg-cyan-950/5 shadow-[0_0_40px_rgba(34,211,238,0.1)] p-1" : "border-b border-white/5"
                              )}
                              style={{ minWidth: (PROJECT_END_X * zoomScale) + currentSidebarWidth }}
                            >
                              <div className="flex items-center relative group">
                                {/* Milestone Sidebar */}
                                <div
                                  className={cn(
                                    "shrink-0 flex items-center gap-4 py-6 px-8 sticky left-0 z-[60] border-r border-[#0a192f]/50 bg-[#020617] transition-all duration-500",
                                    isFocused ? "shadow-[30px_0_60px_rgba(0,0,0,0.8)]" : "shadow-[15px_0_40px_rgba(0,0,0,0.7)]"
                                  )}
                                  style={{ width: currentSidebarWidth }}
                                >
                                  <div className="flex-1 min-w-0 flex flex-col gap-3">
                                    <div className="flex items-center justify-between group/title">
                                      <h3 className={cn(
                                        "font-bold transition-all truncate tracking-tight",
                                        isFocused ? "text-xl text-white" : "text-sm text-slate-100 group-hover/title:text-white",
                                        isViolated && !isFocused && "text-rose-400 animate-pulse"
                                      )}>
                                        {milestone.label}
                                      </h3>
                                      {!isFocused && (
                                        <button onClick={() => setEditingMilestoneId(milestone.id)} className="p-1 rounded-md opacity-0 group-hover/title:opacity-100 transition-all text-slate-500 hover:text-white hover:bg-slate-800 ml-2">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                        </button>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-900/50 px-2 py-1 rounded-md border border-white/5">
                                        T-Minus {Math.round(Math.max(0, milestone.xOffset - NOW_LINE_X) / 80)} Days
                                      </div>
                                      {isViolated && (
                                        <div className="text-[9px] font-bold text-rose-400 border border-rose-500/50 px-2 py-1 rounded bg-rose-500/10 whitespace-nowrap animate-pulse">
                                          Delay Risk
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Action button on far right */}
                                  <button
                                    onClick={(e) => toggleMilestoneExpand(milestone.id, e)}
                                    className={cn(
                                      'shrink-0 w-8 h-8 rounded-xl border border-white/10 flex items-center justify-center transition-all hover:bg-white/5',
                                      isExpanded ? 'bg-cyan-500 text-[#020617] border-cyan-400' : 'text-slate-500'
                                    )}
                                  >
                                    <ChevronDown className={cn('w-4 h-4 transition-transform duration-300', isExpanded && 'rotate-180')} />
                                  </button>
                                </div>

                                <div className="flex-1 h-full relative border-l border-slate-800/30 overflow-visible min-h-[100px] flex items-center">
                                  <div className="absolute inset-0 flex items-center">
                                    <AnimatePresence>
                                      {!isExpanded && milestoneDrops.map(drop => {
                                        // Calculate Overlap Intensity
                                        const dropWidth = getDropWidth(drop, zoomScale);
                                        const dropStart = drop.xOffset;
                                        const dropEnd = drop.xOffset + (dropWidth / zoomScale);

                                        const intensity = milestoneDrops.filter(other => {
                                          if (other.id === drop.id) return false;
                                          const otherWidth = getDropWidth(other, zoomScale);
                                          const otherStart = other.xOffset;
                                          const otherEnd = other.xOffset + (otherWidth / zoomScale);
                                          return dropStart < otherEnd && dropEnd > otherStart;
                                        }).length + 1;

                                        const streamDef = STAGING_STREAM_MAP[drop.streamId || ''];
                                        const owner = TEAM_MEMBERS[drop.lane]?.name || 'Unknown';
                                        const streamColorHex = streamDef ? getStreamColor(streamDef.colorKey).hex : '#64748b';

                                        const isLateCriticalPath = criticalPathDropIds.has(drop.id) && violatingDropIds.has(drop.id);

                                        return (
                                          <Drop
                                            key={drop.id}
                                            {...drop}
                                            ownerName={owner}
                                            intensity={intensity}
                                            streamInitials={streamDef?.initials}
                                            streamColorHex={streamColorHex}
                                            streamName={streamDef?.title}
                                            milestoneContribution={milestone.label}
                                            ownerVelocity={memberVelocity[TEAM_MEMBERS[drop.lane]?.id]}
                                            isMilestoneViolation={violatingDropIds.has(drop.id)}
                                            isDraft={isSandboxActive && (sandboxSnapshot?.drops.find(d => d.id === drop.id)?.lane !== drop.lane || sandboxSnapshot?.drops.find(d => d.id === drop.id)?.xOffset !== drop.xOffset)}
                                            references={drop.references}
                                            onAction={handleDropAction}
                                            onDragEnd={handleDragEnd}
                                            zoomScale={zoomScale}
                                            onHoverStream={setHoveredStreamId}
                                            hoveredStreamId={hoveredStreamId}
                                            onHoverDrop={handleHoverDrop}
                                            selectedDropId={selectedDropId}
                                            onSelectDrop={setSelectedDropId}
                                            hasDependencies={(drop.dependsOn && drop.dependsOn.length > 0) || drops.some(d => d.dependsOn?.includes(drop.id))}
                                            isBlocked={drop.isBlocked}
                                            forceDimmed={false}
                                            isCriticalPath={false}
                                            isLateCriticalPath={false}
                                            isReady={drop.isReady}
                                            variant="minimal"
                                          />
                                        );
                                      })}
                                    </AnimatePresence>
                                  </div>
                                </div>
                              </div>

                              {/* Expandable Sub-Lanes for Milestone */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className={cn(
                                      "border-x border-b border-slate-800/30 rounded-b-[40px] transition-all",
                                      isFocused ? "bg-slate-900/20" : "bg-slate-950/20"
                                    )}
                                  >
                                    <div className="pl-16 relative">
                                      {/* Hierarchy Line */}
                                      <div className="absolute left-10 top-0 bottom-10 w-px border-l border-dashed border-slate-700/50" />

                                      {contributors.map(laneIdx => {
                                        const member = TEAM_MEMBERS[laneIdx];
                                        const memberDrops = milestoneDrops.filter(d => d.lane === laneIdx);
                                        if (memberDrops.length === 0) return null;

                                        return (
                                          <div
                                            key={laneIdx}
                                            className="relative flex items-center min-h-[85px] border-t border-slate-800/30 group/sublane"
                                            style={{ minWidth: (PROJECT_END_X * zoomScale) + currentSidebarWidth - 64 }}
                                          >
                                            {/* Sub-Header Horizontal connector */}
                                            <div className="absolute left-[-24px] top-1/2 w-6 border-t border-dashed border-slate-700/50" />

                                            <div
                                              className="shrink-0 flex items-center gap-3 px-8 py-4 border-r border-slate-800/30 sticky left-0 z-[55] bg-[#020617] shadow-[12px_0_35px_rgba(0,0,0,0.6)]"
                                              style={{ width: currentSidebarWidth - 64 }}
                                            >
                                              <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700/50 flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover/sublane:border-cyan-500/50 transition-colors">
                                                {member.name.charAt(0)}
                                              </div>
                                              <span className="text-xs font-semibold text-slate-400 group-hover/sublane:text-white transition-colors whitespace-nowrap">
                                                {member.name}
                                              </span>
                                            </div>

                                            <div className="flex-1 h-full relative">
                                              <div className="absolute inset-0 flex items-center">
                                                {memberDrops.map(drop => {
                                                  const streamDef = STAGING_STREAM_MAP[drop.streamId || ''];
                                                  const streamColorHex = streamDef ? getStreamColor(streamDef.colorKey).hex : '#64748b';
                                                  const isLateCriticalPath = criticalPathDropIds.has(drop.id) && violatingDropIds.has(drop.id);

                                                  return (
                                                    <Drop
                                                      key={`${milestone.id}-${member.id}-${drop.id}`}
                                                      {...drop}
                                                      ownerName={member.name}
                                                      streamInitials={streamDef?.initials}
                                                      streamColorHex={streamColorHex}
                                                      streamName={streamDef?.title}
                                                      milestoneContribution={milestone.label}
                                                      ownerVelocity={memberVelocity[member.id]}
                                                      isMilestoneViolation={violatingDropIds.has(drop.id)}
                                                      isDraft={isSandboxActive && (sandboxSnapshot?.drops.find(d => d.id === drop.id)?.lane !== drop.lane || sandboxSnapshot?.drops.find(d => d.id === drop.id)?.xOffset !== drop.xOffset)}
                                                      references={drop.references}
                                                      onAction={handleDropAction}
                                                      onDragEnd={handleDragEnd}
                                                      zoomScale={zoomScale}
                                                      onHoverStream={setHoveredStreamId}
                                                      hoveredStreamId={hoveredStreamId}
                                                      onHoverDrop={handleHoverDrop}
                                                      selectedDropId={selectedDropId}
                                                      onSelectDrop={setSelectedDropId}
                                                      hasDependencies={(drop.dependsOn && drop.dependsOn.length > 0) || drops.some(d => d.dependsOn?.includes(drop.id))}
                                                      isBlocked={drop.isBlocked}
                                                      forceDimmed={false}
                                                      isCriticalPath={false}
                                                      isLateCriticalPath={false}
                                                      isReady={drop.isReady}
                                                      variant="full"
                                                    />
                                                  );
                                                })}
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
                        })}
                    </AnimatePresence>
                  </div>
                ) : (
                  // ── OVERVIEW (STREAMS) VIEW ──
                  <div className="flex flex-col gap-0">
                    <AnimatePresence mode="popLayout">
                      {[...STAGING_STREAMS]
                        .filter(s => !focusedStreamId || s.id === focusedStreamId)
                        .sort((a, b) => {
                          const minA = Math.min(...drops.filter(d => d.streamId === a.id).map(d => d.xOffset), Infinity);
                          const minB = Math.min(...drops.filter(d => d.streamId === b.id).map(d => d.xOffset), Infinity);
                          return minA - minB;
                        }).map((stream) => {
                          const stats = streamStats.find(s => s.id === stream.id)!;
                          const isExpanded = expandedStreamIds.has(stream.id);
                          const streamDef = STAGING_STREAM_MAP[stream.id];
                          const streamColor = getStreamColor(streamDef?.colorKey);
                          const isFocused = focusedStreamId === stream.id;

                          return (
                            <motion.div
                              key={stream.id}
                              layout
                              initial={{ opacity: 0, y: 20, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95, transition: { duration: 0.3 } }}
                              className={cn(
                                "transition-all duration-700",
                                isFocused ? "border-2 border-cyan-500/30 bg-cyan-950/5 shadow-[0_0_40px_rgba(34,211,238,0.1)] p-1" : "border-b border-white/5"
                              )}
                              style={{ minWidth: (PROJECT_END_X * zoomScale) + currentSidebarWidth }}
                              data-stream-id={stream.id}
                            >
                              {/* Stream Header Row */}
                              <div className="flex items-center relative group">
                                {/* Stream Sidebar */}
                                <div
                                  className={cn(
                                    "shrink-0 flex items-center gap-4 py-6 px-8 sticky left-0 z-[60] border-r border-[#0a192f]/50 bg-[#020617] transition-all duration-500",
                                    isFocused ? "shadow-[30px_0_60px_rgba(0,0,0,0.8)]" : "shadow-[15px_0_40px_rgba(0,0,0,0.7)]"
                                  )}
                                  style={{ width: currentSidebarWidth }}
                                >
                                  {/* Stream Content Stack */}
                                  <div className="flex-1 min-w-0 flex flex-col gap-3">
                                    {/* Top Line: Name and Focus Controls */}
                                    <div className="flex-1 flex items-center gap-3 group/title">
                                      <h3 className={cn(
                                        "flex-1 font-bold transition-all truncate tracking-tight",
                                        isFocused ? "text-xl text-white" : "text-sm text-slate-100 group-hover/title:text-white"
                                      )}>
                                        {stream.title}
                                      </h3>

                                      {!isFocused && (
                                        <button
                                          onClick={() => setSelectedStreamDependencyId(selectedStreamDependencyId === stream.id ? null : stream.id)}
                                          className={cn("p-1 rounded-md opacity-0 group-hover/title:opacity-100 transition-all ml-1",
                                            selectedStreamDependencyId === stream.id ? "opacity-100 bg-sky-900/40 text-cyan-400" : "text-slate-500 hover:text-slate-300 hover:bg-slate-800")}
                                        >
                                          <Link className="w-3.5 h-3.5" />
                                        </button>
                                      )}

                                      {stats.hasBlocker && (
                                        <div className="shrink-0 animate-pulse ml-2">
                                          <AlertTriangle className="w-4 h-4 text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.4)]" />
                                        </div>
                                      )}
                                    </div>

                                    {/* Metadata expansion for Focus Mode */}
                                    {isFocused && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="flex flex-col gap-3 py-1"
                                      >
                                        <div className="flex items-center gap-4 text-[10px] font-bold tracking-[0.1em] uppercase">
                                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-700/50 text-slate-400">
                                            <span className="text-slate-500">PRIORITY</span>
                                            <span className={cn(
                                              stream.priority === 'High' ? 'text-rose-400' :
                                                stream.priority === 'Medium-High' ? 'text-amber-400' : 'text-blue-400'
                                            )}>{stream.priority}</span>
                                          </div>
                                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-700/50 text-slate-400">
                                            <span className="text-slate-500">CMPX</span>
                                            <span className="text-indigo-400">{stream.complexity}/10</span>
                                          </div>
                                        </div>
                                      </motion.div>
                                    )}

                                    {/* Bottom Line: Progress Bar */}
                                    <div className="flex items-center gap-4">
                                      <div
                                        className="h-7 w-10 shrink-0 rounded-lg flex items-center justify-center font-black text-[10px] shadow-sm border relative"
                                        style={{
                                          backgroundColor: `${streamColor.hex}15`,
                                          borderColor: `${streamColor.hex}40`,
                                          color: streamColor.hex
                                        }}
                                      >
                                        {stream.initials}
                                      </div>

                                      <div className="flex-1 flex items-center gap-3">
                                        <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                                          <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${stats.percent}%` }}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: streamColor.hex, boxShadow: `0 0 15px ${streamColor.hex}60` }}
                                          />
                                        </div>
                                        <span className="text-xs font-black text-slate-400 tabular-nums">{stats.percent}%</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Action button on the far right of sidebar */}
                                  <button
                                    onClick={() => toggleStreamExpand(stream.id)}
                                    className={cn(
                                      'shrink-0 w-8 h-8 rounded-xl border border-white/10 flex items-center justify-center transition-all hover:bg-white/5',
                                      isExpanded ? 'bg-cyan-500 text-[#020617] border-cyan-400' : 'text-slate-500'
                                    )}
                                  >
                                    <ChevronDown className={cn('w-4 h-4 transition-transform duration-300', isExpanded && 'rotate-180')} />
                                  </button>
                                </div>

                                {/* Timeline Area (Collapsed View) */}
                                <div className="flex-1 h-full relative border-l border-slate-800/30 overflow-visible min-h-[100px] flex items-center">
                                  <div className="absolute inset-0 flex items-center">
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
                                            onHoverDrop={handleHoverDrop}
                                            selectedDropId={selectedDropId}
                                            onSelectDrop={setSelectedDropId}
                                            hasDependencies={(drop.dependsOn && drop.dependsOn.length > 0) || drops.some(d => d.dependsOn?.includes(drop.id))}
                                            isBlocked={drop.isBlocked}
                                            forceDimmed={false}
                                            isCriticalPath={false}
                                            isReady={drop.isReady}
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
                                    className={cn(
                                      "border-x border-b border-slate-800/30 rounded-b-[40px] transition-all",
                                      isFocused ? "bg-slate-900/20" : "bg-slate-950/20"
                                    )}
                                  >
                                    <div className="pl-16 relative">
                                      {/* Hierarchy Line */}
                                      <div className="absolute left-10 top-0 bottom-10 w-px border-l border-dashed border-slate-700/50" />

                                      {stats.contributors.map(laneIdx => {
                                        const member = TEAM_MEMBERS[laneIdx];
                                        const memberDrops = stats.drops.filter(d => d.lane === laneIdx);
                                        if (memberDrops.length === 0) return null;

                                        return (
                                          <div
                                            key={laneIdx}
                                            className="relative flex items-center min-h-[85px] border-t border-slate-800/30 group/sublane"
                                            style={{ minWidth: (PROJECT_END_X * zoomScale) + currentSidebarWidth - 64 }}
                                          >
                                            {/* Sub-Header Horizontal connector */}
                                            <div className="absolute left-[-24px] top-1/2 w-6 border-t border-dashed border-slate-700/50" />

                                            <div
                                              className="shrink-0 flex items-center gap-3 px-8 py-4 border-r border-slate-800/30 sticky left-0 z-[55] bg-[#020617] shadow-[12px_0_35px_rgba(0,0,0,0.6)]"
                                              style={{ width: currentSidebarWidth - 64 }}
                                            >
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
                                                    streamColorHex={streamColor.hex}
                                                    isMilestoneViolation={violatingDropIds.has(drop.id)}
                                                    isDraft={isSandboxActive && (sandboxSnapshot?.drops.find(d => d.id === drop.id)?.lane !== drop.lane || sandboxSnapshot?.drops.find(d => d.id === drop.id)?.xOffset !== drop.xOffset)}
                                                    references={drop.references}
                                                    onAction={handleDropAction}
                                                    onDragEnd={handleDragEnd}
                                                    zoomScale={zoomScale}
                                                    onHoverStream={setHoveredStreamId}
                                                    hoveredStreamId={hoveredStreamId}
                                                    onHoverDrop={handleHoverDrop}
                                                    selectedDropId={selectedDropId}
                                                    onSelectDrop={setSelectedDropId}
                                                    hasDependencies={(drop.dependsOn && drop.dependsOn.length > 0) || drops.some(d => d.dependsOn?.includes(drop.id))}
                                                    isBlocked={drop.isBlocked}
                                                    variant="full"
                                                    enableStreamHover={false}
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
                        })}
                    </AnimatePresence>
                  </div>
                )}
              </div>
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

      <AnimatePresence>
        {editingMilestoneId && (
          <MilestoneEditDrawer
            milestoneId={editingMilestoneId}
            milestones={milestones}
            setMilestones={setMilestones}
            drops={drops}
            setDrops={setDrops}
            onClose={() => setEditingMilestoneId(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function MilestoneEditDrawer({
  milestoneId,
  milestones,
  setMilestones,
  drops,
  setDrops,
  onClose
}: {
  milestoneId: string;
  milestones: Milestone[];
  setMilestones: React.Dispatch<React.SetStateAction<Milestone[]>>;
  drops: DropData[];
  setDrops: React.Dispatch<React.SetStateAction<DropData[]>>;
  onClose: () => void;
}) {
  const milestone = milestones.find(m => m.id === milestoneId);
  if (!milestone) return null;

  return (
    <motion.div
      initial={{ x: 400 }}
      animate={{ x: 0 }}
      exit={{ x: 400 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-16 bottom-0 right-0 w-96 bg-[#020617] border-l border-white/10 shadow-2xl z-[140] flex flex-col pointer-events-auto"
    >
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Edit Milestone</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2 -mr-2">
          <Plus className="w-5 h-5 rotate-45" />
        </button>
      </div>
      <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-8 custom-scrollbar">
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Milestone Name</label>
          <input
            type="text"
            value={milestone.label}
            onChange={(e) => setMilestones(prev => prev.map(m => m.id === milestone.id ? { ...m, label: e.target.value } : m))}
            className="w-full bg-[#0a192f] border border-white/10 rounded-lg px-4 py-2.5 text-slate-100 outline-none focus:border-cyan-500 transition-colors text-sm font-medium"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Target Sequence (X Offset)</label>
          <input
            type="number"
            value={milestone.xOffset}
            onChange={(e) => setMilestones(prev => prev.map(m => m.id === milestone.id ? { ...m, xOffset: Number(e.target.value) } : m))}
            className="w-full bg-[#0a192f] border border-white/10 rounded-lg px-4 py-2.5 text-slate-100 outline-none focus:border-cyan-500 transition-colors text-sm font-medium tabular-nums"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 block">Bundled Work</label>
          <div className="flex flex-col gap-4">
            {STAGING_STREAMS.map(stream => {
              const streamDrops = drops.filter(d => d.streamId === stream.id);
              if (streamDrops.length === 0) return null;

              const assignedCount = streamDrops.filter(d => d.milestoneId === milestone.id).length;

              return (
                <div key={stream.id} className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold text-slate-300">{stream.title}</h4>
                    <span className="text-[10px] font-black text-slate-500 bg-black/50 px-2 py-0.5 rounded">{assignedCount} Assigned</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {streamDrops.map(drop => {
                      const isAssigned = drop.milestoneId === milestone.id;
                      return (
                        <label key={drop.id} className="flex items-start gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setDrops(prev => prev.map(d => d.id === drop.id ? { ...d, milestoneId: checked ? milestone.id : undefined } : d));
                            }}
                            className="mt-0.5 accent-cyan-500 scale-110"
                          />
                          <span className={cn("text-xs leading-snug transition-colors pt-0.5", isAssigned ? "text-slate-200 font-medium" : "text-slate-500 group-hover:text-slate-400")}>{drop.title}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
