'use client';

import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  TrendingDown, 
  DollarSign, 
  Filter, 
  ChevronDown, 
  AlertCircle,
  Activity,
  Calendar,
  Layers,
  ArrowUpRight,
  Maximize2,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import { AnalysisChartOverlay } from './AnalysisChartOverlay';

interface DeepAnalysisSuiteProps {
  isVisible: boolean;
}

export function DeepAnalysisSuite({ isVisible }: DeepAnalysisSuiteProps) {
  const [viewFilter, setViewFilter] = useState<'Project' | 'Milestone' | 'Stream'>('Project');
  const [selectedMilestone, setSelectedMilestone] = useState('Security Infrastructure');
  const [expandedChart, setExpandedChart] = useState<'burndown' | 'expense' | null>(null);

  if (!isVisible) return null;

  return (
    <div className="flex flex-col bg-[#020617] py-6 px-0 animate-in fade-in zoom-in-95 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Chart 1: Multi-Model Burndown */}
        <div className="bg-[#0a192f]/40 border border-white/5 rounded-3xl px-5 py-4 relative overflow-hidden backdrop-blur-xl shadow-2xl group">
          <div className="flex justify-between items-start mb-2 relative z-10">
            <div>
              <p className="text-2xl font-bold text-white tracking-tight">Project Forecasting</p>
            </div>
            <button 
              onClick={() => setExpandedChart('burndown')}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-cyan-400 transition-all border border-white/5"
              title="Expand Chart"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="h-[320px] w-full relative mb-4">
            <BurndownChartSVG />
          </div>

          <div className="flex items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-widest border-t border-white/5 pt-3">
            <div className="flex items-center gap-1.5 text-rose-500">
              <div className="w-3 h-0.5 border-t border-rose-500 border-dashed" />
              <span>Initial</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-500">
              <div className="w-3 h-0.5 border-t border-emerald-500 border-dashed" />
              <span>Current</span>
            </div>
            <div className="flex items-center gap-1.5 text-cyan-400">
              <div className="w-3 h-0.5 border-t border-cyan-400 border-dashed" />
              <span>Best Fit</span>
            </div>
            <div className="flex items-center gap-1.5 text-fuchsia-400">
              <div className="w-3 h-0.5 bg-fuchsia-400 rounded-full" />
              <span>Staffing</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Project Expenses Stack */}
        <div className="bg-[#0a192f]/40 border border-white/5 rounded-3xl px-5 py-4 relative overflow-hidden backdrop-blur-xl shadow-2xl">
          <div className="flex justify-between items-start mb-2 relative z-10">
            <div>
              <p className="text-2xl font-bold text-white tracking-tight">Monthly Financial Burn</p>
            </div>
            <button 
              onClick={() => setExpandedChart('expense')}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-cyan-400 transition-all border border-white/5"
              title="Expand Chart"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="h-[320px] w-full relative">
            <ExpenseChartSVG />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expandedChart === 'burndown' && (
          <AnalysisChartOverlay
            title="Project Forecasting"
            subtitle="Multi-model burndown with capacity alignment and predictive accuracy."
            icon={TrendingDown}
            onClose={() => setExpandedChart(null)}
          >
            <div className="flex flex-col gap-10 w-full h-full">
              <div className="flex-1 min-h-0 w-full flex items-center justify-center">
                <BurndownChartSVG isExpanded />
              </div>
              <div className="flex items-center justify-center gap-12 text-[14px] font-bold uppercase tracking-[0.2em] border-t border-white/5 pt-8 shrink-0">
                <div className="flex items-center gap-3 text-rose-500">
                  <div className="w-8 h-1 border-t-2 border-rose-500 border-dashed" />
                  <span>Initial Baseline</span>
                </div>
                <div className="flex items-center gap-3 text-emerald-500">
                  <div className="w-8 h-1 border-t-2 border-emerald-500 border-dashed" />
                  <span>Current Plan</span>
                </div>
                <div className="flex items-center gap-3 text-cyan-400">
                  <div className="w-8 h-1 border-t-2 border-cyan-400 border-dashed" />
                  <span>AI Best Fit</span>
                </div>
                <div className="flex items-center gap-3 text-fuchsia-400">
                  <div className="w-8 h-2 bg-fuchsia-400 rounded-full" />
                  <span>Active Staffing</span>
                </div>
              </div>
            </div>
          </AnalysisChartOverlay>
        )}
        {expandedChart === 'expense' && (
          <AnalysisChartOverlay
            title="Monthly Financial Burn"
            subtitle="Categorized project expenditure with cumulative growth analysis."
            icon={DollarSign}
            onClose={() => setExpandedChart(null)}
          >
            <div className="flex flex-col gap-10 w-full h-full">
              <div className="flex-1 min-h-0 w-full flex items-center justify-center">
                <ExpenseChartSVG isExpanded />
              </div>
              <div className="flex items-center justify-center gap-12 text-[14px] font-bold uppercase tracking-[0.2em] border-t border-white/5 pt-8 shrink-0">
                <div className="flex items-center gap-3 text-teal-400">
                  <div className="w-5 h-5 bg-teal-500 rounded-lg shadow-[0_0_10px_rgba(20,184,166,0.3)]" />
                  <span>Direct Costs</span>
                </div>
                <div className="flex items-center gap-3 text-amber-500">
                  <div className="w-5 h-5 bg-amber-500 rounded-lg shadow-[0_0_10px_rgba(245,158,11,0.3)]" />
                  <span>External Labor</span>
                </div>
                <div className="flex items-center gap-3 text-blue-400">
                  <div className="w-5 h-5 bg-[#1e3a8a] rounded-lg shadow-[0_0_10px_rgba(30,58,138,0.3)]" />
                  <span>Internal Ops</span>
                </div>
                <div className="flex items-center gap-3 text-purple-400">
                  <div className="w-10 h-1 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.3)]" />
                  <span>Cumulative Burn</span>
                </div>
              </div>
            </div>
          </AnalysisChartOverlay>
        )}
      </AnimatePresence>

      {/* Strategic Filter Bar */}
      <div className="mt-auto bg-[#0a192f]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/5 border border-white/10">
              <Layers className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">View Filter</div>
              <div className="relative group">
                <select 
                  value={viewFilter}
                  onChange={(e) => setViewFilter(e.target.value as any)}
                  className="bg-transparent text-sm font-bold text-white outline-none appearance-none pr-6 cursor-pointer"
                >
                  <option value="Project">Full Project</option>
                  <option value="Milestone">By Milestone</option>
                  <option value="Stream">By Stream</option>
                </select>
                <ChevronDown className="w-3 h-3 text-slate-500 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-cyan-400 transition-colors" />
              </div>
            </div>
          </div>

          <div className="h-8 w-[1px] bg-white/10" />

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/5 border border-white/10">
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Milestone Selector</div>
              <div className="relative group">
                <select 
                  value={selectedMilestone}
                  onChange={(e) => setSelectedMilestone(e.target.value)}
                  className="bg-transparent text-sm font-bold text-white outline-none appearance-none pr-6 cursor-pointer"
                >
                  <option value="Security Infrastructure">Security Infrastructure</option>
                  <option value="Shareholder Demo">Shareholder Demo</option>
                  <option value="Beta">Beta</option>
                  <option value="MVP">MVP</option>
                </select>
                <ChevronDown className="w-3 h-3 text-slate-500 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-cyan-400 transition-colors" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Snapshot Accuracy</div>
            <div className="text-xs font-mono font-bold text-emerald-400">98.4% Precision</div>
          </div>
          <button className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-cyan-950 transition-all">
            <Activity className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function BurndownChartSVG({ isExpanded = false }: { isExpanded?: boolean }) {
  const width = 1000;
  const height = 400;
  const paddingX = isExpanded ? 80 : 60;
  const paddingY = isExpanded ? 30 : 10;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  // Mock data points
  const days = 100;
  const currentDay = 45;

  const getX = (d: number) => paddingX + (d / days) * chartW;
  const getY = (v: number) => paddingY + chartH - (v / 100) * chartH;

  // 1. Initial Idealized (Red Dashed)
  const initialPath = `M ${getX(0)},${getY(100)} L ${getX(100)},${getY(0)}`;

  // 2. Current Idealized (Green Dashed) - Includes scope increase at day 20
  const currentPath = `M ${getX(0)},${getY(100)} 
                       L ${getX(20)},${getY(80)} 
                       L ${getX(20)},${getY(95)} 
                       L ${getX(100)},${getY(0)}`;

  // 3. Best Fit Projection (Blue Dashed) - Based on actual velocity
  const bestFitPath = `M ${getX(45)},${getY(60)} 
                       L ${getX(105)},${getY(0)}`;

  // 4. Actual Progress (Solid Black)
  const actualData = [
    { d: 0, v: 100 },
    { d: 10, v: 92 },
    { d: 20, v: 85 },
    { d: 20, v: 98 }, // scope spike
    { d: 30, v: 82 },
    { d: 45, v: 60 }
  ];
  const actualPath = actualData.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.d)},${getY(p.v)}`).join(' ');
  
  // 5. Staffing Line (Lavender/Pink)
  // Dedicated scale at the bottom of the chart area (bottom 80px)
  const getStaffY = (members: number) => (paddingY + chartH) - 10 - (members / 12) * 80;
  const staffingPath = `M ${getX(0)},${getStaffY(10)} L ${getX(50)},${getStaffY(10)} L ${getX(50)},${getStaffY(6)} L ${getX(100)},${getStaffY(6)}`;
  const staffingAreaPath = `${staffingPath} L ${getX(100)},${paddingY + chartH} L ${getX(0)},${paddingY + chartH} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id="staffingGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d8b4fe" />
          <stop offset="100%" stopColor="#d8b4fe" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid Lines */}
      <g className="stroke-white/[0.05] stroke-[1]">
        {[0, 25, 50, 75, 100].map(v => (
          <line key={v} x1={paddingX} y1={getY(v)} x2={width - paddingX} y2={getY(v)} />
        ))}
        {[0, 25, 50, 75, 100].map(d => (
          <line key={d} x1={getX(d)} y1={paddingY} x2={getX(d)} y2={height - paddingY} />
        ))}
      </g>

      {/* Axes Labels */}
      <g className={cn("fill-slate-500 font-bold uppercase tracking-widest", isExpanded ? "text-[14px]" : "text-[10px]")}>
        {[0, 25, 50, 75, 100].map(v => (
          <text key={v} x={paddingX - 20} y={getY(v) + 5} textAnchor="end">{v}%</text>
        ))}
        {[0, 25, 50, 75, 100].map(d => (
          <text key={d} x={getX(d)} y={height - paddingY + (isExpanded ? 30 : 20)} textAnchor="middle">WK {Math.floor(d/7)}</text>
        ))}
      </g>

      {/* Initial Idealized (Red Dashed) */}
      <path d={initialPath} fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="6 6" opacity="0.6" />

      {/* Current Idealized (Green Dashed) */}
      <path d={currentPath} fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="6 6" opacity="0.8" />

      {/* Best Fit Projection (Blue Dashed) */}
      <path d={bestFitPath} fill="none" stroke="#22d3ee" strokeWidth="3" strokeDasharray="8 4" filter="url(#glow)" />

      {/* Actual Progress (Solid Black/White for contrast) */}
      <path d={actualPath} fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

      {/* Staffing Area & Line (Lavender/Pink) */}
      <path d={staffingAreaPath} fill="url(#staffingGradient)" opacity="0.1" />
      <path d={staffingPath} fill="none" stroke="#d8b4fe" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" filter="url(#glow)" />
      
      {/* Staffing Labels */}
      <g className={cn("fill-fuchsia-300 font-black uppercase tracking-widest", isExpanded ? "text-[12px]" : "text-[9px]")}>
        <text x={getX(2)} y={getStaffY(10) - (isExpanded ? 15 : 12)}>10 Members</text>
        <text x={getX(52)} y={getStaffY(6) - (isExpanded ? 15 : 12)}>6 Members</text>
      </g>

      {/* Staffing Delta */}
      <g transform={`translate(${getX(50)}, ${(getStaffY(10) + getStaffY(6)) / 2})`}>
        <circle r="10" className="fill-fuchsia-500/20 stroke-fuchsia-500/40 stroke-1" />
        <text y="3" textAnchor="middle" className="fill-fuchsia-400 text-[8px] font-black">-4</text>
      </g>
      
      {/* Scope Increase Marker */}
      <g transform={`translate(${getX(20)}, ${getY(90)})`}>
        <rect x="-30" y="-12" width="60" height="24" rx="12" className="fill-rose-500/20 stroke-rose-500 stroke-1" />
        <text y="4" textAnchor="middle" className="fill-rose-500 text-[10px] font-black uppercase tracking-widest">+115 Scope</text>
      </g>

      {/* % Completion Annotations */}
      <g transform={`translate(${getX(45)}, ${getY(60)})`}>
        <circle r={isExpanded ? 8 : 6} className="fill-white" />
        <circle r={isExpanded ? 16 : 12} className="fill-white/20 animate-pulse" />
        <text x={isExpanded ? 20 : 15} y="4" className={cn("fill-white font-black", isExpanded ? "text-[16px]" : "text-[12px]")}>64% COMPLETE</text>
      </g>

      {/* Legend Tooltips on hover (mocked as static) */}
      <g transform={`translate(${getX(75)}, ${getY(35)})`} className="opacity-0 group-hover:opacity-100 transition-opacity">
        <rect x="-40" y="-20" width="80" height="40" rx="8" className="fill-[#020617] stroke-white/10 shadow-xl" />
        <text x="0" y="-5" textAnchor="middle" className="fill-slate-400 text-[8px] font-bold uppercase tracking-[0.1em]">Forecasted</text>
        <text x="0" y="10" textAnchor="middle" className="fill-white text-[12px] font-bold">JUL 12</text>
      </g>
    </svg>
  );
}

