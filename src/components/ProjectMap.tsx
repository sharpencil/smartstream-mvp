'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { STAGING_STREAMS, STAGING_DROPS, StagingDrop, StagingStream } from '@/lib/stagingData';
import { getStreamColor } from '@/lib/streams';
import { 
  Network, 
  Layers, 
  ArrowLeft, 
  CheckCircle, 
  Zap, 
  Clock, 
  User,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MY_USER_ID = "1";

type ViewMode = 'stream' | 'drop';
type TimeColumn = 'PAST' | 'CURRENT' | 'FUTURE';

interface NodePosition {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export function ProjectMap() {
  const [viewMode, setViewMode] = useState<ViewMode>('stream');
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All Status');
  const [ownerFilter, setOwnerFilter] = useState<string>('All Owners');
  const [nodePositions, setNodePositions] = useState<Record<string, NodePosition>>({});
  
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // --- Data Categorization & Mock Hydration ---

  // Standardize streams with some mock "current" status for demonstration
  const hydratedStreams = useMemo(() => {
    return STAGING_STREAMS.map(s => {
      const hydratedDrops = s.drops.map(d => {
        let status = d.status;
        const hash = parseInt(d.drop_id);
        if (hash === 8989 || hash === 8990) status = 'In Progress'; // Matches Calendar
        if (hash % 12 === 0) status = 'Completed';
        return { ...d, status };
      });
      return { ...s, drops: hydratedDrops };
    });
  }, []);

  const getStreamStatus = (stream: StagingStream): TimeColumn => {
    const total = stream.drops.length;
    const completed = stream.drops.filter(d => d.status.toLowerCase() === 'completed').length;
    const active = stream.drops.filter(d => ['active', 'in progress', 'delayed', 'blocked'].includes(d.status.toLowerCase())).length;
    
    if (completed === total && total > 0) return 'PAST';
    if (active > 0 || (completed > 0 && completed < total)) return 'CURRENT';
    return 'FUTURE';
  };

  const getDropStatus = (drop: StagingDrop): TimeColumn => {
    const status = drop.status.toLowerCase();
    if (status === 'completed') return 'PAST';
    if (['active', 'in progress', 'delayed', 'blocked'].includes(status)) return 'CURRENT';
    return 'FUTURE';
  };

  const streamsByColumn = useMemo(() => {
    const cols: Record<TimeColumn, StagingStream[]> = { PAST: [], CURRENT: [], FUTURE: [] };
    hydratedStreams.forEach(s => {
      // Filter by status if applicable (for streams, we filter based on their derived status)
      const status = getStreamStatus(s);
      if (statusFilter !== 'All Status' && status !== statusFilter.toUpperCase()) return;
      
      // Filter by owner (if any drop in the stream is owned by the filtered owner)
      if (ownerFilter !== 'All Owners') {
        const ownerName = ownerFilter === 'Me' ? 'Lena Vane' : ownerFilter; // Simplified mapping
        const hasOwner = s.drops.some(d => d.owner_id === (ownerFilter === 'Me' ? MY_USER_ID : '2')); // Mock ID check
        if (!hasOwner) return;
      }

      cols[status].push(s);
    });
    return cols;
  }, [hydratedStreams, statusFilter, ownerFilter]);

  const dropsByColumn = useMemo(() => {
    const cols: Record<TimeColumn, StagingDrop[]> = { PAST: [], CURRENT: [], FUTURE: [] };
    const source = selectedStreamId 
      ? hydratedStreams.find(s => s.id === selectedStreamId)?.drops || []
      : hydratedStreams.flatMap(s => s.drops);
    
    source.forEach(d => {
      const status = getDropStatus(d);
      if (statusFilter !== 'All Status' && status !== statusFilter.toUpperCase()) return;
      
      if (ownerFilter !== 'All Owners') {
        const isMe = d.owner_id === MY_USER_ID;
        if (ownerFilter === 'Me' && !isMe) return;
        if (ownerFilter !== 'Me' && isMe) return;
      }

      cols[status].push(d);
    });
    return cols;
  }, [selectedStreamId, hydratedStreams, statusFilter, ownerFilter]);

  // --- Dependency Logic ---

  const connections = useMemo(() => {
    const lines: Array<{ from: string; to: string }> = [];
    if (viewMode === 'drop') {
      const source = selectedStreamId 
        ? hydratedStreams.find(s => s.id === selectedStreamId)?.drops || []
        : hydratedStreams.flatMap(s => s.drops);

      source.forEach(drop => {
        if (drop.dependsOn) {
          drop.dependsOn.forEach(depId => {
            lines.push({ from: depId, to: drop.drop_id });
          });
        }
      });
    }
    return lines;
  }, [viewMode, selectedStreamId]);

  // Identify upstream and downstream dependencies
  const relatedNodeIds = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    const related = new Set<string>([selectedNodeId]);

    const findUpstream = (id: string) => {
      const drop = STAGING_DROPS.find(d => d.drop_id === id);
      if (drop?.dependsOn) {
        drop.dependsOn.forEach(depId => {
          if (!related.has(depId)) {
            related.add(depId);
            findUpstream(depId);
          }
        });
      }
    };

    const findDownstream = (id: string) => {
      STAGING_DROPS.forEach(d => {
        if (d.dependsOn?.includes(id)) {
          if (!related.has(d.drop_id)) {
            related.add(d.drop_id);
            findDownstream(d.drop_id);
          }
        }
      });
    };

    findUpstream(selectedNodeId);
    findDownstream(selectedNodeId);
    return related;
  }, [selectedNodeId]);

  // Update positions for SVG lines
  useEffect(() => {
    const updatePositions = () => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const nodes = canvasRef.current.querySelectorAll('[data-node-id]');
      const positions: Record<string, NodePosition> = {};

      nodes.forEach((node) => {
        const nodeId = node.getAttribute('data-node-id');
        if (nodeId) {
          const nodeRect = node.getBoundingClientRect();
          positions[nodeId] = {
            id: nodeId,
            x: nodeRect.left - rect.left,
            y: nodeRect.top - rect.top,
            w: nodeRect.width,
            h: nodeRect.height
          };
        }
      });
      setNodePositions(positions);
    };

    // Use a small delay to ensure DOM is ready
    const timer = setTimeout(updatePositions, 100);
    window.addEventListener('resize', updatePositions);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePositions);
    };
  }, [viewMode, selectedStreamId]);

  // --- Render Helpers ---

  const renderStatusIcon = (column: TimeColumn) => {
    switch (column) {
      case 'PAST': return <CheckCircle className="w-4 h-4 text-slate-500" />;
      case 'CURRENT': return <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />;
      case 'FUTURE': return <Clock className="w-4 h-4 text-teal-500/60" />;
    }
  };

  const getNodeStyle = (column: TimeColumn, isAssignedToMe: boolean) => {
    const common = "relative group cursor-pointer transition-all duration-500 rounded-3xl border backdrop-blur-xl overflow-hidden";
    
    if (isAssignedToMe) {
      return cn(common, "bg-cyan-950/20 border-cyan-500/50 shadow-[0_0_30px_rgba(34,211,238,0.2)]");
    }

    switch (column) {
      case 'PAST': 
        return cn(common, "bg-slate-950/40 border-white/5 opacity-50 hover:opacity-80 shadow-none");
      case 'CURRENT': 
        return cn(common, "bg-[#0a192f]/80 border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.1)]");
      case 'FUTURE': 
        return cn(common, "bg-transparent border-dashed border-teal-500/30 opacity-60 hover:opacity-100");
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#020617] relative overflow-hidden font-sans">
      {/* Bioluminescent Grid Background */}
      <div className="absolute inset-0 bg-[size:60px_60px] bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/50 to-[#020617] pointer-events-none" />
      
      {/* Header & Navigation */}
      <div className="sticky top-0 z-50 bg-[#020617]/95 backdrop-blur-xl px-10 h-[120px] border-b border-white/5 flex items-center justify-between shrink-0">
        <div className="relative h-full flex flex-col justify-center">
          <div className="flex items-center gap-3">
            {viewMode === 'drop' && (
              <button 
                onClick={() => {
                  setViewMode('stream');
                  setSelectedStreamId(null);
                }}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 transition-all mr-3"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-3xl font-bold tracking-tight text-slate-100">Project Map</h1>
          </div>
          
          {viewMode === 'drop' && (
            <div className="absolute top-[96px] left-0 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 whitespace-nowrap">
              <span>Streams</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-300">
                {selectedStreamId ? hydratedStreams.find(s => s.id === selectedStreamId)?.title : 'All Drops'}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {/* Filters */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-2 py-1">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-400 outline-none px-2 py-1 cursor-pointer hover:text-slate-200"
            >
              <option className="bg-[#0f172a]">All Status</option>
              <option className="bg-[#0f172a]">Past</option>
              <option className="bg-[#0f172a]">Current</option>
              <option className="bg-[#0f172a]">Future</option>
            </select>
            <div className="w-px h-4 bg-white/10" />
            <select 
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-400 outline-none px-2 py-1 cursor-pointer hover:text-slate-200"
            >
              <option className="bg-[#0f172a]">All Owners</option>
              <option className="bg-[#0f172a]">Me</option>
              <option className="bg-[#0f172a]">Team</option>
            </select>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 bg-[#0a192f]/60 border border-slate-800/60 rounded-full shadow-inner shadow-black/20">
            <button
              onClick={() => {
                setViewMode('stream');
                setSelectedStreamId(null);
              }}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-all outline-none",
                viewMode === 'stream' 
                  ? "bg-emerald-950/80 text-emerald-400 shadow-inner shadow-emerald-500/20 border border-emerald-500/20" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}
            >
              Stream Graph
            </button>
            <button
              onClick={() => setViewMode('drop')}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-all outline-none",
                viewMode === 'drop' 
                  ? "bg-emerald-950/80 text-emerald-400 shadow-inner shadow-emerald-500/20 border border-emerald-500/20" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}
            >
              Drop Graph
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Canvas */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-x-auto overflow-y-auto no-scrollbar"
      >
        <div 
          ref={canvasRef}
          className="relative min-w-[1400px] min-h-full px-10 py-12"
        >
          {/* SVG Overlay for Connections */}
          <svg className="absolute inset-0 pointer-events-none z-0 overflow-visible w-full h-full">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(45,212,191,0.1)" />
                <stop offset="50%" stopColor="rgba(45,212,191,0.5)" />
                <stop offset="100%" stopColor="rgba(45,212,191,0.1)" />
              </linearGradient>
            </defs>
            {viewMode === 'drop' && connections.map(({ from, to }) => {
              const start = nodePositions[from];
              const end = nodePositions[to];
              if (!start || !end) return null;

              const x1 = start.x + start.w;
              const y1 = start.y + start.h / 2;
              const x2 = end.x;
              const y2 = end.y + end.h / 2;

              const cp1x = x1 + (x2 - x1) / 2;
              const cp2x = x2 - (x2 - x1) / 2;

              const isPathActive = selectedNodeId ? (relatedNodeIds.has(from) && relatedNodeIds.has(to)) : true;
              const opacity = selectedNodeId ? (isPathActive ? 0.8 : 0.05) : 0.2;

              return (
                <g key={`${from}-${to}`}>
                  <path
                    d={`M ${x1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`}
                    fill="none"
                    stroke={isPathActive ? "url(#lineGradient)" : "rgba(255,255,255,0.1)"}
                    strokeWidth={isPathActive ? 2 : 1}
                    className="transition-all duration-500"
                    style={{ opacity }}
                  />
                  {isPathActive && (
                    <motion.path
                      d={`M ${x1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${x2} ${y2}`}
                      fill="none"
                      stroke="#2DD4BF"
                      strokeWidth={2}
                      strokeDasharray="10 10"
                      animate={{ strokeDashoffset: [-20, 0] }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      style={{ opacity: 0.4 }}
                    />
                  )}
                </g>
              );
            })}
          </svg>

          <div className="flex h-full gap-0 relative z-10">
            {(['PAST', 'CURRENT', 'FUTURE'] as TimeColumn[]).map((col, idx) => (
              <div key={col} className={cn(
                "flex-1 flex flex-col gap-6 px-10 relative",
                idx !== 0 && "border-l border-white/5"
              )}>
                <div className="flex items-center justify-between px-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      col === 'PAST' ? "bg-slate-700" : col === 'CURRENT' ? "bg-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.5)]" : "bg-slate-800 border border-white/5"
                    )} />
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">{col}</h2>
                  </div>
                  <div className="text-[10px] font-bold text-slate-600 bg-white/5 px-2 py-1 rounded">
                    {viewMode === 'stream' ? streamsByColumn[col].length : dropsByColumn[col].length} Nodes
                  </div>
                </div>

                <div className="flex-1 space-y-6 overflow-y-auto pr-2 no-scrollbar">
                  <AnimatePresence mode="popLayout">
                    {viewMode === 'stream' ? (
                      streamsByColumn[col].map((stream) => {
                        const color = getStreamColor(stream.colorKey).hex;
                        const completedCount = stream.drops.filter(d => d.status.toLowerCase() === 'completed').length;
                        return (
                          <motion.div
                            key={stream.id}
                            layoutId={stream.id}
                            data-node-id={stream.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ 
                              opacity: selectedNodeId ? (relatedNodeIds.has(stream.id) ? 1 : 0.3) : 1, 
                              x: 0,
                              y: [0, -5, 0],
                            }}
                            transition={{ 
                              y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 2 },
                              layout: { type: "spring", stiffness: 300, damping: 30 }
                            }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStreamId(stream.id);
                            setViewMode('drop');
                            setSelectedNodeId(stream.id);
                          }}
                          className={getNodeStyle(col, false)}
                        >
                          <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: color }} />
                          <div className="p-6 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">{stream.initials}</span>
                                {stream.drops.some(d => d.owner_id === MY_USER_ID) && (
                                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black uppercase text-emerald-400">
                                    My Stream
                                  </span>
                                )}
                              </div>
                              {renderStatusIcon(col)}
                            </div>
                              <div>
                                <h3 className={cn(
                                  "text-lg font-bold transition-colors leading-tight",
                                  col === 'PAST' ? "text-slate-500" : "text-slate-100 group-hover:text-cyan-400"
                                )}>
                                  {stream.title}
                                </h3>
                                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                                  {stream.description}
                                </p>
                              </div>
                              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Layers className="w-3 h-3 text-slate-600" />
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    {stream.drops.length} Drops · {col === 'PAST' ? 'Closed' : `${completedCount} Done`}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    ) : (
                      dropsByColumn[col].map((drop) => {
                        const stream = hydratedStreams.find(s => s.drops.some(d => d.drop_id === drop.drop_id));
                        const color = getStreamColor(stream?.colorKey || 'slate').hex;
                        const isMe = drop.owner_id === MY_USER_ID;
                        
                        return (
                          <motion.div
                            key={drop.drop_id}
                            layoutId={drop.drop_id}
                            data-node-id={drop.drop_id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ 
                              opacity: selectedNodeId ? (relatedNodeIds.has(drop.drop_id) ? 1 : 0.2) : 1, 
                              scale: 1,
                              y: [0, -5, 0]
                            }}
                            transition={{ 
                              y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 2 }
                            }}
                            onClick={() => {
                              if (selectedNodeId === drop.drop_id) setSelectedNodeId(null);
                              else setSelectedNodeId(drop.drop_id);
                            }}
                            className={getNodeStyle(col, isMe)}
                          >
                            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: color }} />
                            <div className="p-5 flex flex-col gap-3">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-mono font-bold text-slate-500">{drop.drop_id}</span>
                                {renderStatusIcon(col)}
                              </div>
                              <h3 className="text-sm font-bold text-slate-200 group-hover:text-cyan-400 transition-colors leading-snug">
                                {drop.title}
                              </h3>
                              <div className="flex items-center justify-between mt-1">
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
                                    <User className="w-3 h-3 text-slate-400" />
                                  </div>
                                  <span className="text-[10px] font-bold text-slate-400">{isMe ? 'Me' : 'Owner'}</span>
                                </div>
                                {isMe && col === 'CURRENT' && (
                                  <div className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-[8px] font-black uppercase text-cyan-400 animate-pulse">
                                    Your Focus
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-cyan-500/5 to-transparent pointer-events-none" />

      {/* Details Side Panel */}
      <AnimatePresence>
        {selectedNodeId && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute right-0 top-0 bottom-0 w-[400px] bg-[#0a192f]/95 backdrop-blur-xl border-l border-white/10 z-[100] shadow-[-20px_0_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-100">
                {hydratedStreams.flatMap(s => s.drops).some(d => d.drop_id === selectedNodeId) ? 'Drop Details' : 'Stream Details'}
              </h2>
              <button 
                onClick={() => setSelectedNodeId(null)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
              {(() => {
                const drop = hydratedStreams.flatMap(s => s.drops).find(d => d.drop_id === selectedNodeId);
                const stream = hydratedStreams.find(s => s.id === selectedNodeId || s.drops.some(d => d.drop_id === selectedNodeId));
                
                if (drop) {
                  const sColor = getStreamColor(stream?.colorKey || 'slate');
                  return (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded bg-black/40 border border-white/10 text-[10px] font-bold" style={{ color: sColor.hex }}>
                          {stream?.initials}
                        </span>
                        <span className="text-slate-500 font-mono text-xs">{drop.drop_id}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-100 leading-tight">{drop.title}</h3>
                      
                      <div className="flex flex-wrap gap-4 pt-2">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</span>
                          <span className="text-sm font-semibold text-slate-200">{drop.status}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Owner</span>
                          <span className="text-sm font-semibold text-slate-200">{drop.owner_id === MY_USER_ID ? 'Lena Vane (Me)' : 'Team Member'}</span>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-white/5">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Execution Steps</h4>
                        <div className="space-y-3">
                          {drop.tasks.map((task, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 group hover:border-white/10 transition-all">
                              <div className="mt-1 w-4 h-4 rounded border border-slate-700 flex items-center justify-center shrink-0">
                                {drop.status === 'Completed' && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                              </div>
                              <span className="text-sm text-slate-300 leading-relaxed">{task}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                } else if (stream) {
                  const sColor = getStreamColor(stream.colorKey);
                  return (
                    <div className="space-y-6">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg" style={{ backgroundColor: `${sColor.hex}20`, color: sColor.hex, border: `1px solid ${sColor.hex}40` }}>
                        {stream.initials}
                      </div>
                      <h3 className="text-2xl font-bold text-slate-100 leading-tight">{stream.title}</h3>
                      <p className="text-slate-400 leading-relaxed">{stream.description}</p>
                      
                      <div className="pt-6 border-t border-white/5">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Workstream Stats</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                            <span className="block text-2xl font-bold text-slate-100">{stream.drops.length}</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Drops</span>
                          </div>
                          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                            <span className="block text-2xl font-bold text-emerald-400">{stream.drops.filter(d => d.status === 'Completed').length}</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Completed</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
