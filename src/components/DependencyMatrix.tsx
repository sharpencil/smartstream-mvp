'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Search, AlertTriangle, Blocks } from 'lucide-react';
import { STREAM_COLORS, getStreamColor } from '@/lib/streams';
import { STAGING_STREAMS, STAGING_DROPS } from '@/lib/stagingData';

export function DependencyMatrix() {
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);

  // 1. Build stream-to-stream dependency graph
  const streamGraph = useMemo(() => {
    const graph = new Map<string, Set<string>>();
    STAGING_STREAMS.forEach(s => graph.set(s.id, new Set()));

    STAGING_STREAMS.forEach(stream => {
      stream.drops.forEach(drop => {
        (drop.dependsOn || []).forEach(depId => {
          const parentDrop = STAGING_DROPS.find(sd => sd.drop_id === depId);
          if (parentDrop && parentDrop.streamId && parentDrop.streamId !== stream.id) {
            graph.get(stream.id)!.add(parentDrop.streamId);
          }
        });
      });
    });
    return graph;
  }, []);

  // 2. Calculate Layers (Ranks) based on dependency depth
  const pipelineLayers = useMemo(() => {
    const streamLayers: Record<string, number> = {};
    const getRank = (id: string, visited = new Set<string>()): number => {
      if (visited.has(id)) return 0;
      if (streamLayers[id] !== undefined) return streamLayers[id];
      
      visited.add(id);
      const deps = Array.from(streamGraph.get(id) || []);
      if (deps.length === 0) {
        streamLayers[id] = 0;
      } else {
        streamLayers[id] = 1 + Math.max(...deps.map(d => getRank(d, new Set(visited))));
      }
      return streamLayers[id];
    };

    STAGING_STREAMS.forEach(s => getRank(s.id));
    
    const maxLayer = Math.max(...Object.values(streamLayers), 0);
    const layers = Array.from({ length: Math.min(maxLayer + 1, 4) }, (_, i) => {
      const titles = ['Foundations', 'Core Infrastructure', 'Intelligence Layer', 'Applications'];
      return {
        id: `layer${i}`,
        title: titles[i] || `Stage 0${i + 1}`,
        streams: STAGING_STREAMS.filter(s => streamLayers[s.id] === i || (i === 3 && streamLayers[s.id] > 3)).map(s => s.id)
      };
    }).filter(l => l.streams.length > 0);

    return layers;
  }, [streamGraph]);

  // Helper to get stream by ID from staging
  const getStream = (id: string) => STAGING_STREAMS.find(s => s.id === id);

  // Dynamically extract cross-stream dependencies (Critical Bridges)
  const CRITICAL_BRIDGES = useMemo(() => {
    const bridges: Record<string, { targetStream: string; sourceDrop: string; targetDrop: string }[]> = {};
    
    STAGING_STREAMS.forEach(stream => {
      stream.drops.forEach(drop => {
        if (drop.dependsOn) {
          drop.dependsOn.forEach((depId: string) => {
            const parentDrop = STAGING_DROPS.find(sd => sd.drop_id === depId);
            if (parentDrop && parentDrop.streamId && parentDrop.streamId !== stream.id) {
              if (!bridges[stream.id]) bridges[stream.id] = [];
              // Prevent duplicates
              if (!bridges[stream.id].find(b => b.targetStream === parentDrop.streamId && b.sourceDrop === drop.title)) {
                bridges[stream.id].push({
                  targetStream: parentDrop.streamId,
                  sourceDrop: drop.title,
                  targetDrop: parentDrop.title
                });
              }
            }
          });
        }
      });
    });
    return bridges;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full flex-1 flex flex-col relative overflow-hidden bg-[#061124] rounded-3xl border border-slate-800/60 shadow-inner shadow-cyan-900/10 min-h-[600px] mt-4"
    >
      <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#0a192f]/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-950/50 rounded-lg border border-indigo-500/20 shadow-[0_0_15px_rgba(129,140,248,0.1)]">
            <Network className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-slate-100 tracking-wide">Stream Dependencies</h2>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">Dynamic Cross-Stream Pipeline Matrix</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Find stream..." className="bg-black/30 border border-slate-800 rounded-full py-1.5 pl-9 pr-4 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50 transition-colors w-48" />
          </div>
        </div>
      </div>

      <div className="flex-1 w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/40 via-[#061124] to-[#061124] relative overflow-auto p-12 custom-scrollbar">

        {/* Draw SVG connections */}
        <svg className="absolute inset-0 pointer-events-none w-full h-full" style={{ zIndex: 0 }}>
          <defs>
            <filter id="glow-line">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill="#94a3b8" />
            </marker>
            <marker id="arrowhead-active" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill="#22d3ee" />
            </marker>
          </defs>

          <g fill="none">
            {STAGING_STREAMS.map(stream => {
              const deps = Array.from(streamGraph.get(stream.id) || []);
              return deps.map(depId => {
                let startLayerIdx = -1, startStreamIdx = -1;
                let endLayerIdx = -1, endStreamIdx = -1;

                pipelineLayers.forEach((l, lIdx) => {
                  const sIdx = l.streams.indexOf(depId);
                  if (sIdx !== -1) { startLayerIdx = lIdx; startStreamIdx = sIdx; }
                  
                  const eIdx = l.streams.indexOf(stream.id);
                  if (eIdx !== -1) { endLayerIdx = lIdx; endStreamIdx = eIdx; }
                });

                if (startLayerIdx === -1 || endLayerIdx === -1) return null;

                const isRelated = selectedStreamId === stream.id || selectedStreamId === depId;
                
                const startX = 128 + 40 + (startLayerIdx * (256 + 80)) + 256;
                const startY = 150 + (startStreamIdx * 160) + 60;
                
                const endX = 128 + 40 + (endLayerIdx * (256 + 80));
                const endY = 150 + (endStreamIdx * 160) + 60;

                const cp1X = startX + 60;
                const cp2X = endX - 60;

                return (
                  <motion.path 
                    key={`${depId}-${stream.id}`} 
                    initial={{ pathLength: 0, opacity: 0, strokeWidth: 1.5, stroke: '#94a3b8' }}
                    animate={{ 
                      pathLength: 1, 
                      opacity: isRelated ? 1 : 0.4,
                      stroke: isRelated ? '#22d3ee' : '#94a3b8',
                      strokeWidth: isRelated ? 3 : 1.5
                    }}
                    d={`M ${startX} ${startY} C ${cp1X} ${startY}, ${cp2X} ${endY}, ${endX} ${endY}`} 
                    markerEnd={isRelated ? "url(#arrowhead-active)" : "url(#arrowhead)"}
                    transition={{ duration: 1, ease: "easeInOut" }}
                  />
                );
              });
            })}
          </g>
        </svg>

        <div className="flex gap-20 h-full w-max min-h-[400px] relative z-10 mx-auto px-10">

          {pipelineLayers.map((layer, idx) => (
            <div key={layer.id} className="flex flex-col gap-6 w-64 relative">

              {/* Layer Header */}
              <div className="flex flex-col items-center mb-4">
                <div className="bg-slate-900/80 px-3 py-1 rounded-md border border-slate-800 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                  Stage 0{idx + 1}
                </div>
                <h3 className="text-sm font-semibold text-slate-300 mt-2">{layer.title}</h3>
              </div>

              {/* Streams */}
              <div className="flex flex-col gap-12 mt-4 items-center justify-start flex-1">
                {layer.streams.map(streamId => {
                  const stream = getStream(streamId);
                  if (!stream) return null;
                  const colorHex = getStreamColor(stream.colorKey).hex;

                  return (
                    <motion.div
                      key={stream.id}
                      onClick={() => setSelectedStreamId(prev => prev === stream.id ? null : stream.id)}
                      className="w-full bg-[#0a192f] border border-slate-700/60 rounded-2xl p-5 shadow-xl shadow-black/40 relative group cursor-pointer"
                      style={{ boxShadow: `inset 0 0 20px ${colorHex}15` }}
                    >
                      <div className="absolute top-0 left-0 bottom-0 w-1.5 rounded-l-2xl opacity-80" style={{ backgroundColor: colorHex }} />

                      <div className="flex items-center justify-between mb-3 pl-2">
                        <div className="w-10 h-8 rounded-lg bg-slate-900 border flex items-center justify-center font-bold text-[10px]" style={{ borderColor: `${colorHex}40`, color: colorHex }}>
                          {stream.initials}
                        </div>
                        <div className="flex items-center gap-1 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800">
                          <Blocks className="w-3 h-3 text-slate-500" />
                          <span className="text-[10px] font-bold text-slate-400">ACTIVE</span>
                        </div>
                      </div>

                      <h4 className="text-sm font-semibold text-slate-200 pl-2 leading-tight">{stream.title}</h4>

                      <AnimatePresence>
                        {selectedStreamId === stream.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0, marginTop: 0 }}
                            animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                            className="overflow-hidden pl-2"
                          >
                            <div className="pt-3 border-t border-slate-700/50">
                              <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-2 block">Critical Bridges</span>
                              {CRITICAL_BRIDGES[stream.id] ? (
                                <div className="flex flex-col gap-3">
                                  {CRITICAL_BRIDGES[stream.id].map((bridge, bIdx) => {
                                    const tStream = getStream(bridge.targetStream);
                                    const tColorHex = tStream ? getStreamColor(tStream.colorKey).hex : '#94a3b8';
                                    return (
                                      <div key={bIdx} className="flex flex-col gap-1.5 p-2 bg-black/20 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-1.5">
                                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colorHex }} />
                                          <span className="text-[10px] font-semibold text-slate-300 line-clamp-1">{bridge.sourceDrop}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 pl-1.5">
                                          <div className="w-px h-3 bg-slate-700 ml-[2px]" />
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <div className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: tColorHex }} />
                                          <span className="text-[10px] font-semibold text-slate-400 line-clamp-1">
                                            {tStream?.initials}: {bridge.targetDrop}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="text-[10px] text-slate-500 italic py-2">No cross-stream drops.</div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Interactive dependency highlight */}
                      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ boxShadow: `0 0 30px ${colorHex}40`, border: `1px solid ${colorHex}80` }} />
                    </motion.div>
                  )
                })}
              </div>

            </div>
          ))}

        </div>
      </div>
    </motion.div>
  );
}