function ExpenseChartSVG({ isExpanded = false }: { isExpanded?: boolean }) {
  const width = 1000;
  const height = 400;
  const paddingX = isExpanded ? 90 : 70;
  const paddingY = isExpanded ? 40 : 15;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'];
  const data = [
    { internal: 40, external: 15, direct: 10 },
    { internal: 42, external: 18, direct: 12 },
    { internal: 45, external: 25, direct: 15 },
    { internal: 38, external: 30, direct: 20 },
    { internal: 50, external: 35, direct: 25 },
    { internal: 55, external: 40, direct: 30 },
  ];

  const barWidth = 60;
  const spacing = chartW / months.length;

  const getX = (i: number) => paddingX + i * spacing + spacing / 2;
  const getY = (v: number) => paddingY + chartH - (v / 150) * chartH;
  const getCumY = (v: number) => paddingY + chartH - (v / 600) * chartH;

  // Cumulative line data
  let cumTotal = 0;
  const cumData = data.map(d => {
    cumTotal += (d.internal + d.external + d.direct);
    return cumTotal;
  });

  const cumPath = cumData.map((v, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)},${getCumY(v)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
      {/* Grid */}
      <g className="stroke-white/[0.05] stroke-[1]">
        {[0, 50, 100, 150].map(v => (
          <line key={v} x1={paddingX} y1={getY(v)} x2={width - paddingX} y2={getY(v)} />
        ))}
      </g>

      {/* Y-Axis Left (Monthly $) */}
      <g className={cn("fill-slate-500 font-bold uppercase tracking-widest", isExpanded ? "text-[14px]" : "text-[10px]")}>
        {[0, 50, 100, 150].map(v => (
          <text key={v} x={paddingX - (isExpanded ? 25 : 15)} y={getY(v) + 5} textAnchor="end">${v}k</text>
        ))}
      </g>

      {/* Y-Axis Right (Cumulative $) */}
      <g className={cn("fill-purple-400 font-bold uppercase tracking-widest", isExpanded ? "text-[14px]" : "text-[10px]")}>
        {[0, 200, 400, 600].map(v => (
          <text key={v} x={width - paddingX + (isExpanded ? 25 : 15)} y={getCumY(v) + 5} textAnchor="start">${v}k</text>
        ))}
      </g>

      {/* Bars */}
      {data.map((d, i) => {
        const x = getX(i) - barWidth / 2;
        const hDirect = (d.direct / 150) * chartH;
        const hExternal = (d.external / 150) * chartH;
        const hInternal = (d.internal / 150) * chartH;

        return (
          <g key={i}>
            {/* Direct (Teal) */}
            <rect 
              x={x} y={getY(d.direct)} width={barWidth} height={hDirect} 
              className="fill-teal-500/80 hover:fill-teal-400 transition-colors" rx="2" 
            />
            {/* External (Amber) */}
            <rect 
              x={x} y={getY(d.direct + d.external)} width={barWidth} height={hExternal} 
              className="fill-amber-500/80 hover:fill-amber-400 transition-colors" rx="2" 
            />
            {/* Internal (Navy) */}
            <rect 
              x={x} y={getY(d.direct + d.external + d.internal)} width={barWidth} height={hInternal} 
              className="fill-[#1e3a8a] hover:fill-[#2563eb] transition-colors" rx="2" 
            />
            
            <text x={getX(i)} y={height - paddingY + (isExpanded ? 30 : 20)} textAnchor="middle" className={cn("fill-slate-500 font-bold uppercase tracking-widest", isExpanded ? "text-[14px]" : "text-[10px]")}>{months[i]}</text>
          </g>
        );
      })}

      {/* Baseline Line (Initial Projected Expense) */}
      <line 
        x1={paddingX} y1={getY(110)} x2={width - paddingX} y2={getY(110)} 
        className="stroke-white/30 stroke-2" strokeDasharray="4 4" 
      />
      <text x={paddingX + 10} y={getY(110) - 8} className="fill-slate-400 text-[8px] font-black uppercase tracking-widest">Initial Projected Baseline</text>

      {/* Cumulative Line (Purple) */}
      <path d={cumPath} fill="none" stroke="#a855f7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <g transform={`translate(${getX(5)}, ${getCumY(cumData[5])})`}>
        <circle r="6" className="fill-purple-400 shadow-xl" />
        <circle r="12" className="fill-purple-400/20 animate-ping" />
      </g>
    </svg>
  );
}
