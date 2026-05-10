'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { STAGING_STREAMS, STAGING_DROPS, StagingDrop, StagingStream } from '@/lib/stagingData';
import { getStreamColor, STREAM_COLORS } from '@/lib/streams';
import { Network, FileText, Cpu, Search, Maximize2, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const MY_USER_ID = "1";

interface SelectedNode {
  type: 'stream' | 'drop';
  id: string;
}

export function ProjectMap() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedStreams, setExpandedStreams] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null);
  const [fullScreenDropId, setFullScreenDropId] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number, y: number }>>({});
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Toggle stream expansion
  const toggleStream = (id: string) => {
    setExpandedStreams(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Filtered data based on search
  const filteredStreams = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return STAGING_STREAMS;

    return STAGING_STREAMS.map(s => {
      const streamMatch = s.title.toLowerCase().includes(query) || s.description.toLowerCase().includes(query);
      const matchingDrops = s.drops.filter(d => 
        d.title.toLowerCase().includes(query) || 
        d.tasks.some(t => t.toLowerCase().includes(query))
      );
      
      if (streamMatch || matchingDrops.length > 0) {
        return { ...s, drops: matchingDrops };
      }
      return null;
    }).filter(Boolean) as StagingStream[];
  }, [searchQuery]);

  // Identify my streams
  const myStreamIds = useMemo(() => {
    const ids = new Set<string>();
    STAGING_STREAMS.forEach(s => {
      if (s.drops.some(d => d.owner_id === MY_USER_ID)) {
        ids.add(s.id);
      }
    });
    return ids;
  }, []);

  // Update positions for SVG lines
  useEffect(() => {
    let animationFrameId: number;
    
    const updatePositions = () => {
      if (!containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newPositions: Record<string, { x: number, y: number }> = {};
      
      const dropElements = containerRef.current.querySelectorAll('[data-drop-id]');
      dropElements.forEach(el => {
        const dropId = el.getAttribute('data-drop-id');
        if (dropId) {
          const rect = el.getBoundingClientRect();
          // Calculate center-left position for incoming lines and center-right for outgoing
          // For simplicity, let's just use center-left
          newPositions[dropId] = {
            x: rect.left - containerRect.left + containerRef.current!.scrollLeft,
            y: rect.top - containerRect.top + containerRef.current!.scrollTop + (rect.height / 2)
          };
        }
      });
      
      setNodePositions(prev => {
        const keys = Object.keys(newPositions);
        let changed = keys.length !== Object.keys(prev).length;
        if (!changed) {
          for (const k of keys) {
            if (!prev[k] || Math.abs(newPositions[k].x - prev[k].x) > 1 || Math.abs(newPositions[k].y - prev[k].y) > 1) {
              changed = true;
              break;
            }
          }
        }
        return changed ? newPositions : prev;
      });

      animationFrameId = requestAnimationFrame(updatePositions);
    };

    updatePositions();
    return () => cancelAnimationFrame(animationFrameId);
  }, [filteredStreams, expandedStreams, searchQuery]);

  // Calculate connections
  const connections = useMemo(() => {
    const lines: Array<{ id: string, start: {x:number, y:number}, end: {x:number, y:number}, isMyLink: boolean }> = [];
    
    filteredStreams.forEach(stream => {
      if (!expandedStreams.has(stream.id)) return; // Only draw lines to visible drops
      
      stream.drops.forEach(drop => {
        if (drop.dependsOn) {
          drop.dependsOn.forEach(depId => {
            const startPos = nodePositions[depId] || nodePositions[`staging-${depId}`]; // Parent
            const endPos = nodePositions[drop.drop_id]; // Child
            
            if (startPos && endPos) {
              const parentDrop = STAGING_DROPS.find(d => d.drop_id === depId || `staging-${d.drop_id}` === depId);
              const isMyLink = drop.owner_id === MY_USER_ID && parentDrop?.owner_id === MY_USER_ID;
              
              lines.push({
                id: `${depId}-${drop.drop_id}`,
                start: { x: startPos.x + 16, y: startPos.y }, // Start from slightly right of parent
                end: { x: endPos.x - 16, y: endPos.y }, // End slightly left of child
                isMyLink
              });
            }
          });
        }
      });
    });
    
    return lines;
  }, [nodePositions, filteredStreams, expandedStreams]);

  // Side Panel Content
  const renderSidePanel = () => {
    if (!selectedNode) return null;

    if (selectedNode.type === 'stream') {
      const stream = STAGING_STREAMS.find(s => s.id === selectedNode.id);
      if (!stream) return null;
      const sColor = getStreamColor(stream.colorKey);

      return (
        <div className="flex flex-col h-full overflow-y-auto">
          <div className="p-6 border-b border-white/5 relative">
            <div className="absolute inset-0 opacity-10" style={{ background: sColor.hex }} />
            <h2 className="text-2xl font-bold text-slate-100 relative z-10">{stream.title}</h2>
            <p className="text-sm font-semibold uppercase tracking-widest mt-2 relative z-10" style={{ color: sColor.hex }}>
              Stream Description
            </p>
          </div>
          <div className="p-6">
            <p className="text-slate-300 leading-relaxed">{stream.description}</p>
            <div className="mt-8">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Metadata</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Priority</span>
                  <span className="text-slate-200 font-medium">{stream.priority}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Complexity</span>
                  <span className="text-slate-200 font-medium">{stream.complexity} / 10</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Expected Time</span>
                  <span className="text-slate-200 font-medium">{stream.estimated_completion_time} weeks</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (selectedNode.type === 'drop') {
      const drop = STAGING_DROPS.find(d => d.drop_id === selectedNode.id);
      if (!drop) return null;
      
      const stream = STAGING_STREAMS.find(s => s.drops.some(d => d.drop_id === drop.drop_id));
      const sColor = getStreamColor(stream?.colorKey);

      return (
        <div className="flex flex-col h-full overflow-y-auto">
          <div className="p-6 border-b border-white/5 relative">
            <div className="absolute inset-0 opacity-10" style={{ background: sColor.hex }} />
            <div className="flex items-center gap-2 mb-2 relative z-10">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/40 border border-white/10" style={{ color: sColor.hex }}>
                {stream?.initials || 'UNK'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 relative z-10">{drop.title}</h2>
          </div>
          <div className="p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Tasks</h3>
            <div className="space-y-3">
              {drop.tasks.map((t, i) => (
                <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/5 text-sm text-slate-300">
                  <span className="text-slate-500 font-mono text-xs mr-2">{i+1}.</span>
                  {t}
                </div>
              ))}
              {drop.tasks.length === 0 && <p className="text-slate-500 italic text-sm">No specific tasks defined.</p>}
            </div>
            
            <div className="mt-8">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Technical Tags</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-slate-800 text-slate-400 rounded-md text-xs font-mono border border-slate-700">backend</span>
                <span className="px-2 py-1 bg-slate-800 text-slate-400 rounded-md text-xs font-mono border border-slate-700">api</span>
                <span className="px-2 py-1 bg-slate-800 text-slate-400 rounded-md text-xs font-mono border border-slate-700">v1</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderFullScreenDrop = () => {
    if (!fullScreenDropId) return null;
    const drop = STAGING_DROPS.find(d => d.drop_id === fullScreenDropId);
    if (!drop) return null;
    const stream = STAGING_STREAMS.find(s => s.drops.some(d => d.drop_id === drop.drop_id));
    const sColor = getStreamColor(stream?.colorKey);

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="fixed inset-0 z-[200] bg-[#020617]/95 backdrop-blur-2xl flex flex-col"
      >
        <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto px-8 py-16">
          <div className="flex justify-between items-start mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border" style={{ color: sColor.hex, borderColor: `${sColor.hex}40`, backgroundColor: `${sColor.hex}10` }}>
                  {stream?.title}
                </span>
                <span className="text-slate-500 font-mono text-sm">ID: {drop.drop_id}</span>
              </div>
              <h1 className="text-5xl font-bold text-slate-100 leading-tight">{drop.title}</h1>
            </div>
            <button 
              onClick={() => setFullScreenDropId(null)}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="bg-[#0a192f] border border-white/10 rounded-2xl p-10 shadow-2xl">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
              <Cpu className="w-6 h-6 text-slate-400" />
              <h2 className="text-2xl font-bold text-slate-200">Technical Task Execution Plan</h2>
            </div>
            
            <div className="space-y-4">
              {drop.tasks.map((t, i) => (
                <div key={i} className="flex items-start gap-4 p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-mono text-sm text-slate-400 font-bold shrink-0">
                    {i+1}
                  </div>
                  <p className="text-slate-300 text-lg leading-relaxed">{t}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
              <div>
                <h4 className="text-amber-400 font-bold mb-1">Architecture Note</h4>
                <p className="text-slate-400 text-sm leading-relaxed">Ensure backward compatibility when modifying existing API routes. Verify against the unified API Gateway rules before deployment.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex h-full w-full bg-[#020617] relative overflow-hidden">
      {/* Schematic Background */}
      <div className="absolute inset-0 bg-[size:40px_40px] bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] pointer-events-none" />

      {/* Main Content */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto h-full relative p-8 pb-32"
      >
        {/* SVG Dependencies Overlay */}
        <svg className="absolute top-0 left-0 w-full h-[5000px] pointer-events-none z-0">
          {connections.map(line => {
            // Cubic bezier path for flowing logic link
            const cp1x = line.start.x + Math.max(50, Math.abs(line.end.x - line.start.x) / 2);
            const cp2x = line.end.x - Math.max(50, Math.abs(line.end.x - line.start.x) / 2);
            const pathData = `M ${line.start.x} ${line.start.y} C ${cp1x} ${line.start.y}, ${cp2x} ${line.end.y}, ${line.end.x} ${line.end.y}`;
            
            return (
              <path
                key={line.id}
                d={pathData}
                fill="none"
                stroke={line.isMyLink ? '#2DD4BF' : '#475569'}
                strokeWidth={line.isMyLink ? 2 : 1.5}
                strokeDasharray={line.isMyLink ? 'none' : '4 4'}
                className="transition-all duration-300"
                style={{ 
                  filter: line.isMyLink ? 'drop-shadow(0 0 4px rgba(45,212,191,0.8))' : 'none',
                  opacity: line.isMyLink ? 0.8 : 0.3
                }}
              />
            );
          })}
        </svg>

        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5 sticky top-0 bg-[#020617]/90 backdrop-blur-md z-40 relative">
          <h1 className="text-3xl font-bold font-sans tracking-tight text-slate-100 flex items-center gap-3">
            Project Map
          </h1>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search specs, tags, drops..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0a192f] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all"
            />
          </div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">

          {/* Tree Layout */}
          <div className="flex flex-col gap-6 ml-8 border-l-2 border-slate-800 pl-8 relative">
            {filteredStreams.map(stream => {
              const isExpanded = expandedStreams.has(stream.id);
              const sColor = getStreamColor(stream.colorKey);
              const isMyStream = myStreamIds.has(stream.id);

              return (
                <div key={stream.id} className="relative">
                  {/* Stream Node */}
                  <div 
                    onClick={() => {
                      toggleStream(stream.id);
                      setSelectedNode({ type: 'stream', id: stream.id });
                    }}
                    className={cn(
                      "w-full bg-[#0a192f]/60 backdrop-blur-md rounded-2xl p-5 border cursor-pointer transition-all hover:scale-[1.01] flex items-center justify-between group",
                      isMyStream 
                        ? "border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.1)]" 
                        : "border-white/5 hover:border-white/10 shadow-lg"
                    )}
                  >
                    {/* Connection line from parent trunk */}
                    <div className="absolute top-1/2 -left-8 w-8 h-[2px] bg-slate-800 -translate-y-1/2" />
                    
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
                        style={{ backgroundColor: `${sColor.hex}15`, color: sColor.hex, border: `1px solid ${sColor.hex}30` }}
                      >
                        {stream.initials}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-200 group-hover:text-white transition-colors">{stream.title}</h3>
                        <p className="text-xs text-slate-500">{stream.drops.length} Technical Drops</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isMyStream && (
                        <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[10px] font-bold uppercase tracking-wider text-cyan-400 animate-pulse">
                          You Are Here
                        </div>
                      )}
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
                        <FileText className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Drops List (Sub-nodes) */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col gap-4 pl-12 py-6 relative">
                          {/* Trunk line for drops */}
                          <div className="absolute top-0 bottom-6 left-6 w-[2px] bg-slate-800" />

                          {stream.drops.map(drop => {
                            const isMyActive = drop.owner_id === MY_USER_ID && (drop.status === 'In Progress' || drop.status === 'Active');
                            const isMyUpcoming = drop.owner_id === MY_USER_ID && drop.status === 'Not Started';
                            const isSelected = selectedNode?.id === drop.drop_id;

                            return (
                              <div 
                                key={drop.drop_id} 
                                className="relative flex items-center"
                              >
                                {/* Connection line to drop */}
                                <div className="absolute top-1/2 -left-6 w-6 h-[2px] bg-slate-800 -translate-y-1/2" />
                                
                                <div 
                                  data-drop-id={drop.drop_id}
                                  onClick={() => setSelectedNode({ type: 'drop', id: drop.drop_id })}
                                  className={cn(
                                    "flex-1 bg-slate-900/80 rounded-xl p-4 border cursor-pointer transition-all hover:bg-slate-800 flex items-center justify-between group",
                                    isSelected ? "border-slate-500 bg-slate-800 shadow-xl z-10" : "border-slate-800",
                                    isMyActive ? "border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.6)] z-10" : "",
                                    isMyUpcoming ? "border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.2)] animate-pulse" : ""
                                  )}
                                >
                                  <div>
                                    <h4 className="text-sm font-semibold text-slate-200">{drop.title}</h4>
                                    <div className="flex items-center gap-2 mt-2">
                                      <span className="text-[10px] uppercase font-mono text-slate-500">{drop.drop_id}</span>
                                      <span className="w-1 h-1 rounded-full bg-slate-700" />
                                      <span className="text-[10px] text-slate-400">{drop.tasks.length} tasks</span>
                                    </div>
                                  </div>
                                  
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setFullScreenDropId(drop.drop_id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-400 text-slate-400 transition-all flex items-center gap-2"
                                  >
                                    <span className="text-[10px] font-bold uppercase tracking-wider hidden md:block">Details</span>
                                    <Maximize2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Technical Specs Side Panel */}
      <div className={cn(
        "w-96 border-l border-white/5 bg-[#0a192f] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] absolute right-0 top-0 bottom-0 z-50",
        selectedNode ? "translate-x-0 shadow-[-20px_0_40px_rgba(0,0,0,0.5)]" : "translate-x-full"
      )}>
        {selectedNode && (
          <>
            <button 
              onClick={() => setSelectedNode(null)}
              className="absolute top-4 right-4 z-50 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            {renderSidePanel()}
          </>
        )}
      </div>

      {/* Full Screen Focus Modal */}
      <AnimatePresence>
        {renderFullScreenDrop()}
      </AnimatePresence>
    </div>
  );
}
