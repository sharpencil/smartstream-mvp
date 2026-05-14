'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Check,
  AlertTriangle,
  Users,
  X,
  Zap,
  Brain
} from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  addHours,
  eachDayOfInterval,
  isToday,
  startOfDay,
  isWithinInterval,
  addWeeks,
  subWeeks,
  parseISO
} from 'date-fns';
import { cn } from '@/lib/utils';
import { mockEmployees } from '@/lib/mockTeam';
import { STAGING_STREAMS, StagingDrop } from '@/lib/stagingData';
import { getStreamColor } from '@/lib/streams';
import * as Popover from '@radix-ui/react-popover';

type ViewMode = 'Month' | 'Week' | 'Agenda';

interface CalendarDrop extends StagingDrop {
  startDate: Date;
  endDate: Date;
  streamColor: string;
  streamInitials: string;
  streamTitle: string;
  isBlocked?: boolean;
  isDelayed?: boolean;
}

export function CalendarDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('Month');
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>(['emp-1', 'emp-3', 'emp-5']); // Sarah, Lena, Maya
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // Request Modal State
  const [requestStart, setRequestStart] = useState('');
  const [requestEnd, setRequestEnd] = useState('');
  const [requestType, setRequestType] = useState('Vacation');
  const [requestNote, setRequestNote] = useState('');

  // Process drops for calendar
  const allDrops = useMemo(() => {
    const drops: CalendarDrop[] = [];
    STAGING_STREAMS.forEach(stream => {
      stream.drops.forEach(drop => {
        const hash = parseInt(drop.drop_id);
        const dayOffset = (hash % 30) - 10;
        const startDate = addDays(startOfDay(new Date()), dayOffset);
        const endDate = addDays(startDate, Math.ceil(drop.estimated_time / 8) || 1);

        // Force some statuses for visual demonstration of the legend
        let status = drop.status;
        if (hash === 8989) status = 'In Progress'; // Only one active drop for realism
        if (hash % 12 === 0) status = 'Completed';

        drops.push({
          ...drop,
          status,
          startDate,
          endDate,
          streamColor: getStreamColor(stream.colorKey).hex,
          streamInitials: stream.initials,
          streamTitle: stream.title,
          isBlocked: hash % 15 === 0,
          isDelayed: hash % 11 === 0
        });
      });
    });

    // Inject Mock PTO
    drops.push({
      drop_id: 'pto-1',
      title: 'Lena Vane (PTO)',
      status: 'pto',
      startDate: startOfDay(new Date()), // Today for immediate visibility
      endDate: addDays(startOfDay(new Date()), 2),
      owner_id: '1', // Matches Lena Vane (emp-1)
      estimated_time: 24,
      tasks: ['Annual Leave'],
      streamId: 'system',
      streamTitle: 'Human Capacity',
      streamInitials: 'HC',
      streamColor: '#6366f1',
    } as any);

    // Inject Mock Milestones (matches Pulse page style)
    drops.push({
      drop_id: 'ms-1',
      title: 'BETA RELEASE',
      status: 'milestone',
      startDate: addDays(startOfMonth(currentDate), 14), // Middle of the month for visibility
      endDate: addDays(startOfMonth(currentDate), 14),
      owner_id: 'system',
      estimated_time: 0,
      tasks: ['Critical Milestone'],
      streamId: 'milestone',
      streamTitle: 'Project Milestones',
      streamInitials: 'MS',
      streamColor: '#cbd5e1', // Silver/Slate-300
    } as any);

    return drops;
  }, []);

  const filteredDrops = useMemo(() => {
    return allDrops.filter(drop => {
      const empId = `emp-${drop.owner_id}`;
      return selectedTeamMembers.includes(empId) || drop.owner_id === 'system';
    });
  }, [allDrops, selectedTeamMembers]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));

  const overlapWarning = useMemo(() => {
    if (!requestStart || !requestEnd) return null;
    const start = parseISO(requestStart);
    const end = parseISO(requestEnd);

    // Check 'My Drops' (emp-1 for this demo context)
    const myDrops = allDrops.filter(d => d.owner_id === '1');
    const overlapping = myDrops.find(drop => {
      return (
        isWithinInterval(drop.startDate, { start, end }) ||
        isWithinInterval(drop.endDate, { start, end }) ||
        (drop.startDate < start && drop.endDate > end)
      );
    });

    return overlapping ? overlapping.title : null;
  }, [requestStart, requestEnd, allDrops]);

  return (
    <div className="w-full h-full bg-[#020617] flex flex-col overflow-hidden no-scrollbar">
      {/* Header */}
      <div className="sticky top-0 z-[120] bg-[#020617]/95 backdrop-blur-md px-8 pt-8 pb-6 border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <h1 className="text-3xl font-bold font-sans tracking-tight text-slate-100 flex items-center gap-3">
            Calendar
          </h1>
          
          <div className="flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/10">
            <button onClick={viewMode === 'Month' ? prevMonth : prevWeek} className="p-1.5 hover:bg-white/5 rounded-full text-slate-400 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-200 min-w-[110px] text-center">
              {format(currentDate, viewMode === 'Month' ? 'MMMM yyyy' : 'MMM d, yyyy')}
            </span>
            <button onClick={viewMode === 'Month' ? nextMonth : nextWeek} className="p-1.5 hover:bg-white/5 rounded-full text-slate-400 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Tabs */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 bg-[#0a192f]/60 border border-slate-800/60 rounded-full shadow-inner shadow-black/20">
          {(['Month', 'Week', 'Agenda'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-all outline-none",
                viewMode === mode 
                  ? "bg-emerald-950/80 text-emerald-400 shadow-inner shadow-emerald-500/20 border border-emerald-500/20" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}
            >
              {mode}
            </button>
          ))}
        </div>

        <button 
          onClick={() => setIsRequestModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-bold text-sm transition-all shadow-[0_0_20px_rgba(34,211,238,0.1)] hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]"
        >
          <Plus className="w-4 h-4" />
          Request time off
        </button>
      </div>

      <div className="px-8 py-2 bg-slate-900/40 border-b border-white/5 flex items-center justify-center gap-10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-emerald-500/10 border border-emerald-500/30 ring-1 ring-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Drop</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-red-600 animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.4)]" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Blocked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Delayed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm border border-dashed border-indigo-400 bg-indigo-500/10" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PTO</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-white/20 border border-white/40 shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Milestone</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Team Toggle */}
        <div className="w-64 border-r border-white/5 bg-black/20 flex flex-col shrink-0">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Users className="w-3.5 h-3.5" />
              Team Layers
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
            {mockEmployees.map((emp) => (
              <button
                key={emp.id}
                onClick={() => {
                  setSelectedTeamMembers(prev =>
                    prev.includes(emp.id) ? prev.filter(id => id !== emp.id) : [...prev, emp.id]
                  );
                }}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-all border group",
                  selectedTeamMembers.includes(emp.id)
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-100"
                    : "bg-white/5 border-transparent text-slate-400 hover:bg-white/10"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border transition-all",
                  selectedTeamMembers.includes(emp.id) ? "border-emerald-400 bg-emerald-400 text-slate-900" : "border-slate-700 bg-slate-800 text-slate-400"
                )}>
                  {emp.avatar}
                </div>
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-xs font-bold truncate w-full">{emp.name}</span>
                  <span className="text-[10px] opacity-60 truncate w-full">{emp.role}</span>
                </div>
                <div className={cn(
                  "ml-auto w-1.5 h-1.5 rounded-full transition-all",
                  selectedTeamMembers.includes(emp.id) ? "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-slate-700"
                )} />
              </button>
            ))}
          </div>
        </div>

        {/* Main Calendar Content */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {viewMode === 'Month' && (
              <motion.div
                key="month"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="h-full flex flex-col p-8"
              >
                <div className="grid grid-cols-7 gap-px mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-[10px] font-black text-slate-600 uppercase tracking-widest pb-4">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="flex-1 grid grid-cols-7 grid-rows-5 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                  {getMonthDays(currentDate).map((day, idx) => (
                    <CalendarDay
                      key={idx}
                      day={day}
                      currentDate={currentDate}
                      drops={filteredDrops
                        .filter(d => isSameDay(d.startDate, day))
                        .sort((a, b) => (a.status === 'milestone' ? -1 : (b.status === 'milestone' ? 1 : 0)))}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {viewMode === 'Week' && (
              <motion.div
                key="week"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="h-full flex flex-col p-8"
              >
                <div className="flex-1 flex flex-col bg-white/5 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="grid grid-cols-8 divide-x divide-white/5 border-b border-white/5 bg-slate-900/50">
                    <div className="h-12 flex items-center justify-center text-[10px] font-black text-slate-600 uppercase">GMT-5</div>
                    {getWeekDays(currentDate).map((day, i) => (
                      <div key={i} className={cn(
                        "h-12 flex flex-col items-center justify-center transition-colors",
                        isToday(day) ? "bg-emerald-500/5" : ""
                      )}>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{format(day, 'EEE')}</span>
                        <span className={cn("text-xs font-bold mt-0.5", isToday(day) ? "text-emerald-400" : "text-slate-300")}>{format(day, 'd')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex-1 overflow-y-auto no-scrollbar relative">
                    {/* Time Grid Lines */}
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-20 border-b border-white/[0.03] relative"
                      >
                        <span className="absolute -left-12 top-0 text-[10px] font-mono text-slate-600">
                          {format(addHours(startOfDay(new Date()), i), 'HH:mm')}
                        </span>
                      </div>
                    ))}

                    {/* Milestone Lines (Pulse style) */}
                    {allDrops.filter(d => d.status === 'milestone').map(ms => {
                      const dayIndex = getWeekDays(currentDate).findIndex(d => isSameDay(d, ms.startDate));
                      if (dayIndex === -1) return null;
                      const left = (dayIndex / 7) * 100;
                      return (
                        <div
                          key={ms.drop_id}
                          className="absolute top-0 bottom-0 z-30 pointer-events-none"
                          style={{ left: `${12.5 + (dayIndex * 12.5)}%` }}
                        >
                          <div className="absolute top-0 bottom-0 w-px border-l border-slate-400/50 border-dashed" />
                          <div className="absolute top-2 left-2 bg-slate-900/80 border border-slate-500/50 text-slate-400 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-widest whitespace-nowrap">
                            {ms.title}
                          </div>
                        </div>
                      );
                    })}

                    {/* Now Line */}
                    <div
                      className="absolute left-[12.5%] right-0 h-px bg-emerald-500 z-50 shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                      style={{ top: `${(new Date().getHours() * 60 + new Date().getMinutes()) / 60 * 80}px` }}
                    >
                      <div className="absolute -left-2 -top-1 w-2 h-2 rounded-full bg-emerald-500" />
                    </div>

                    {/* Week Drops (Simplified positioning for MVP) */}
                    <div className="absolute inset-0 pointer-events-none grid grid-cols-8 gap-0">
                      <div className="col-start-1" /> {/* Spacer for time column */}
                      {getWeekDays(currentDate).map((day, i) => (
                        <div key={i} className="relative h-full">
                          {filteredDrops
                            .filter(d => isSameDay(d.startDate, day))
                            .sort((a, b) => (a.status === 'milestone' ? -1 : (b.status === 'milestone' ? 1 : 0)))
                            .map((drop, j) => (
                              <WeekDrop key={j} drop={drop} />
                            ))
                          }
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {viewMode === 'Agenda' && (
              <motion.div
                key="agenda"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col p-8 overflow-y-auto no-scrollbar"
              >
                <div className="max-w-4xl mx-auto w-full space-y-12 pb-32">
                  {getAgendaDays(currentDate).map((day, idx) => {
                    const dayDrops = filteredDrops
          .filter(d => isSameDay(d.startDate, day))
          .sort((a, b) => {
            if (a.status === 'milestone') return -1;
            if (b.status === 'milestone') return 1;
            return 0;
          });
                    if (dayDrops.length === 0 && !isToday(day)) return null;

                    return (
                      <div key={idx} className="flex gap-8 group">
                        <div className="w-32 shrink-0 pt-1">
                          <div className={cn(
                            "text-xs font-black uppercase tracking-[0.2em] transition-colors",
                            isToday(day) ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"
                          )}>
                            {format(day, 'EEEE')}
                          </div>
                          <div className={cn(
                            "text-2xl font-bold mt-1",
                            isToday(day) ? "text-slate-100" : "text-slate-400"
                          )}>
                            {format(day, 'MMM d')}
                          </div>
                        </div>
                        <div className="flex-1 space-y-3">
                          {dayDrops.sort((a, b) => (a.owner_id === '1' ? -1 : 1)).map((drop, j) => (
                            <AgendaItem key={j} drop={drop} />
                          ))}
                          {dayDrops.length === 0 && (
                            <div className="p-6 rounded-2xl bg-white/5 border border-dashed border-white/10 flex items-center justify-center text-slate-500 text-sm italic">
                              No drops scheduled
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Request Modal */}
      <AnimatePresence>
        {isRequestModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRequestModalOpen(false)}
              className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-[#0a192f]/80 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-100">Request Time Off</h2>
                  <p className="text-sm text-slate-400 mt-1">AI Impact Analysis will be performed live</p>
                </div>
                <button onClick={() => setIsRequestModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Start Date</label>
                    <input
                      type="date"
                      value={requestStart}
                      onChange={(e) => setRequestStart(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">End Date</label>
                    <input
                      type="date"
                      value={requestEnd}
                      onChange={(e) => setRequestEnd(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</label>
                  <select
                    value={requestType}
                    onChange={(e) => setRequestType(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500/50 transition-all appearance-none"
                  >
                    <option>Vacation</option>
                    <option>Sick</option>
                    <option>Personal</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Notes</label>
                  <textarea
                    value={requestNote}
                    onChange={(e) => setRequestNote(e.target.value)}
                    placeholder="Brief reason for your absence..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-emerald-500/50 transition-all h-24 resize-none"
                  />
                </div>

                {/* AI Impact Guard */}
                <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 shadow-inner relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                    <Brain className="w-12 h-12 text-indigo-400" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-indigo-400" />
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">AI Impact Guard • Live Analysis</span>
                    </div>

                    {!requestStart || !requestEnd ? (
                      <p className="text-xs text-slate-500 italic">Select dates to analyze impact on your current load...</p>
                    ) : overlapWarning ? (
                      <div className="space-y-3">
                        <div className="flex items-start gap-2 text-amber-400">
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                          <p className="text-xs font-bold leading-relaxed">
                            ⚠️ This range overlaps with <span className="text-white">[{overlapWarning}]</span>.
                          </p>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          AI suggests reassigning this work to the Reservoir before submitting. Lena Vane or David Aris are recommended skilled backfills.
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-emerald-400">
                        <Check className="w-4 h-4" />
                        <p className="text-xs font-bold italic">Schedule clear. Zero impact on active drops detected.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-black/20 border-t border-white/5 flex gap-4">
                <button
                  onClick={() => setIsRequestModalOpen(false)}
                  className="flex-1 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 font-bold text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  disabled={!!overlapWarning && !requestNote}
                  className="flex-[2] py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-bold text-sm transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Request
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Sub-components ---

function CalendarDay({ day, currentDate, drops }: { day: Date, currentDate: Date, drops: CalendarDrop[] }) {
  const isSelected = isSameMonth(day, currentDate);
  const today = isToday(day);
  const milestones = drops.filter(d => d.status === 'milestone');

  return (
    <div className={cn(
      "min-h-[120px] p-3 border-r border-b border-white/5 transition-all group relative",
      !isSelected ? "bg-black/40 opacity-30" : "bg-slate-950 hover:bg-slate-900/50",
      today ? "bg-emerald-500/[0.03]" : ""
    )}>
      {/* Milestone Line in Month View (Pulse style) */}
      {milestones.map(ms => (
        <div key={ms.drop_id} className="absolute left-0 top-0 bottom-0 w-px border-l border-slate-400/50 border-dashed z-30 pointer-events-none" />
      ))}

      <div className="flex justify-between items-center mb-2 relative z-20">
        <span className={cn(
          "text-[10px] font-black",
          today ? "text-emerald-400" : (isSelected ? "text-slate-500" : "text-slate-700")
        )}>
          {format(day, 'd')}
        </span>
        {drops.length > 0 && isSelected && (
          <span className="text-[9px] font-black text-slate-600 bg-white/5 px-1.5 py-0.5 rounded-sm">
            {drops.length}
          </span>
        )}
      </div>
      <div className="space-y-1.5">
        {drops.slice(0, 3).map((drop, i) => (
          <DropPill key={i} drop={drop} />
        ))}
        {drops.length > 3 && (
          <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest pl-1">
            + {drops.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
}

function DropPill({ drop }: { drop: CalendarDrop }) {
  const status = drop.status.toLowerCase();
  const isCompleted = status === 'completed';
  const isActive = status === 'active' || status === 'in progress';
  const isGhost = status === 'ghost' || status === 'not started';
  const isBlocked = drop.isBlocked;
  const isDelayed = drop.isDelayed;

  const isPTO = status === 'pto';
  const isMilestone = status === 'milestone';

  const getBgColor = () => {
    if (isPTO) return "bg-slate-900/40 border-dashed border-white/20 text-slate-400 italic";
    if (isMilestone) return "bg-white/10 border-white/60 text-white font-black shadow-[0_0_20px_rgba(255,255,255,0.1)] ring-1 ring-white/20";
    if (isBlocked) return "bg-red-600 border-red-500/30 text-white animate-pulse";
    if (isDelayed) return "bg-amber-500/80 border-amber-500/30 text-white";
    if (isCompleted) return "bg-slate-900 border-white/5 text-white/40";
    if (isActive) return "bg-emerald-500/10 border-emerald-500/30 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)] ring-2 ring-emerald-500/50";
    if (isGhost) return "bg-teal-950/20 border-dashed border-teal-500/30 text-white/60";
    return "bg-slate-800 border-white/10 text-white/90";
  };

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className={cn(
          "w-full px-2 py-1.5 rounded-lg border text-left flex items-center gap-1.5 transition-all hover:scale-[1.03] active:scale-95 group relative overflow-hidden backdrop-blur-md",
          getBgColor()
        )}>
          {/* Identity Notch */}
          {!isPTO && !isMilestone && (
            <div
              className="absolute left-0 top-0 bottom-0 w-[4px] z-50"
              style={{ backgroundColor: drop.streamColor }}
            />
          )}

          {isPTO && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />}

          <span className={cn(
            "text-[9px] font-bold truncate pr-1 relative z-20",
            isCompleted ? "text-white/40" : "text-white"
          )}>
            {isPTO ? `${drop.title} (Away)` : drop.title}
          </span>

          {/* Shimmer for active */}
          {isActive && !isBlocked && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent w-[200%] animate-[shimmer_2s_infinite] pointer-events-none" />
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side="top"
          sideOffset={5}
          className="w-80 bg-[#0a192f]/80 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] z-[1100] p-4 outline-none animate-in fade-in zoom-in-95"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className={cn(
              "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
              isCompleted ? "bg-slate-800 text-slate-500" : "bg-emerald-500/20 text-emerald-400"
            )}>
              {drop.status}
            </span>
            <span className="text-[10px] font-bold text-slate-500 ml-auto flex items-center gap-1">
              <Clock className="w-3 h-3" /> {drop.estimated_time}h
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-100 mb-2">{drop.title}</h4>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Requirement for stream: <span className="text-slate-300 font-bold">{drop.streamTitle}</span>
          </p>

          <div className="space-y-1 mb-4">
            {drop.tasks.slice(0, 3).map((t: string, i: number) => (
              <div key={i} className="flex items-start gap-2 text-[10px] text-slate-400">
                <div className="mt-1 w-1 h-1 rounded-full bg-emerald-500/40 shrink-0" />
                <span>{t}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[8px] font-black text-slate-400 border border-white/10">
                {mockEmployees.find(e => e.id === `emp-${drop.owner_id}`)?.avatar || '?'}
              </div>
              <span className="text-[10px] font-bold text-slate-500">
                {mockEmployees.find(e => e.id === `emp-${drop.owner_id}`)?.name || 'Unassigned'}
              </span>
            </div>
            <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1">
              <Zap className="w-3 h-3" /> Oracle Verified
            </div>
          </div>
          <Popover.Arrow className="fill-slate-900" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function WeekDrop({ drop }: { drop: CalendarDrop }) {
  // Positioning in week view is simplified for MVP
  // In real app, would use hours/minutes.
  const startHour = 9; // Mocking 9 AM
  const duration = Math.min(8, drop.estimated_time);

  const status = drop.status.toLowerCase();
  const isCompleted = status === 'completed';
  const isActive = status === 'active' || status === 'in progress';
  const isGhost = status === 'ghost' || status === 'not started';

  const isPTO = status === 'pto';
  const isMilestone = status === 'milestone';

  return (
    <div
      className={cn(
        "absolute left-1 right-1 rounded-xl border p-2 flex flex-col gap-1 pointer-events-auto transition-all hover:scale-[1.02] shadow-xl backdrop-blur-xl group overflow-hidden",
        isCompleted ? "bg-slate-950 border-white/5 opacity-50" : (isPTO ? "bg-indigo-500/5 border-dashed border-indigo-500/30" : (isActive ? "bg-emerald-500/10" : "bg-[#0a192f]/80 border-white/10")),
        isActive ? "ring-2 ring-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]" : "",
        isGhost ? "border-dashed bg-transparent border-teal-500/20" : ""
      )}
      style={{
        top: `${startHour * 80}px`,
        height: `${duration * 10}px`, // 10px per hour
        minHeight: '44px'
      }}
    >
      {!isPTO && !isMilestone && (
        <div
          className="absolute left-0 top-0 bottom-0 w-[4px] z-50"
          style={{ backgroundColor: drop.streamColor }}
        />
      )}

      <div className="flex items-start justify-between">
        <span className={cn(
          "text-[10px] font-bold truncate pr-4",
          isPTO ? "text-indigo-300 italic" : (isCompleted ? "text-white/40" : "text-white"),
        )}>
          {isPTO ? `${drop.title} (PTO)` : drop.title}
        </span>
        {isPTO && <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />}
      </div>

      <div className="mt-auto flex items-center justify-between">
        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{drop.streamInitials}</span>
        {isActive && <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.8)] animate-pulse" />}
      </div>

      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent w-[200%] animate-[shimmer_3s_infinite] pointer-events-none" />
      )}
    </div>
  );
}

function AgendaItem({ drop }: { drop: CalendarDrop }) {
  const status = drop.status.toLowerCase();
  const isCompleted = status === 'completed';
  const isMe = drop.owner_id === '1';

  const isPTO = status === 'pto';

  return (
    <div className={cn(
      "p-5 rounded-2xl border transition-all flex items-center gap-4 group/item",
      isCompleted ? "bg-black/20 border-white/5 opacity-60" : (isPTO ? "bg-indigo-500/5 border-dashed border-indigo-500/30" : "bg-white/5 border-white/10 hover:border-white/20 shadow-xl"),
      isMe && !isCompleted && !isPTO ? "ring-1 ring-emerald-500/20 bg-emerald-500/[0.02]" : ""
    )}>
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-white/10 bg-slate-900 group-hover/item:scale-110 transition-transform">
        <div className="text-xs font-black" style={{ color: drop.streamColor }}>{drop.streamInitials}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className={cn("text-sm font-bold truncate", isCompleted ? "text-white/30 line-through" : "text-white")}>
            {drop.title}
          </h4>
          {isMe && <span className="text-[8px] font-black bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-sm uppercase tracking-widest">My Drop</span>}
        </div>
        <p className="text-xs text-slate-500 truncate">{drop.streamTitle}</p>
      </div>
      <div className="text-right shrink-0">
        <div className="text-xs font-bold text-slate-300">{drop.estimated_time}h</div>
        <div className="text-[10px] font-medium text-slate-500 mt-1 uppercase tracking-widest">{drop.status}</div>
      </div>
      <div className="flex -space-x-2 ml-4">
        <div className="w-8 h-8 rounded-full border-2 border-[#020617] bg-slate-800 flex items-center justify-center text-[9px] font-black text-slate-400">
          {mockEmployees.find(e => e.id === `emp-${drop.owner_id}`)?.avatar || '?'}
        </div>
      </div>
    </div>
  );
}

// --- Utils ---

function getMonthDays(date: Date) {
  const start = startOfWeek(startOfMonth(date));
  const end = endOfWeek(endOfMonth(date));
  return eachDayOfInterval({ start, end });
}

function getWeekDays(date: Date) {
  const start = startOfWeek(date);
  const end = endOfWeek(date);
  return eachDayOfInterval({ start, end });
}

function getAgendaDays(date: Date) {
  const start = startOfDay(date);
  const end = addDays(start, 14);
  return eachDayOfInterval({ start, end });
}
