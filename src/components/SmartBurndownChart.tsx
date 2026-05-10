'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Brain, Target, Compass, Milestone } from 'lucide-react';

interface Point {
  x: number;
  y: number;
  label: string;
  value: number;
}

export function SmartBurndownChart() {
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // SVG Coordinate System (0 to 1000 width, 0 to 400 height)
  const width = 1000;
  const height = 400;
  const paddingX = 40;
  const paddingY = 40;

  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;

  // Mock Data setup
  const totalDays = 30; // 30 days total timeline
  const currentDay = 18; // We are on day 18
  const initialDrops = 100;
  const currentDrops = 42; // We have 42 left
  const predictedEndDay = 26; // AI predicts finishing early on day 26

  // Coordinate scales
  const xScale = (day: number) => paddingX + (day / totalDays) * innerWidth;
  const yScale = (val: number) => paddingY + innerHeight - (val / initialDrops) * innerHeight;

  // 1. Total Scope (Amber) - Scope creep stepped up at day 10
  const scopePath = `M ${xScale(0)},${yScale(initialDrops)} 
                     L ${xScale(10)},${yScale(initialDrops)} 
                     L ${xScale(10)},${yScale(110)} 
                     L ${xScale(totalDays)},${yScale(110)}`;

  // 2. Ideal Burn (Grey Dashed) - from day 0 to day 30
  const idealPath = `M ${xScale(0)},${yScale(initialDrops)} L ${xScale(totalDays)},${yScale(0)}`;

  // 3. Actual Burn (Teal) - Simulated progress
  const actualData = [
    { day: 0, val: 100 },
    { day: 3, val: 95 },
    { day: 7, val: 80 },
    { day: 10, val: 75 }, // scope creep happened here (total went to 110, so val technically is remaining. Let's just say drops remaining spiked)
    { day: 10, val: 85 }, // spike
    { day: 14, val: 60 },
    { day: 18, val: currentDrops },
  ];
  
  const actualPath = actualData.map((d, i) => 
    `${i === 0 ? 'M' : 'L'} ${xScale(d.day)},${yScale(d.val)}`
  ).join(' ');

  // 4. Predicted Burn (Cyan Glow) - from current day to predicted end
  const predictedPath = `M ${xScale(currentDay)},${yScale(currentDrops)} 
                         C ${xScale(currentDay + 2)},${yScale(currentDrops - 10)} 
                           ${xScale(predictedEndDay - 2)},${yScale(10)} 
                           ${xScale(predictedEndDay)},${yScale(0)}`;

  // Milestones
  const milestones = [
    { day: 10, label: 'Phase 1' },
    { day: 22, label: 'Beta' },
    { day: 30, label: 'Launch' }
  ];

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    
    // Map x to SVG coordinate system
    const svgX = (x / rect.width) * width;
    
    // Find closest day
    const day = Math.max(0, Math.min(totalDays, Math.round(((svgX - paddingX) / innerWidth) * totalDays)));
    
    // Interpolate value (simplistic for tooltip)
    let val = 0;
    let label = '';
    
    if (day <= currentDay) {
      // Find closest in actual
      const closest = actualData.reduce((prev, curr) => Math.abs(curr.day - day) < Math.abs(prev.day - day) ? curr : prev);
      val = closest.val;
      label = `Actual Remaining`;
    } else {
      // Simple linear interpolation for predicted
      const ratio = (day - currentDay) / (predictedEndDay - currentDay);
      val = Math.max(0, Math.round(currentDrops - (currentDrops * ratio)));
      label = `AI Prediction`;
      if (day >= predictedEndDay) val = 0;
    }

    setHoveredPoint({ x: xScale(day), y: yScale(val), label, value: val });
  };

  return (
    <div className="w-full h-full relative group">
      <svg 
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-full overflow-visible"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredPoint(null)}
      >
        {/* Background Grid */}
        <g className="stroke-white/[0.05] stroke-[1]">
          {[0, 25, 50, 75, 100].map(val => (
            <line key={`h-${val}`} x1={paddingX} y1={yScale(val)} x2={width - paddingX} y2={yScale(val)} />
          ))}
          {[0, 5, 10, 15, 20, 25, 30].map(day => (
            <line key={`v-${day}`} x1={xScale(day)} y1={paddingY} x2={xScale(day)} y2={height - paddingY} />
          ))}
        </g>

        {/* Milestones (Vertical lines) */}
        {milestones.map((m, i) => (
          <g key={`m-${i}`}>
            <line 
              x1={xScale(m.day)} y1={paddingY} 
              x2={xScale(m.day)} y2={height - paddingY} 
              className="stroke-white/20 stroke-2"
              strokeDasharray="4 4"
            />
            <text x={xScale(m.day)} y={paddingY - 10} className="fill-slate-400 text-[12px] font-bold text-anchor-middle" textAnchor="middle">
              {m.label}
            </text>
          </g>
        ))}

        {/* 1. Total Scope (Amber) */}
        <motion.path
          d={scopePath}
          fill="none"
          className="stroke-amber-500/50 stroke-[3]"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

        {/* 2. Ideal Burn (Grey Dashed) */}
        <motion.path
          d={idealPath}
          fill="none"
          className="stroke-slate-500/50 stroke-[3]"
          strokeDasharray="8 8"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

        {/* 3. Actual Burn (Teal) */}
        <motion.path
          d={actualPath}
          fill="none"
          className="stroke-teal-500 stroke-[5]"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        
        {/* Actual Burn Glow */}
        <motion.path
          d={actualPath}
          fill="none"
          className="stroke-teal-500/30 stroke-[15] blur-sm"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

        {/* 4. AI Predicted Burn (Cyan) */}
        <motion.path
          d={predictedPath}
          fill="none"
          className="stroke-cyan-400 stroke-[4]"
          strokeDasharray="6 6"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
        />
        {/* Cyan Glow */}
        <motion.path
          d={predictedPath}
          fill="none"
          className="stroke-cyan-400/50 stroke-[12] blur-md"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
        />

        {/* Current Node */}
        <circle cx={xScale(currentDay)} cy={yScale(currentDrops)} r="8" className="fill-[#020617] stroke-cyan-400 stroke-[4]" />
        <circle cx={xScale(currentDay)} cy={yScale(currentDrops)} r="16" className="fill-cyan-400/20 animate-ping" />

        {/* Hover Point / Tooltip Indicator */}
        {hoveredPoint && (
          <g>
            <line 
              x1={hoveredPoint.x} y1={paddingY} 
              x2={hoveredPoint.x} y2={height - paddingY} 
              className="stroke-white/30 stroke-[2]"
            />
            <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r="6" className="fill-white" />
            <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r="12" className="fill-white/20" />
          </g>
        )}
      </svg>

      {/* Glassmorphic HTML Tooltip */}
      <AnimatePresence>
        {hoveredPoint && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="absolute pointer-events-none bg-[#0a192f]/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl z-50 flex flex-col min-w-[200px]"
            style={{ 
              left: `${(hoveredPoint.x / width) * 100}%`, 
              top: `${(hoveredPoint.y / height) * 100}%`,
              transform: 'translate(-50%, -120%)'
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              {hoveredPoint.label === 'Actual Remaining' ? <Compass className="w-4 h-4 text-teal-400" /> : <Brain className="w-4 h-4 text-cyan-400" />}
              <span className={cn("text-xs font-bold uppercase tracking-widest", hoveredPoint.label === 'Actual Remaining' ? "text-teal-400" : "text-cyan-400")}>
                {hoveredPoint.label}
              </span>
            </div>
            <div className="text-3xl font-bold text-white leading-none mb-1">{hoveredPoint.value} <span className="text-sm font-medium text-slate-400">Drops</span></div>
            {hoveredPoint.label === 'AI Prediction' && (
              <div className="mt-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded w-fit border border-emerald-500/20">
                Predicted 4 days ahead of schedule
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
