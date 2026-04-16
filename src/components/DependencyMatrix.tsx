'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Search, AlertTriangle, Blocks } from 'lucide-react';
import { STREAM_COLORS } from '@/lib/streams';
import { STAGING_STREAMS, STAGING_DROPS } from '@/lib/stagingData';

export function DependencyMatrix() {
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);

  // Group STAGING_STREAMS into logical layers
  const pipelineLayers = [
    {
      id: 'layer1',
      title: 'Data Foundations',
      streams: STAGING_STREAMS.filter(s => s.id === 'DB_CONSOL').map(s => s.id)
    },
    {
      id: 'layer2',
      title: 'Core Routing',
      streams: STAGING_STREAMS.filter(s => s.id === 'ROUTE_BUILDER' || s.id === 'LOOKUP_API').map(s => s.id)
    },
    {
      id: 'layer3',
      title: 'AI Intelligence',
      streams: STAGING_STREAMS.filter(s => s.id === 'AI_EVAL').map(s => s.id)
    }
  ];

  // Helper to get stream by ID from staging
  const getStream = (id: string) => STAGING_STREAMS.find(s => s.id === id);

  // Dynamically extract cross-stream dependencies (Critical Bridges)
  const CRITICAL_BRIDGES: Record<string, { targetStream: string; sourceDrop: string; targetDrop: string }[]> = {};

  STAGING_STREAMS.forEach(stream => {
    stream.drops.forEach(drop => {
      if (drop.dependsOn) {
        drop.dependsOn.forEach(depId => {
          const parentDrop = STAGING_DROPS.find(sd => sd.drop_id === depId);
          if (parentDrop && parentDrop.streamId !== stream.id) {
            // This is a cross-stream dependency!
            if (!CRITICAL_BRIDGES[stream.id]) CRITICAL_BRIDGES[stream.id] = [];
            CRITICAL_BRIDGES[stream.id].push({
              targetStream: parentDrop.streamId || 'UNKNOWN',
              sourceDrop: drop.title,
              targetDrop: parentDrop.title
            });
          }
        });
      }
    });
  });

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
              <polygon points="0 0, 6 2, 0 4" fill="#334155" />
            </marker>
          </defs>

          {/* Logic flow for the 3-stage pipeline */}
          <g stroke="#334155" strokeWidth="2" fill="none" opacity="0.6">
            {/* DB Consol (Layer 1) to Routing (Layer 2) */}
            <path d="M 280 200 C 350 200, 350 120, 420 120" markerEnd="url(#arrowhead)" />
            <path d="M 280 200 C 350 200, 350 280, 420 280" markerEnd="url(#arrowhead)" />

            {/* Routing (Layer 2) to AI (Layer 3) */}
            <path d="M 680 120 C 750 120, 750 200, 820 200" markerEnd="url(#arrowhead)" />
            <path d="M 680 280 C 750 280, 750 200, 820 200" markerEnd="url(#arrowhead)" />
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
              <div className="flex flex-col gap-12 mt-4 items-center justify-center h-[300px]">
                {layer.streams.map(streamId => {
                  const stream = getStream(streamId);
                  if (!stream) return null;
                  const colorHex = STREAM_COLORS[stream.colorKey].hex;

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
                                    const tColorHex = tStream ? STREAM_COLORS[tStream.colorKey].hex : '#94a3b8';
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
