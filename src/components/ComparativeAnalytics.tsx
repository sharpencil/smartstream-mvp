'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, BarChart, Bar, Legend, ReferenceLine
} from 'recharts';
import { FirmProject } from './OrgOwnerDashboard';
import { STREAM_COLORS } from '@/lib/streams';
import { cn } from '@/lib/utils';
import { Target, Zap, TrendingUp, Coins, Users } from 'lucide-react';

interface ComparativeAnalyticsProps {
  projects: FirmProject[];
  onProjectClick: (id: string) => void;
}

export function ComparativeAnalytics({ projects, onProjectClick }: ComparativeAnalyticsProps) {
  // ── Custom Bubble Component ──────────────────────────────────────────────
  const CustomBubble = (props: any) => {
    const { cx, cy, payload, size } = props;
    // Recharts passes 'size' (area). Radius = sqrt(size / PI). 
    const r = size ? Math.sqrt(size / Math.PI) : 10;
    const color = payload?.color || '#06b6d4'; // Fallback to cyan

    return (
      <motion.circle
        cx={cx}
        cy={cy}
        r={r}
        fill={color}
        whileHover={{ r: r * 1.25 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        style={{ 
          filter: `drop-shadow(0 0 15px ${color}60)`,
          cursor: 'pointer'
        }}
      />
    );
  };

  // ── Efficiency Quadrant Data ───────────────────────────────────────────────
  const quadrantData = useMemo(() => projects.map(p => ({
    id: p.id,
    name: p.name,
    x: p.forecastStability,
    y: p.avgVelocity,
    z: p.tokenBurn / 1000, // Size by cost
    color: (STREAM_COLORS[p.colorKey as string] || STREAM_COLORS.cyan).hex
  })), [projects]);

  // ── Resource Distribution Data ─────────────────────────────────────────────
  const resourceData = useMemo(() => projects.map(p => ({
    name: p.name,
    senior: p.resources.senior,
    mid: p.resources.mid,
    junior: p.resources.junior,
    total: p.resources.senior + p.resources.mid + p.resources.junior
  })).sort((a, b) => b.total - a.total), [projects]);

  return (
    <div className="flex flex-col gap-10 pb-20">
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        
        {/* Efficiency Quadrant (Scatter Plot) */}
        <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 blur-[100px] -z-10" />
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Target className="w-5 h-5 text-teal-400" /> Firm Health Matrix
              </h3>
              <p className="text-sm text-slate-500 mt-1">Velocity vs. Forecast Stability (Bubble size by ROI)</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-teal-500/50" /> Performance</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-cyan-500/50" /> Stability</div>
            </div>
          </div>

          <div className="h-[400px] w-full relative">
            {/* Quadrant Labels */}
            <div className="absolute top-2 right-2 text-[10px] font-black uppercase tracking-tighter text-teal-400/30 p-2 border border-teal-500/5 rounded-lg bg-teal-500/5">High-Performance Flow</div>
            <div className="absolute top-2 left-14 text-[10px] font-black uppercase tracking-tighter text-amber-400/30 p-2 border border-amber-500/5 rounded-lg bg-amber-500/5">Unstable Velocity</div>
            <div className="absolute bottom-12 right-2 text-[10px] font-black uppercase tracking-tighter text-cyan-400/30 p-2 border border-cyan-500/5 rounded-lg bg-cyan-500/5">Predictable but Slow</div>
            <div className="absolute bottom-12 left-14 text-[10px] font-black uppercase tracking-tighter text-rose-400/30 p-2 border border-rose-500/5 rounded-lg bg-rose-500/5">High-Risk / Friction</div>

            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Stability" 
                  unit="%" 
                  domain={[0, 100]} 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={10}
                  tick={{ fill: 'rgba(255,255,255,0.5)' }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Velocity" 
                  unit="%" 
                  domain={[0, 100]} 
                  stroke="rgba(255,255,255,0.3)" 
                  fontSize={10}
                  tick={{ fill: 'rgba(255,255,255,0.5)' }}
                />
                <ZAxis type="number" dataKey="z" range={[100, 2000]} name="Cost" />
                <Tooltip 
                  cursor={false}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#020617]/95 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-xl pointer-events-none">
                          <p className="text-sm font-bold text-white mb-1">{data.name}</p>
                          <div className="flex flex-col gap-1">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Stability: <span className="text-cyan-400">{data.x}%</span></p>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Velocity: <span className="text-teal-400">{data.y}%</span></p>
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Token Burn: <span className="text-amber-400">${data.z}k</span></p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine x={50} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                <ReferenceLine y={50} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                <Scatter 
                  name="Projects" 
                  data={quadrantData} 
                  shape={CustomBubble}
                  onClick={(e: any) => onProjectClick(e.id)} 
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resource Distribution Heatmap (Stacked Bar Chart) */}
        <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -z-10" />
           
           <div>
            <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" /> Resource Talent Heatmap
            </h3>
            <p className="text-sm text-slate-500 mt-1">Allocation by Seniority across all active Projects</p>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={resourceData}
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={10} tick={{ fill: 'rgba(255,255,255,0.5)' }} />
                <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.3)" fontSize={10} width={120} tick={{ fill: 'rgba(255,255,255,0.8)' }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                <Bar dataKey="senior" name="Senior" stackId="a" fill="#6366f1" radius={[0, 0, 0, 0]} barSize={24} />
                <Bar dataKey="mid" name="Mid-Level" stackId="a" fill="#818cf8" radius={[0, 0, 0, 0]} barSize={24} />
                <Bar dataKey="junior" name="Junior" stackId="a" fill="#c7d2fe" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Comparative Table Farm (ROI Leaderboard) */}
      <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 flex flex-col gap-8 shadow-2xl overflow-hidden">
        <div>
          <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" /> ROI Leaderboard
          </h3>
          <p className="text-sm text-slate-500 mt-1">Cross-project efficiency comparison and financial health</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500 pl-4">Project Name</th>
                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Cost / Drop</th>
                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Scope Creep</th>
                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Avg. Latency</th>
                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Resources</th>
                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => {
                const c = (STREAM_COLORS[p.colorKey as string] || STREAM_COLORS.cyan).hex;
                return (
                  <tr 
                    key={p.id} 
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    onClick={() => onProjectClick(p.id)}
                  >
                    <td className="py-5 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c, boxShadow: `0 0 10px ${c}` }} />
                        <span className="text-sm font-bold text-slate-200 group-hover:text-white">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-5">
                      <span className="text-sm font-mono font-bold text-amber-400">${p.costPerDrop.toLocaleString()}</span>
                    </td>
                    <td className="py-5 text-center">
                      <span className={cn(
                        "text-xs font-bold",
                        p.scopeCreep > 10 ? "text-rose-400" : p.scopeCreep > 5 ? "text-amber-400" : "text-emerald-400"
                      )}>{p.scopeCreep}%</span>
                    </td>
                    <td className="py-5 text-center">
                      <span className={cn(
                        "text-xs font-bold",
                        p.avgLatency > 120 ? "text-rose-400" : p.avgLatency > 110 ? "text-amber-400" : "text-emerald-400"
                      )}>{p.avgLatency}%</span>
                    </td>
                    <td className="py-5 text-center">
                      <span className="text-xs font-bold text-slate-300">
                        {p.resources.senior + p.resources.mid + p.resources.junior} <span className="text-[10px] text-slate-500 font-medium">Headcount</span>
                      </span>
                    </td>
                    <td className="py-5 text-right pr-4">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        p.status === 'healthy' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                        p.status === 'at-risk' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                        "bg-rose-500/10 border-rose-500/20 text-rose-400"
                      )}>
                        {p.status}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
