'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { STAGING_DROPS, STAGING_STREAMS } from '@/lib/stagingData';
import { getStreamColor } from '@/lib/streams';
import { CheckCircle2, AlertOctagon, Send, PlayCircle, XCircle, Clock, Check, AlertCircle, ArrowUpRight, ArrowDownRight, TrendingUp, Zap, Layers, Target, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

// We mock the user as owner_id = "1" (Sarah) for Team Member view
const MY_USER_ID = "1";
const DAY_WIDTH = 80;
const NOW_LINE_BASE = 2000; // Large logical base to allow scrolling left and right

type HandshakeState = 'PENDING' | 'ACTIVE' | 'RATIONALE' | 'COMPLETED';

interface FlowDrop {
  drop_id: string;
  title: string;
  tasks: string[];
  estimated_time: number;
  complexity?: number;
  streamId: string | undefined;
  xOffset: number; // Logical x position
  width: number;
  state: HandshakeState;
}

function AlertBanner() {
  return (
    <div className="mx-8 mt-6">
      <div className="relative overflow-hidden rounded-xl border border-rose-500/20 bg-rose-950/10 p-3 backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 via-transparent to-transparent" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <AlertCircle className="h-5 w-5 text-rose-500" />
              <div className="absolute inset-0 animate-ping rounded-full bg-rose-500/40" />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Attention Required</span>
              <div className="h-4 w-[1px] bg-rose-500/20" />
              <p className="text-sm text-rose-100/80">
                <span className="font-mono font-bold text-rose-400">DROP-1284:</span> OAuth2 token refresh logic - <span className="font-bold">Delayed 5d</span>
              </p>
            </div>
          </div>
          <button className="text-[10px] font-bold uppercase tracking-widest text-rose-400/60 hover:text-rose-400 transition-colors">
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}

function MicroKPICard({ title, value, subtext, icon: Icon, trend, trendDirection = 'up', color = "teal" }: { 
  title: string, 
  value: string | number, 
  subtext?: string, 
  icon: React.ComponentType<{ className?: string }>, 
  trend?: string,
  trendDirection?: 'up' | 'down',
  color?: "teal" | "amber" 
}) {
  const isTeal = color === "teal";
  const accentColor = isTeal ? "text-[#10B981]" : "text-amber-500";
  const bgColor = isTeal ? "bg-[#10B981]/5" : "bg-amber-500/5";
  const borderColor = isTeal ? "border-[#10B981]/20" : "border-amber-500/20";
  const iconColor = isTeal ? "text-[#10B981]/60" : "text-amber-500/60";

  return (
    <div className={cn("relative overflow-hidden rounded-2xl border p-4 backdrop-blur-xl transition-all hover:border-white/10", bgColor, borderColor)}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">{title}</p>
        <div className={cn("rounded-lg bg-white/5 p-1.5", iconColor)}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      
      <div className="flex items-baseline gap-2 overflow-hidden">
        <h3 className={cn("text-xl font-bold tracking-tight shrink-0", accentColor)}>{value}</h3>
        <div className="flex items-center gap-1.5 min-w-0">
          {trend && (
            <div className={cn("flex items-center text-[10px] font-bold shrink-0", trendDirection === 'up' ? "text-[#10B981]" : "text-amber-500")}>
              {trendDirection === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {trend}
            </div>
          )}
          {subtext && <p className="text-[10px] text-slate-500 font-medium truncate">{subtext}</p>}
        </div>
      </div>

      {/* Decorative gradient */}
      <div className={cn("absolute -bottom-4 -right-4 h-16 w-16 opacity-10 blur-2xl", isTeal ? "bg-[#10B981]" : "bg-amber-500")} />
    </div>
  );
}

export function MyFlowDashboard() {
  const [drops, setDrops] = useState<FlowDrop[]>([]);
  const [rationaleText, setRationaleText] = useState("");
  const [selectedDropId, setSelectedDropId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Initialize Data
  useEffect(() => {
    // Only run once on mount
    const myStagingDrops = STAGING_DROPS.filter(d => d.owner_id === MY_USER_ID);

    // Separate completed and upcoming to calculate initial positions correctly around NOW
    const completedDrops = myStagingDrops.filter(d => d.status === 'Completed');
    const upcomingDrops = myStagingDrops.filter(d => d.status !== 'Completed');

    const initialFlowDrops: FlowDrop[] = [];

    // Layout completed drops working backwards from NOW_LINE_BASE
    let currentXCompleted = NOW_LINE_BASE - 24;
    for (let i = completedDrops.length - 1; i >= 0; i--) {
      const d = completedDrops[i];
      const streamInfo = STAGING_STREAMS.find(s => s.drops.some(sd => sd.drop_id === d.drop_id));
      const width = Math.max(120, d.estimated_time * 20);

      currentXCompleted -= width;

        initialFlowDrops.unshift({
        drop_id: d.drop_id,
        title: d.title,
        tasks: d.tasks || [],
        estimated_time: d.estimated_time,
        complexity: d.complexity || 3,
        streamId: streamInfo?.id,
        xOffset: currentXCompleted,
        width,
        state: 'COMPLETED',
      });

      currentXCompleted -= 24; // gap
    }

    // Layout upcoming drops working forwards from NOW_LINE_BASE
    let currentXUpcoming = NOW_LINE_BASE;
    let foundActive = false;

    for (const d of upcomingDrops) {
      const streamInfo = STAGING_STREAMS.find(s => s.drops.some(sd => sd.drop_id === d.drop_id));
      const width = Math.max(120, d.estimated_time * 20);

      let state: HandshakeState = 'PENDING';
      if (!foundActive) {
        state = (d.status === 'Active' || d.status === 'In Progress') ? 'ACTIVE' : 'PENDING';
        foundActive = true;
      }

      initialFlowDrops.push({
        drop_id: d.drop_id,
        title: d.title,
        tasks: d.tasks || [],
        estimated_time: d.estimated_time,
        complexity: d.complexity || 3,
        streamId: streamInfo?.id,
        xOffset: currentXUpcoming,
        width,
        state,
      });

      currentXUpcoming += width + 24;
    }

    setDrops(initialFlowDrops);

    // Set initial selected drop to the first non-completed one
    const firstActive = initialFlowDrops.find(d => d.state !== 'COMPLETED');
    if (firstActive) {
      setSelectedDropId(firstActive.drop_id);
    }

  }, []);

  // Auto-Center Timeline on Mount and Updates
  useEffect(() => {
    if (scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.clientWidth;
      // Center the NOW_LINE_BASE exactly to the middle of the screen
      const targetScroll = NOW_LINE_BASE - (containerWidth / 2);
      scrollContainerRef.current.scrollTo({ left: Math.max(0, targetScroll), behavior: 'smooth' });
    }
  }, [drops.length]);

  const activeDropIndex = drops.findIndex(d => d.drop_id === selectedDropId);
  const activeDrop = activeDropIndex !== -1 ? drops[activeDropIndex] : null;

  const isPendingBlur = activeDrop?.state === 'PENDING';

  // --- Handshake Actions ---

  const handleAccept = () => {
    if (!activeDrop) return;
    setDrops(prev => {
      const next = [...prev];
      next[activeDropIndex] = { ...activeDrop, state: 'ACTIVE' };
      return next;
    });
  };

  const handleReject = () => {
    if (!activeDrop) return;
    setDrops(prev => {
      const next = [...prev];
      next[activeDropIndex] = { ...activeDrop, state: 'RATIONALE' };
      return next;
    });
  };

  const handleFlagBlocker = () => {
    if (!activeDrop) return;
    setDrops(prev => {
      const next = [...prev];
      next[activeDropIndex] = { ...activeDrop, state: 'RATIONALE' };
      return next;
    });
  };

  const handleComplete = () => {
    if (!activeDrop) return;

    setDrops(prev => {
      const next = [...prev];
      const completedDrop = { ...activeDrop, state: 'COMPLETED' as HandshakeState };

      // We want to slide all drops that are strictly to the right of this completed drop to the left
      const shiftAmount = completedDrop.width + 24;

      for (let i = 0; i < next.length; i++) {
        if (i === activeDropIndex) {
          next[i] = completedDrop;
        } else if (next[i].xOffset > completedDrop.xOffset) {
          // Slide left by the width of the drop we just completed
          next[i] = { ...next[i], xOffset: next[i].xOffset - shiftAmount };
        }
      }

      // Automatically select the next uncompleted drop in logical timeline order
      // (The drop with the lowest xOffset that is > 0 and >= NOW_LINE_BASE isn't necessarily correct if we just shift them,
      // but finding the first non-completed by array order usually works since they were sorted)
      const nextActiveIndex = next.findIndex(d => d.state !== 'COMPLETED');
      if (nextActiveIndex !== -1) {
        setSelectedDropId(next[nextActiveIndex].drop_id);
      } else {
        setSelectedDropId(null);
      }

      return next;
    });
  };

  const handleSubmitRationale = () => {
    if (rationaleText.length < 10 || !activeDrop) return;
    setRationaleText("");

    // Revert to PENDING after rationale submission
    setDrops(prev => {
      const next = [...prev];
      next[activeDropIndex] = { ...activeDrop, state: 'PENDING' };
      return next;
    });
  };

  // -------------------------

  const streamInfo = activeDrop ? STAGING_STREAMS.find(s => s.id === activeDrop.streamId) : null;
  const sColor = getStreamColor(streamInfo?.colorKey);

  // Use the exact grid style logic for timeline length
  const TOTAL_GRID_WIDTH = 4000;

  const completedDrops = drops.filter(d => d.state === 'COMPLETED');
  const complexityHandled = completedDrops.reduce((acc, d) => acc + (d.complexity || 0), 0) || 18;

  return (
    <div className="flex flex-col h-full w-full bg-[#020617] relative overflow-hidden no-scrollbar">
      {/* Header */}
      <div className="sticky top-0 z-[120] bg-[#020617]/95 backdrop-blur-md px-8 pt-8 pb-6 border-b border-white/5 flex items-center justify-between">
        <h1 className="text-3xl font-bold font-sans tracking-tight text-slate-100 flex items-center gap-3">
          My Flow
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Task 1: Alert Banner */}
        <AlertBanner />

        {/* Task 2: Vitals Grid */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-4 gap-4 px-8 mt-6"
        >
          <MicroKPICard 
            title="Acceptance Rate" 
            value="87%" 
            icon={Target} 
            trend="5%"
            trendDirection="up"
          />
          <MicroKPICard 
            title="Personal Velocity" 
            value="1.2d" 
            subtext="Avg cycle time" 
            icon={TrendingUp} 
            trend="0.2" 
            trendDirection="down"
            color="amber"
          />
          <MicroKPICard 
            title="Drops Remaining" 
            value="3" 
            subtext="1 Active • 1 Delayed • 1 Upcoming" 
            icon={Layers} 
            color="amber"
          />
          <MicroKPICard 
            title="Drops Completed" 
            value="2" 
            subtext="This sprint" 
            icon={CheckCircle2} 
          />
          <MicroKPICard 
            title="Complexity Handled" 
            value={`${complexityHandled} pts`} 
            subtext="Total technical weight" 
            icon={Zap} 
          />
          <MicroKPICard 
            title="Critical Issues Solved" 
            value="4" 
            subtext="High-impact fixes" 
            icon={AlertOctagon} 
          />
          <MicroKPICard 
            title="High-Priority Drops" 
            value="3 / 5" 
            subtext="SLA Alignment" 
            icon={Activity} 
            color="amber"
          />
          <MicroKPICard 
            title="Dependency Resolution" 
            value="92%" 
            subtext="Blocker clearing rate" 
            icon={TrendingUp} 
          />
        </motion.div>
      {/* Background ambient glow based on stream color */}
      {activeDrop && (
        <div
          className={cn("absolute inset-0 opacity-10 pointer-events-none transition-all duration-1000", isPendingBlur ? "opacity-5" : "opacity-15")}
          style={{ background: `radial-gradient(circle at 50% 50%, ${sColor.hex}, transparent 60%)` }}
        />
      )}

      {/* --- TIMELINE HEADER (Personal Swimlane) --- */}
      <div className={cn("relative w-full h-44 mt-8 border-y border-white/5 bg-[#0a192f]/40 transition-all duration-700 z-10", isPendingBlur ? "blur-sm opacity-50" : "blur-0 opacity-100")}>

        <div
          ref={scrollContainerRef}
          className="w-full h-full overflow-x-auto relative z-10 no-scrollbar"
        >
          {/* Container extending scrollable area */}
          <div style={{ width: TOTAL_GRID_WIDTH, height: '100%' }} className="relative pt-10">

            {/* TimeAxis Labels (Simplified) */}
            <div className="absolute top-0 left-0 right-0 h-10 border-b border-white/5 bg-[#020617]/80 backdrop-blur-md pointer-events-none z-[110]">
              {Array.from({ length: TOTAL_GRID_WIDTH / DAY_WIDTH }).map((_, i) => {
                const dayOffset = i - (NOW_LINE_BASE / DAY_WIDTH);
                // Just mock dates relative to "today"
                const date = new Date();
                date.setDate(date.getDate() + dayOffset);
                return (
                  <div key={i} className="absolute top-0 bottom-0 border-l border-white/5" style={{ left: i * DAY_WIDTH }}>
                    <div className="flex flex-col justify-end h-full pb-2 px-1">
                      <span className="text-[9px] font-bold tracking-widest uppercase text-slate-400 whitespace-nowrap">
                        {date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bioluminescent Grid */}
            <div className="absolute top-10 bottom-0 left-0 right-0 pointer-events-none z-0 overflow-hidden">
              {Array.from({ length: TOTAL_GRID_WIDTH / DAY_WIDTH }).map((_, i) => {
                const dayOffset = i - (NOW_LINE_BASE / DAY_WIDTH);
                const date = new Date();
                date.setDate(date.getDate() + dayOffset);
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                return (
                  <React.Fragment key={i}>
                    <div className="absolute top-0 bottom-0 border-l border-white/[0.02]" style={{ left: i * DAY_WIDTH }} />
                    {isWeekend && (
                      <div className="absolute top-0 bottom-0 bg-black/20 backdrop-brightness-75" style={{ left: i * DAY_WIDTH, width: DAY_WIDTH }}>
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_#0ea5e9_1px,_transparent_1px)] bg-[size:12px_12px]" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* NOW LINE (PulseDashboard styling) */}
            <div
              className="absolute top-10 bottom-0 w-[2px] bg-gradient-to-b from-cyan-400/0 via-cyan-400 to-cyan-400/0 z-[120]
                       animate-time-pulse pointer-events-none
                       before:absolute before:content-[''] before:left-1/2 before:-translate-x-1/2 before:-top-3
                       before:w-3.5 before:h-3.5 before:bg-cyan-400 before:rounded-full before:shadow-[0_0_10px_rgba(34,211,238,1)]
                       after:content-['NOW'] after:absolute after:-top-8 after:left-1/2 after:-translate-x-1/2
                       after:text-cyan-400 after:text-xs after:font-bold after:tracking-widest"
              style={{ left: NOW_LINE_BASE }}
            >
            </div>

            {/* Drops on Timeline */}
            {drops.map((drop) => {
              const sInfo = STAGING_STREAMS.find(s => s.id === drop.streamId);
              const c = getStreamColor(sInfo?.colorKey);
              const isCompleted = drop.state === 'COMPLETED';
              const isSelected = drop.drop_id === selectedDropId;
              const isGhost = drop.state === 'PENDING' || drop.state === 'RATIONALE' || (!isCompleted && drop.state !== 'ACTIVE');

              // PulseDashboard matching aesthetics
              const dropBg = isCompleted ? '#0f172a' : (isGhost ? 'transparent' : `${c.hex}20`);
              const dropBorder = isCompleted ? `1px solid rgba(255,255,255,0.1)` : (isGhost ? `1px dashed ${c.hex}50` : `1px solid ${c.hex}80`);

              return (
                <motion.div
                  key={drop.drop_id}
                  layout
                  initial={false}
                  animate={{ x: drop.xOffset, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  onClick={() => setSelectedDropId(drop.drop_id)}
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 h-14 rounded-xl flex flex-col justify-center shadow-md overflow-hidden transition-all duration-300 cursor-pointer",
                    isCompleted ? "opacity-60 hover:opacity-80" : "",
                    isGhost ? "hover:bg-white/[0.02]" : "",
                    isSelected && drop.state === 'ACTIVE' ? "shadow-[0_0_20px_rgba(34,211,238,0.3)] ring-2 ring-cyan-500/50" : "",
                    isSelected && drop.state === 'PENDING' ? "animate-pulse ring-2 ring-cyan-500/30" : ""
                  )}
                  style={{
                    width: drop.width,
                    backgroundColor: dropBg,
                    border: dropBorder,
                    marginTop: '20px' // offset from the TimeAxis
                  }}
                >
                  {/* Identity Notch */}
                  <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: c.hex, opacity: isGhost ? 0.5 : (isCompleted ? 0.4 : 1) }} />

                  <div className="truncate px-4 w-full relative">
                    <div className="flex justify-between items-center mb-0.5">
                      <p className="text-[9px] font-bold opacity-70 uppercase tracking-wider" style={{ color: c.hex }}>
                        {sInfo?.initials || 'UNK'}
                      </p>
                      {/* Estimated Hours Badge */}
                      <div className="flex items-center gap-0.5 text-[9px] font-bold text-slate-400 bg-black/40 px-1.5 py-0.5 rounded">
                        <Clock className="w-2.5 h-2.5" />
                        {drop.estimated_time}h
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCompleted && <Check className="w-3.5 h-3.5 text-white/40 shrink-0" />}
                      <p className={cn("text-xs font-semibold truncate", isCompleted ? "text-white/40" : "text-slate-200")}>
                        {drop.title}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- HERO DROP CARD (COCKPIT) --- */}
      <div className="flex-1 flex items-center justify-center relative z-20 p-8">

        {/* Full-screen Focus Blur Overlay (underneath the Hero Card but over the rest) */}
        {activeDrop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setSelectedDropId(null)}
            className={cn(
              "absolute inset-0 -z-10 cursor-pointer",
              isPendingBlur ? "bg-[#020617]/40 backdrop-blur-md" : "bg-transparent"
            )}
          />
        )}

        {activeDrop ? (
          <motion.div
            key={activeDrop.drop_id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={cn(
              "w-full max-w-3xl bg-[#0a192f]/80 backdrop-blur-2xl border rounded-3xl overflow-hidden shadow-2xl relative transition-all duration-500",
              activeDrop.state === 'PENDING' ? "border-cyan-500/50 shadow-[0_0_50px_rgba(34,211,238,0.15)]" :
                activeDrop.state === 'RATIONALE' ? "border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.15)]" :
                  "border-white/10 hover:border-white/20"
            )}
          >
            {/* Identity Notch on Hero Card */}
            <div className="absolute left-0 top-0 bottom-0 w-2" style={{ backgroundColor: sColor.hex }} />

            {/* Card Header */}
            <div className="px-10 py-8 border-b border-white/5 relative">

              {/* Close button for card */}
              <button
                onClick={() => setSelectedDropId(null)}
                className="absolute top-6 right-6 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/40 border border-white/10" style={{ color: sColor.hex }}>
                  {streamInfo?.initials || 'STR'}
                </span>
                <span className="text-slate-500 text-xs font-mono">{activeDrop.drop_id}</span>

                {/* Estimated Time Badge */}
                <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded-md border border-slate-700">
                  <Clock className="w-3 h-3" />
                  {activeDrop.estimated_time}h
                </span>

                {activeDrop.state === 'PENDING' && (
                  <span className={cn("ml-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-xs font-bold text-rose-400 uppercase tracking-wider", activeDrop.drop_id === drops.find(d => d.state !== 'COMPLETED')?.drop_id ? "animate-pulse" : "")}>
                    Action Required
                  </span>
                )}
                {activeDrop.state === 'ACTIVE' && (
                  <span className="ml-2 flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    In Progress
                  </span>
                )}
                {activeDrop.state === 'COMPLETED' && (
                  <span className="ml-2 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Check className="w-3 h-3 text-slate-500" />
                    Completed
                  </span>
                )}
              </div>
              <h2 className={cn("font-bold text-slate-100", activeDrop.drop_id !== drops.find(d => d.state !== 'COMPLETED')?.drop_id ? "text-2xl pr-12" : "text-3xl")}>
                {activeDrop.title}
              </h2>
            </div>

            {/* Card Body - Stateful Rendering */}
            <div className="p-10 min-h-[300px] flex flex-col justify-center">
              <AnimatePresence mode="wait">

                {/* STATE: PENDING */}
                {activeDrop.state === 'PENDING' && (
                  <motion.div
                    key="pending"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col items-center text-center space-y-8"
                  >
                    <div className="w-full text-left">
                      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Proposed Scope</h3>
                      <div className="space-y-3 bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                        {activeDrop.tasks.map((task, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-cyan-500/50 shrink-0" />
                            <span className="text-slate-300 text-sm leading-relaxed">{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <p className="text-slate-400 text-sm max-w-lg">
                      Please review the proposed scope above. Accept the drop to commit to these requirements and begin execution, or reject if you lack necessary dependencies.
                    </p>

                    <div className="flex gap-4 w-full max-w-md">
                      <button
                        onClick={handleReject}
                        className="flex-1 px-8 py-4 rounded-full bg-slate-800/50 hover:bg-rose-500/10 border border-slate-700 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 font-bold flex items-center justify-center gap-2 transition-all"
                      >
                        <XCircle className="w-5 h-5" />
                        Reject Drop
                      </button>
                      <button
                        onClick={handleAccept}
                        className="flex-[2] py-4 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                      >
                        <PlayCircle className="w-5 h-5" />
                        Accept Drop
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STATE: ACTIVE & COMPLETED */}
                {(activeDrop.state === 'ACTIVE' || activeDrop.state === 'COMPLETED') && (
                  <motion.div
                    key="active"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col h-full"
                  >
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Execution Checklist</h3>
                    <div className="flex-1 space-y-3 overflow-y-auto pr-2 max-h-[200px]">
                      {activeDrop.tasks.map((task, idx) => (
                        <label key={idx} className={cn("flex items-start gap-3 p-3 rounded-xl transition-colors group", activeDrop.state === 'COMPLETED' ? "opacity-60 cursor-default" : "hover:bg-white/5 cursor-pointer")}>
                          <div className={cn("mt-0.5 relative flex items-center justify-center w-5 h-5 rounded border shrink-0 transition-colors", activeDrop.state === 'COMPLETED' ? "border-cyan-500 bg-cyan-500/20" : "border-slate-600 group-hover:border-cyan-500")}>
                            {activeDrop.state !== 'COMPLETED' && <input type="checkbox" className="opacity-0 absolute inset-0 cursor-pointer peer" />}
                            <CheckCircle2 className={cn("w-3 h-3 transition-opacity", activeDrop.state === 'COMPLETED' ? "text-cyan-400 opacity-100" : "text-cyan-400 opacity-0 peer-checked:opacity-100")} />
                          </div>
                          <span className={cn("transition-colors leading-snug", activeDrop.state === 'COMPLETED' ? "text-slate-400 line-through" : "text-slate-300 group-hover:text-slate-200")}>{task}</span>
                        </label>
                      ))}
                    </div>

                    {activeDrop.state === 'ACTIVE' && (
                      <div className="mt-8 flex gap-4 pt-6 border-t border-white/5">
                        <button
                          onClick={handleComplete}
                          className="flex-[2] py-4 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(34,211,238,0.1)] hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          Mark Completed
                        </button>
                        <button
                          onClick={handleFlagBlocker}
                          className="flex-1 px-8 py-4 rounded-full bg-slate-800/50 hover:bg-amber-500/10 border border-slate-700 hover:border-amber-500/30 text-slate-400 hover:text-amber-400 font-bold flex items-center justify-center gap-2 transition-all"
                        >
                          <AlertOctagon className="w-5 h-5" />
                          Flag Blocker
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* STATE: RATIONALE */}
                {activeDrop.state === 'RATIONALE' && (
                  <motion.div
                    key="rationale"
                    initial={{ opacity: 0, rotateX: 90 }}
                    animate={{ opacity: 1, rotateX: 0 }}
                    exit={{ opacity: 0, rotateX: -90 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col h-full"
                  >
                    <div className="flex items-center gap-3 text-rose-400 mb-4">
                      <AlertOctagon className="w-6 h-6" />
                      <h3 className="text-xl font-medium">Feedback Loop</h3>
                    </div>
                    <p className="text-slate-400 mb-6">
                      Please provide the rationale for rejecting or blocking this drop. This feedback will be ingested by the system to re-level the project topology.
                    </p>
                    <textarea
                      autoFocus
                      value={rationaleText}
                      onChange={(e) => setRationaleText(e.target.value)}
                      placeholder="E.g., Missing DB access credentials, unexpected schema conflict..."
                      className="flex-1 w-full bg-slate-900/50 border border-rose-500/30 rounded-xl p-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-rose-500/70 focus:ring-1 focus:ring-rose-500/70 resize-none transition-all min-h-[120px]"
                    />
                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setDrops(prev => {
                            const next = [...prev];
                            next[activeDropIndex] = { ...activeDrop, state: 'PENDING' }; // Revert
                            return next;
                          });
                        }}
                        className="px-6 py-2.5 rounded-xl font-medium text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmitRationale}
                        disabled={rationaleText.length < 10}
                        className="px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <Send className="w-4 h-4" />
                        Submit Rationale
                      </button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500">
            {drops.some(d => d.state !== 'COMPLETED') ? (
              <>
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <PlayCircle className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-lg font-medium">Select a drop from the timeline above</p>
                <p className="text-sm mt-2 text-slate-600">Click any block to view details or take action.</p>
              </>
            ) : (
              <p className="text-lg font-medium">No active drops. You&apos;re all caught up!</p>
            )}
          </div>
        )}

      </div>
    </div>
  </div>
  );
}
