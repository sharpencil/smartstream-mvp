'use client';

import { motion } from 'framer-motion';
import { Zap, Trophy, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Employee } from '@/lib/mockTeam';

interface TalentCardProps {
  employee: Employee;
  onClick: (employee: Employee) => void;
  isHighlighted?: boolean;
}

export function TalentCard({ employee, onClick, isHighlighted }: TalentCardProps) {
  const statusColors = {
    available: 'bg-green-500 shadow-[0_0_10px_rgba(34,211,74,0.8)]',
    saturated: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]',
    blocked: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]',
  };

  // Velocity percentage for the meter
  const velocityPercent = Math.min((employee.velocity / 120) * 100, 100);
  const avgPercent = Math.min((employee.avgVelocity / 120) * 100, 100);
  const isCooling = employee.velocity < employee.avgVelocity;

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        "relative rounded-[32px] bg-[#0a192f]/40 backdrop-blur-xl border p-6 flex flex-col gap-6 cursor-pointer group transition-all duration-500",
        isHighlighted 
          ? "border-teal-400/50 shadow-[0_0_30px_rgba(13,148,136,0.15)] ring-1 ring-teal-400/20" 
          : "border-white/10 hover:border-white/20"
      )}
      onClick={() => onClick(employee)}
    >
      {/* Match Score Badge (if highlighted) */}
      {isHighlighted && employee.matchScore && (
        <div className="absolute -top-3 -right-3 px-3 py-1 bg-teal-500 text-[#020617] text-xs font-bold rounded-full shadow-[0_0_15px_rgba(13,148,136,0.5)] z-10">
          {employee.matchScore}% Match
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-950 to-[#0a192f] border border-teal-800/30 flex items-center justify-center shadow-lg group-hover:border-teal-400/50 group-hover:shadow-[0_0_15px_rgba(13,148,136,0.2)] transition-all">
             <span className="text-teal-200 font-bold text-lg">{employee.name.charAt(0)}</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">{employee.name}</h3>
            <p className="text-xs text-slate-500 font-mono tracking-widest">{employee.role}</p>
          </div>
        </div>
        <div className={cn("w-2.5 h-2.5 rounded-full animate-pulse mt-2", statusColors[employee.availability])} />
      </div>

      {/* Skills Aura */}
      <div className="flex flex-wrap gap-2">
        {employee.skills.slice(0, 3).map((skill, i) => (
          <div 
            key={skill} 
            className="px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest bg-slate-900/60 border border-white/5 text-slate-400 flex items-center gap-1.5"
          >
            {i === 0 && <Trophy className="w-2.5 h-2.5 text-amber-500/60" />}
            {skill}
          </div>
        ))}
      </div>

      {/* Velocity Meter */}
      <div className="space-y-3 pt-2 cursor-default relative group/meter">
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-500">
            <Zap className={cn("w-3 h-3 transition-colors", isCooling ? "text-amber-500/70" : "text-green-500/70")} />
            <span>VELOCITY PULSE</span>
          </div>
          <span className={cn("text-sm font-bold transition-colors", isCooling ? "text-amber-400" : "text-green-400")}>
            {employee.velocity} <span className="text-[10px] text-slate-600 font-mono font-normal">PTS</span>
          </span>
        </div>
        
        {/* Sleek Tooltip */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-lg text-[10px] text-slate-200 opacity-0 group-hover/meter:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap shadow-xl">
           Current Load: <span className={cn("font-bold", isCooling ? "text-amber-400" : "text-green-400")}>{employee.velocity}</span> Drops/Day
        </div>

        <div className="relative h-1.5 bg-slate-900/50 rounded-sm overflow-hidden border border-white/5">
          {/* Average Marker */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-slate-700 z-10 opacity-50" 
            style={{ left: `${avgPercent}%` }} 
          />
          {/* Main Bar (Sleek) */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${velocityPercent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={cn(
              "absolute top-0 bottom-0 rounded-sm bg-gradient-to-r transition-all duration-1000",
              isCooling 
                ? "from-amber-600 via-amber-400 to-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]" 
                : "from-green-600 via-green-400 to-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)]"
            )}
          />
        </div>
        <div className="flex justify-between text-[8px] text-slate-600 uppercase tracking-widest font-mono">
            <span>Avg: {employee.avgVelocity}</span>
            <span>Peak: 120</span>
        </div>
      </div>

      <button 
        onClick={(e) => {
          e.stopPropagation();
          onClick(employee);
        }}
        className="mt-2 w-full py-3 rounded-full bg-transparent border border-cyan-500/50 text-cyan-400 text-xs font-medium uppercase tracking-[0.1em] hover:bg-cyan-500 hover:text-[#020617] transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-95 translate-y-0 hover:-translate-y-0.5"
      >
        View Performance History
        <ChevronRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
