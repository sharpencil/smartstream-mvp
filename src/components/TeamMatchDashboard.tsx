import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { AlertCircle, ArrowRight, Check, History, Info, ShieldAlert, Users, Zap } from 'lucide-react';

interface TeamMatchDashboardProps {
  onTraceDependency: () => void;
  onOverride: () => void;
  selectedDate?: string;
}

export function TeamMatchDashboard({ onTraceDependency, onOverride, selectedDate = 'Today' }: TeamMatchDashboardProps) {

  // Mock Data
  const activeMatches = [
    {
      id: 'm1',
      name: 'Priya Sharma',
      role: 'Principal Engineer',
      score: 0.82,
      load: 85,
      status: 'On Track',
      rationale: 'The Agent ran 4 alternatives; Priya scores highest and has bandwidth.',
    },
    {
      id: 'm2',
      name: 'Marcus Chen',
      role: 'Senior Developer',
      score: 0.91,
      load: 145,
      status: 'Delayed',
      rationale: 'Critical path expert, but currently overallocated. Expect 2-day slip.',
    },
    {
      id: 'm3',
      name: 'Sarah Jenkins',
      role: 'UX Architect',
      score: 0.74,
      load: 40,
      status: 'Blocked',
      rationale: 'Available bandwidth, but blocked by upstream design system changes.',
    },
  ];

  const nextMoves = [
    {
      id: 'd1',
      title: 'Auth Service Migration',
      primary: { name: 'Sam', score: 0.83 },
      runnerUp: { name: 'Jordan', score: 0.72 },
    },
    {
      id: 'd2',
      title: 'Payment Gateway Revamp',
      primary: { name: 'Elena', score: 0.89 },
      runnerUp: { name: 'Marcus', score: 0.65 },
    },
    {
      id: 'd3',
      title: 'Performance Audit',
      primary: { name: 'David', score: 0.78 },
      runnerUp: { name: 'Priya', score: 0.75 },
    },
  ];

  const constraints = [
    {
      id: 'c1',
      title: 'Upstream API contract change blocking 4 Drops.',
      type: 'Technical',
    },
    {
      id: 'c2',
      title: 'Skill Gap: No Senior Cloud Architect available for Stream X.',
      type: 'Resource',
    },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#020617] text-slate-50">
      <div className="flex-1 flex gap-8 overflow-hidden">
        {/* Main Content: Active Matches & Constraints */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar pr-2 pb-8">
          
          <div className="mb-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              Active Match Feed
            </h2>
            <p className="text-xs text-slate-400 mt-1 pl-6">Real-time load & suitability metrics</p>
          </div>
            <div className="space-y-4">
              {activeMatches.map((match) => (
                <div key={match.id} className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5 flex items-start gap-6 hover:bg-white/[0.07] transition-colors">
                  {/* Score */}
                  <div className="flex flex-col items-center justify-center min-w-[80px]">
                    <span className={cn(
                      "text-4xl font-sans font-black tracking-tight leading-none mb-1",
                      match.score >= 0.8 ? "text-teal-400" : "text-amber-400"
                    )}>
                      {match.score.toFixed(2)}
                    </span>
                    <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500">Suitability</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-100 leading-none">{match.name}</h3>
                        <p className="text-xs text-slate-400 mt-1">{match.role}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className={cn(
                            "text-lg font-bold",
                            match.load > 100 ? "text-amber-400" : "text-emerald-400"
                          )}>{match.load}%</span>
                          <p className="text-[9px] uppercase font-bold tracking-widest text-slate-500">Current Load</p>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="text-right min-w-[80px]">
                          <span className={cn(
                            "text-sm font-bold flex items-center justify-end gap-1.5",
                            match.status === 'On Track' ? "text-emerald-400" : match.status === 'Blocked' ? "text-rose-400" : "text-amber-400"
                          )}>
                            {match.status === 'Blocked' && <ShieldAlert className="w-3.5 h-3.5" />}
                            {match.status}
                          </span>
                          <p className="text-[9px] uppercase font-bold tracking-widest text-slate-500">Status</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#0a192f]/50 rounded-lg p-3 border border-white/5 flex items-start gap-3 mt-2">
                      <Zap className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-300">{match.rationale}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-center justify-center shrink-0">
                    <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white transition-all flex items-center gap-2">
                      Reassign
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                Firm Constraints Log
              </h2>
              <p className="text-xs text-slate-400 mt-1 pl-6">Cross-functional blockers</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {constraints.map((constraint) => (
                <div key={constraint.id} className="bg-rose-950/10 border border-rose-500/20 rounded-xl p-4 relative group">
                  <span className="absolute top-0 right-0 bg-rose-500/10 text-rose-400 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-bl-lg rounded-tr-xl">
                    {constraint.type}
                  </span>
                  <p className="text-sm font-medium text-slate-200 mt-2 mb-4">{constraint.title}</p>
                  <button 
                    onClick={onTraceDependency}
                    className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition-colors"
                  >
                    Trace Dependency <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side Panel: Next Moves */}
        <div className="w-96 shrink-0 bg-[#0a192f]/30 flex flex-col border border-white/5 rounded-[28px] overflow-y-auto custom-scrollbar p-6 h-fit max-h-full">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-transparent" /> {/* Spacer for alignment */}
              Next Moves Handshake
            </h2>
            <p className="text-xs text-slate-400 mt-1 pl-6">Pending AI Assignments</p>
          </div>

          <div className="space-y-4">
            {nextMoves.map((move) => (
              <div key={move.id} className="bg-[#020617] rounded-xl border border-white/10 p-4 shadow-lg">
                <h3 className="text-sm font-bold text-slate-200 mb-3">{move.title}</h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between bg-cyan-950/20 border border-cyan-500/20 rounded-lg p-2">
                    <span className="text-xs font-bold text-cyan-100">1. {move.primary.name}</span>
                    <span className="text-xs font-mono font-bold text-cyan-400">{move.primary.score.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/5 border border-white/5 rounded-lg p-2 opacity-70">
                    <span className="text-xs text-slate-300">2. {move.runnerUp.name}</span>
                    <span className="text-xs font-mono font-bold text-slate-400">{move.runnerUp.score.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> Confirm
                  </button>
                  <button 
                    onClick={onOverride}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 py-1.5 rounded-lg text-xs font-bold transition-colors"
                  >
                    Override
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
