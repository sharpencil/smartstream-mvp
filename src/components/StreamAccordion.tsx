'use client';

import * as Accordion from '@radix-ui/react-accordion';
import * as Popover from '@radix-ui/react-popover';
import { ChevronDown, Link2, Code2, ShieldAlert, Database, Palette, Lock, Network, Map, Activity, CheckCircle2, CircleDashed, AlertTriangle, Anchor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GLOBAL_STREAMS, STREAM_COLORS, Reference, DropDef } from '@/lib/streams';

interface StreamData {
  id: string;
  streamKey: string;
  title: string;
  status: string;
  priority: string;
  dependsOn: string[];
  drops: DropDef[];
}

const DRAFTED_STREAMS: StreamData[] = [
  {
    id: 's1',
    streamKey: 's_auth',
    title: 'Identity & Authentication Hub',
    status: 'Ready',
    priority: 'High Priority',
    dependsOn: [],
    drops: [
      { id: 'd1', title: 'OAuth Provider Linkage', skill: 'Security / Next.js', effort: '< 1d', icon: Lock, state: 'In Queue' },
      { id: 'd2', title: 'JWT Refresh Lifecycle', skill: 'Backend', effort: '< 1d', icon: ShieldAlert, state: 'In Queue', references: [{ type: 'doc', label: 'Auth Spec' }] },
      { id: 'd3', title: 'Route Protection Middleware', skill: 'Frontend', effort: '< 1d', icon: Code2, state: 'In Queue' },
    ]
  },
  {
    id: 's2',
    streamKey: 's_infra',
    title: 'Core Database Migration',
    status: 'Ready',
    priority: 'Critical',
    dependsOn: ['s_auth'],
    drops: [
      { id: 'd4', title: 'Supabase Schema Architecture', skill: 'Postgres', effort: '< 1d', icon: Database, state: 'In Queue' },
      { id: 'd5', title: 'Edge Function Indexing', skill: 'Backend', effort: '< 1d', icon: Network, state: 'In Queue', references: [{ type: 'stream', targetId: 's_auth' }] },
    ]
  },
  {
    id: 's3',
    streamKey: 's_ux',
    title: 'User Settings & Configurations',
    status: 'Pending',
    priority: 'Low Priority',
    dependsOn: ['s_auth', 's_infra'],
    drops: [
      { id: 'd6', title: 'Profile Avatar Uploads', skill: 'UI / UX', effort: '< 1d', icon: Palette, state: 'In Queue' },
    ]
  }
];

const ACTIVE_STREAMS: StreamData[] = [
  {
    id: 'as1',
    streamKey: 's_auth',
    title: 'Identity & Authentication Hub',
    status: 'In Progress',
    priority: 'High Priority',
    dependsOn: [],
    drops: [
      { id: 'd_a0', title: 'OAuth Provider Linkage', skill: 'Security', effort: '< 1d', icon: Lock, state: 'Completed' },
      { id: 'd_a1', title: 'Route Protection', skill: 'Frontend', effort: '< 1d', icon: ShieldAlert, state: 'In Progress' }
    ]
  },
  {
    id: 'as2',
    streamKey: 's_infra',
    title: 'Platform Infrastructure & Cloud',
    status: 'In Progress',
    priority: 'Critical',
    dependsOn: ['s_auth'],
    drops: [
      { id: 'd_a2', title: 'Database Migration', skill: 'Postgres', effort: '< 1d', icon: Database, state: 'Completed', references: [{ type: 'stream', targetId: 's_auth' }] },
      { id: 'd_a3', title: 'Edge Caching Node', skill: 'DevOps', effort: '< 1d', icon: Network, state: 'In Progress', references: [{ type: 'doc', label: 'Cloud Spec' }] },
      { id: 'd_a4', title: 'Release Candidate Automation', skill: 'DevOps', effort: '< 1d', icon: Network, state: 'In Queue' },
    ]
  },
  {
    id: 'as3',
    streamKey: 's_ux',
    title: 'User Experience Revamp',
    status: 'In Progress',
    priority: 'Medium Priority',
    dependsOn: ['s_auth'],
    drops: [
      { id: 'd_a5', title: 'Dashboard Reskin', skill: 'UI / UX', effort: '< 1d', icon: Palette, state: 'In Progress' },
      { id: 'd_a6', title: 'Component Library Update', skill: 'Frontend', effort: '< 1d', icon: Code2, state: 'In Queue' },
    ]
  },
  {
    id: 'as4',
    streamKey: 's_billing',
    title: 'Global Payment Gateway',
    status: 'In Progress',
    priority: 'High Priority',
    dependsOn: ['s_infra', 's_ux'],
    drops: [
      { id: 'd_a7', title: 'Stripe Integration', skill: 'Backend', effort: '< 1d', icon: Database, state: 'In Queue', references: [{ type: 'stream', targetId: 's_infra' }] },
      { id: 'd_a8', title: 'Checkout Flow', skill: 'Frontend', effort: '< 1d', icon: Code2, state: 'In Queue', references: [{ type: 'design', label: 'Figma' }] },
    ]
  },
  {
    id: 'as5',
    streamKey: 's_comms',
    title: 'Notification & Email Engine',
    status: 'In Progress',
    priority: 'Low Priority',
    dependsOn: ['s_billing'],
    drops: [
      { id: 'd_a9', title: 'Email Templates', skill: 'Frontend', effort: '< 1d', icon: Code2, state: 'In Progress' },
      { id: 'd_a10', title: 'Push Notification Service', skill: 'Backend', effort: '< 1d', icon: Network, state: 'In Queue' },
    ]
  }
];

export function StreamAccordion({ type = 'drafted' }: { type?: 'drafted' | 'active' }) {
  const streams = type === 'drafted' ? DRAFTED_STREAMS : ACTIVE_STREAMS;

  return (
    <Accordion.Root type="multiple" defaultValue={['s1', 's2']} className="w-full flex flex-col gap-4 z-10 w-full max-w-4xl mx-auto">
      {streams.map((stream) => {
        const globalDef = GLOBAL_STREAMS[stream.streamKey];
        const streamColorTw = globalDef ? STREAM_COLORS[globalDef.colorKey].tw : 'slate-500';
        const streamColorHex = globalDef ? STREAM_COLORS[globalDef.colorKey].hex : '#64748b';
        
        const counts = { queue: 0, progress: 0, completed: 0 };
        stream.drops.forEach(d => {
          if (d.state === 'In Queue') counts.queue++;
          else if (d.state === 'In Progress') counts.progress++;
          else counts.completed++;
        });

        return (
          <Accordion.Item 
            key={stream.id} 
            value={stream.id} 
            className="border border-white/5 bg-[#0a192f]/60 backdrop-blur-xl rounded-[24px] overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-all focus-within:border-cyan-500/30 group"
          >
            <Accordion.Header className="flex m-0">
              <Accordion.Trigger className={cn(
                "flex flex-1 items-center justify-between p-6 transition-all w-full outline-none relative overflow-hidden",
                stream.priority === 'Critical' ? "hover:bg-rose-950/10 focus-visible:border-rose-500/30" : "hover:bg-cyan-950/20",
                type === 'active' && "hover:bg-transparent bg-slate-900/40"
              )}>
                {/* Visual Identity Decorator */}
                <div className="absolute top-0 left-0 bottom-0 w-1 opacity-80" style={{ backgroundColor: streamColorHex }} />

                <div className="flex items-center gap-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 border" style={{ borderColor: `${streamColorHex}40`, boxShadow: `inset 0 0 10px ${streamColorHex}20` }}>
                    <span className="font-mono text-sm font-bold" style={{ color: streamColorHex }}>{globalDef?.initials || 'UNK'}</span>
                  </div>
                  <div className="flex flex-col items-start gap-1">
                    <h3 className="text-lg font-semibold text-slate-100 tracking-wide">{stream.title}</h3>
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest",
                        stream.priority === 'Critical' ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" :
                        stream.priority === 'High Priority' ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                        "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      )}>
                        {stream.priority}
                      </span>
                      <span className="text-xs text-slate-500">{stream.drops.length} Drops</span>
                      
                      {stream.dependsOn && stream.dependsOn.length > 0 && (
                        <div className="flex items-center gap-2 ml-4 flex-wrap">
                          {stream.dependsOn.map(depKey => {
                             const depDef = GLOBAL_STREAMS[depKey];
                             if (!depDef) return null;
                             const depColorHex = STREAM_COLORS[depDef.colorKey].hex;
                             return (
                               <div key={depKey} className="flex items-center gap-1.5 px-2 py-0.5 rounded border bg-slate-900/80 shadow-inner group/dep cursor-help transition-all hover:bg-slate-800" style={{ borderColor: `${depColorHex}50` }}>
                                 <Anchor className="w-3 h-3" style={{ color: depColorHex }} />
                                 <span className="text-[9px] font-bold tracking-widest text-slate-500 uppercase mt-px">Depends On</span>
                                 <span className="text-[10px] font-bold px-1.5 py-0.5 rounded ml-1 transition-all group-hover/dep:brightness-125" style={{ backgroundColor: `${depColorHex}25`, color: depColorHex }}>
                                   {depDef.initials}
                                 </span>
                               </div>
                             );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <ChevronDown className="w-5 h-5 text-slate-400 group-data-[state=open]:rotate-180 group-data-[state=open]:text-cyan-400 transition-transform duration-300" />
              </Accordion.Trigger>
            </Accordion.Header>
            
            <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down border-t border-white/5 bg-[#020617]/50 relative">
              <div className="p-6 flex flex-col gap-4">
                
                {/* Stream Status Bar */}
                {type === 'active' && (
                  <div className="flex items-center gap-4 bg-slate-900/80 border border-slate-800/50 rounded-xl p-3 mb-2 shadow-inner">
                    <div className="flex flex-col flex-1 items-center justify-center border-r border-slate-700/50">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">In Queue</span>
                      <div className="flex items-center gap-2"><CircleDashed className="w-4 h-4 text-slate-400" /><span className="text-sm font-bold text-slate-300">{counts.queue}</span></div>
                    </div>
                    <div className="flex flex-col flex-1 items-center justify-center border-r border-slate-700/50">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">In Progress</span>
                      <div className="flex items-center gap-2"><Activity className="w-4 h-4 text-cyan-400" /><span className="text-sm font-bold text-cyan-200">{counts.progress}</span></div>
                    </div>
                    <div className="flex flex-col flex-1 items-center justify-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Completed</span>
                      <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span className="text-sm font-bold text-emerald-200">{counts.completed}</span></div>
                    </div>
                  </div>
                )}

                {stream.drops.map((drop, idx) => (
                  <Popover.Root key={drop.id}>
                    <Popover.Trigger asChild>
                      <button className="w-full flex items-center justify-between px-6 py-3.5 rounded-full bg-slate-900/60 border border-white/5 hover:border-cyan-500/20 hover:bg-[#0a192f] shadow-inner transition-all group/drop cursor-pointer outline-none relative overflow-hidden">
                        
                        {/* State visualizer overlay line */}
                        <div className={cn("absolute bottom-0 left-6 right-6 h-[1px]", drop.state === 'Completed' ? "bg-emerald-500/50" : drop.state === 'In Progress' ? "bg-cyan-500/50" : "bg-transparent")} />

                        <div className="flex items-center gap-4">
                          <span className="text-xs font-mono text-slate-600 font-bold w-4">{idx + 1}.</span>
                          <drop.icon className={cn("w-5 h-5 transition-colors", drop.state === 'Completed' ? "text-emerald-500" : drop.state === 'In Progress' ? "text-cyan-400" : "text-slate-400")} />
                          <div className="flex flex-col items-start gap-0.5">
                            <span className={cn("text-sm font-medium transition-colors", drop.state === 'Completed' ? "text-emerald-100" : drop.state === 'In Progress' ? "text-cyan-100" : "text-slate-300")}>{drop.title}</span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest">{drop.skill}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="px-3 py-1 bg-slate-800/80 rounded-lg border border-slate-700/50">
                            <span className="text-xs font-bold text-slate-400 font-mono">{drop.effort}</span>
                          </div>
                        </div>
                      </button>
                    </Popover.Trigger>
                    <Popover.Portal>
                      <Popover.Content 
                        sideOffset={15} 
                        side="bottom" 
                        align="start"
                        className="w-80 bg-[#0a192f]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(34,211,238,0.15)] p-5 outline-none z-50 animate-in fade-in zoom-in-95 duration-200"
                      >
                        <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                          <Map className="w-4 h-4 text-cyan-400" />
                          <h4 className="text-sm font-semibold text-slate-200 tracking-wide">Timeline Mini-Map</h4>
                        </div>
                        
                        {/* Interactive abstract mini-map representation */}
                        <div className="bg-[#020617] rounded-xl p-3 border border-slate-800/60 relative overflow-hidden h-28 flex flex-col gap-1.5">
                           <div className="absolute top-0 bottom-0 left-12 w-0.5 bg-cyan-900/40" />
                           
                           {/* Lane 1 */}
                           <div className="flex items-center h-5 w-full relative z-10 gap-2">
                              <div className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700 shrink-0" />
                              <div className="flex items-center gap-1 flex-1">
                                <div className="h-2 w-8 bg-slate-800 rounded-full" />
                                <div className="h-2 w-12 bg-slate-800 rounded-full" />
                              </div>
                           </div>
                           
                           {/* Highlight Lane */}
                           <div className="flex items-center h-5 w-full relative z-10 gap-2 bg-cyan-950/20 -mx-3 px-3 py-4 border-y border-cyan-900/30">
                              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-cyan-600 to-blue-800 shrink-0 flex items-center justify-center border border-cyan-400/50"><span className="text-[6px] text-white">●</span></div>
                              <div className="flex items-center gap-1 flex-1 relative">
                                <div className="h-2 w-8 bg-slate-800 rounded-full" />
                                
                                {/* Target Blinking Element */}
                                <div className="h-2.5 w-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.6)] animate-pulse" />
                                
                                <div className="h-2 w-10 bg-slate-800 rounded-full" />
                                
                                <div className="absolute -top-3 left-12 text-[8px] font-bold text-cyan-300 bg-cyan-950/80 px-1 rounded">DROP LOCATION</div>
                              </div>
                           </div>
                           
                           {/* Lane 3 */}
                           <div className="flex items-center h-5 w-full relative z-10 gap-2">
                              <div className="w-4 h-4 rounded-full bg-slate-800 border border-slate-700 shrink-0" />
                              <div className="flex items-center gap-1 flex-1">
                                <div className="h-2 w-20 bg-slate-800 rounded-full" />
                              </div>
                           </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                           <span className="text-xs text-slate-500">Lane Assignment: <strong className="text-slate-300">Unassigned</strong></span>
                           <button className="text-xs text-cyan-400 font-bold hover:text-cyan-300 transition-colors">GO TO DROP</button>
                        </div>
                        
                        <Popover.Arrow className="fill-[#0a192f] opacity-95 w-4 h-2" />
                      </Popover.Content>
                    </Popover.Portal>
                  </Popover.Root>
                ))}
              </div>
            </Accordion.Content>
          </Accordion.Item>
        );
      })}
    </Accordion.Root>
  );
}
