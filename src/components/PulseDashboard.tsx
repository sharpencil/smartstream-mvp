'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AgentPanel, FeedItem } from './AgentPanel';
import { Drop, DropState } from './Drop';
import { VitalsBar } from './VitalsBar';
import { cn } from '@/lib/utils';
import { GLOBAL_STREAMS, STREAM_COLORS, Reference } from '@/lib/streams';
import { Zap } from 'lucide-react';

interface DropData {
  id: string;
  lane: number;
  title: string;
  state: DropState;
  effortHours: number;
  xOffset: number;
  isBlocked?: boolean;
  references?: Reference[];
  streamId?: string;
}

const TEAM_MEMBERS = [
  { id: '1', name: 'Sarah' },
  { id: '2', name: 'Mike' },
  { id: '3', name: 'Alex' },
  { id: '4', name: 'Elena' },
  { id: '5', name: 'David' },
];

const INITIAL_DROPS: DropData[] = [
  { id: 'd1', lane: 0, title: 'Auth Service', state: 'completed', effortHours: 2.5, xOffset: 20, streamId: 's_auth' },
  { id: 'd2', lane: 0, title: 'API Routes', state: 'active', effortHours: 2, xOffset: 260, streamId: 's_auth', references: [{ type: 'doc', label: 'API Spec' }] },
  { id: 'd3', lane: 0, title: 'Role Based Access', state: 'ghost', effortHours: 3, xOffset: 480, streamId: 's_infra' },
  { id: 'd3b', lane: 0, title: 'OAuth Providers', state: 'ghost', effortHours: 2, xOffset: 770, streamId: 's_ux' },
  
  { id: 'd4', lane: 1, title: 'DB Migration', state: 'completed', effortHours: 3, xOffset: 50, streamId: 's_infra' },
  { id: 'd5', lane: 1, title: 'QA Defect Fixes', state: 'active', effortHours: 2, xOffset: 320, isBlocked: true, streamId: 's_infra', references: [{ type: 'stream', targetId: 's_auth' }] },
  { id: 'd5b', lane: 1, title: 'Performance Testing', state: 'ghost', effortHours: 2, xOffset: 550, streamId: 's_comms' },
  { id: 'd5c', lane: 1, title: 'Release Candidate', state: 'ghost', effortHours: 1.5, xOffset: 750, streamId: 's_comms' },
  
  { id: 'd6', lane: 2, title: 'Onboarding UI', state: 'completed', effortHours: 4, xOffset: 0, streamId: 's_ux' },
  { id: 'd7', lane: 2, title: 'User Settings', state: 'ghost', effortHours: 3, xOffset: 450, streamId: 's_ux' },
  { id: 'd7b', lane: 2, title: 'Profile Editing', state: 'ghost', effortHours: 2, xOffset: 730, streamId: 's_billing' },
  
  { id: 'd8', lane: 3, title: 'Payment Gateway', state: 'active', effortHours: 4.5, xOffset: 80, streamId: 's_billing', references: [{ type: 'design', label: 'Figma' }] },
  { id: 'd9', lane: 3, title: 'Invoice PDF', state: 'ghost', effortHours: 2, xOffset: 550, streamId: 's_auth' },
  { id: 'd9b', lane: 3, title: 'Tax Integration', state: 'ghost', effortHours: 3, xOffset: 750, streamId: 's_billing' },
  
  { id: 'd10', lane: 4, title: 'Email Templates', state: 'completed', effortHours: 2, xOffset: 30, streamId: 's_comms' },
  { id: 'd11', lane: 4, title: 'Notification Logs', state: 'completed', effortHours: 1.5, xOffset: 220, streamId: 's_comms' },
  { id: 'd12', lane: 4, title: 'Analytics Event', state: 'active', effortHours: 1.2, xOffset: 370, streamId: 's_infra' },
  { id: 'd13', lane: 4, title: 'Dashboard Chart', state: 'ghost', effortHours: 2, xOffset: 530, streamId: 's_ux', references: [{ type: 'stream', targetId: 's_billing' }] },
  { id: 'd14', lane: 4, title: 'Export PDF', state: 'ghost', effortHours: 1.5, xOffset: 730, streamId: 's_comms' },
];

// Explicit Cross-Lane Dependency Tree
const DEPENDENCIES: Record<string, string[]> = {
  'd2': ['d7'], // Sarah's active API Routes -> impacts Alex's User Settings
  'd5': ['d9', 'd13'] // Mike's QA Fixes -> impacts Elena's Invoice PDF & David's Chart
};

export function PulseDashboard() {
  const [drops, setDrops] = useState<DropData[]>(INITIAL_DROPS);
  const [zoomScale, setZoomScale] = useState(1);
  const [hoveredStreamId, setHoveredStreamId] = useState<string | null>(null);
  const [activeStreamPathId, setActiveStreamPathId] = useState<string | null>('s_auth');
  
  const [memberVelocity, setMemberVelocity] = useState<Record<string, number>>({
    '1': 0, '2': -4, '3': 5, '4': 12, '5': -2
  });
  
  const [isAgentOpen, setIsAgentOpen] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [feed, setFeed] = useState<FeedItem[]>([
    {
      id: 'f1',
      type: 'suggestion',
      text: <span><span className="text-cyan-400 font-medium">Suggestion:</span> Sarah is projected to finish &quot;API Auth&quot; 2 hours early today. Should I pull &quot;Role Based Access&quot; into her afternoon Ghost Drop?</span>
    },
    {
      id: 'f2',
      type: 'alert',
      text: <span><span className="text-rose-400 font-medium">Blocker Risk:</span> The current active drop for Mike depends on the database migration, which has encountered 3 retry failures in QA.</span>
    }
  ]);

  const NOW_LINE_X = 420;

  const handleDropAction = (id: string, action: 'complete' | 'block' | 'in-progress' | 'ghost' | 'remove', rationale?: string) => {
    setIsThinking(true);
    
    // Defer the recalculation logic to simulate "Oracle Thinking"
    setTimeout(() => {
      setDrops(prev => {
        const targetDropIdx = prev.findIndex(d => d.id === id);
        if (targetDropIdx === -1) return prev;

        const target = prev[targetDropIdx];
        const lane = target.lane;
        const shiftsLeft = action === 'complete' || action === 'remove';
        const shiftsRight = action === 'block';
        const unblocks = (action === 'in-progress' || action === 'ghost') && target.isBlocked;

        const SHIFT_AMOUNT = 80;

        let newDrops = [...prev];

        if (action === 'remove') {
          newDrops = newDrops.filter(d => d.id !== id);
        } else {
          let newState = target.state;
          if (action === 'complete') newState = 'completed';
          if (action === 'in-progress') newState = 'active';
          if (action === 'ghost') newState = 'ghost';

          // Apply new status to the target drop
          newDrops[targetDropIdx] = {
            ...target,
            state: newState,
            isBlocked: action === 'block',
            xOffset: shiftsLeft ? target.xOffset - 20 : target.xOffset // shift the completed drop back a little visually
          };
        }

        // Apply Velocity impact adjustments on specific member
        if (action === 'complete') {
            setMemberVelocity(mPrev => ({...mPrev, [lane + 1]: (mPrev[(lane + 1).toString()] || 0) + 2}));
        } else if (action === 'block') {
            setMemberVelocity(mPrev => ({...mPrev, [lane + 1]: (mPrev[(lane + 1).toString()] || 0) - 3}));
        }

        // Recursive or list-based ripple for subsequent drops in lane + dependent drops
        const processShift = (dropId: string, shiftVal: number) => {
          const deps = DEPENDENCIES[dropId] || [];
          deps.forEach(depId => {
            const depIdx = newDrops.findIndex(d => d.id === depId);
            if (depIdx > -1) {
              newDrops[depIdx] = { ...newDrops[depIdx], xOffset: newDrops[depIdx].xOffset + shiftVal };
            }
          });
        };

        if (shiftsLeft || shiftsRight || unblocks) {
          let offsetShift = 0;
          if (shiftsLeft) offsetShift = -SHIFT_AMOUNT;
          if (shiftsRight) offsetShift = SHIFT_AMOUNT;
          if (unblocks) offsetShift = -SHIFT_AMOUNT; // Reverse the block shift
          
          // Affect all subsequent objects in the same lane
          for (let i = 0; i < newDrops.length; i++) {
            if (newDrops[i].id !== id && newDrops[i].lane === lane && newDrops[i].xOffset > target.xOffset) {
              newDrops[i] = { ...newDrops[i], xOffset: newDrops[i].xOffset + offsetShift };
            }
          }

          // Affect explicit cross-lane dependencies
          processShift(id, offsetShift);
        }

        return newDrops;
      });

      // Push Oracle Notification
      if (action === 'remove') {
        setFeed(prev => [{
          id: Date.now().toString(),
          type: 'update',
          text: <span><span className="text-blue-400 font-medium">Flow Re-leveled:</span> Drop removed from lane. Timeline automatically pulled forward.</span>
        }, ...prev]);
      } else if (action === 'complete') {
        setFeed(prev => [{
          id: Date.now().toString(),
          type: 'update',
          text: <span><span className="text-blue-400 font-medium">Flow Re-leveled:</span> Drop completed early. Velocity registered. Timeline organically shifted forward to cover capacity.</span>
        }, ...prev]);
      } else if (action === 'block') {
        setFeed(prev => [{
          id: Date.now().toString(),
          type: 'alert',
          text: <span><span className="text-rose-400 font-medium">Ripple Alert:</span> Drop was blocked{rationale ? ` due to: "${rationale}"` : ''}. Connected dependency shifted back dynamically. Velocity negatively impacted.</span>
        }, ...prev]);
      } else if (action === 'ghost') {
        setFeed(prev => [{
          id: Date.now().toString(),
          type: 'suggestion',
          text: <span><span className="text-cyan-400 font-medium">State Reverted:</span> Drop rescheduled to Ghost projection. Recalculation stabilized.</span>
        }, ...prev]);
      } else {
        setFeed(prev => [{
          id: Date.now().toString(),
          type: 'suggestion',
          text: <span><span className="text-cyan-400 font-medium">State Reverted:</span> Drop set back to In Progress. Flow remains steady.</span>
        }, ...prev]);
      }

      setIsThinking(false);
    }, 1200); // 1.2s Oracle delay
  };

  // Build the SVG path for the active stream
  const getStreamPathData = () => {
    if (!activeStreamPathId) return null;
    
    // Filter drops by stream and sort by actual x-offset
    const streamDrops = drops
      .filter(d => d.streamId === activeStreamPathId)
      .sort((a, b) => a.xOffset - b.xOffset);

    if (streamDrops.length < 2) return null;

    let pathD = "";
    streamDrops.forEach((d, i) => {
      const width = Math.max(120 * zoomScale, (d.effortHours * 80) * zoomScale);
      const x = (d.xOffset * zoomScale) + (width / 2);
      // Lane index * 100px min-height + 50 (center of lane)
      const y = (d.lane * 100) + 50; 
      
      if (i === 0) {
        pathD += `M ${x} ${y} `;
      } else {
        const prev = streamDrops[i-1];
        const prevWidth = Math.max(120 * zoomScale, (prev.effortHours * 80) * zoomScale);
        const prevX = (prev.xOffset * zoomScale) + (prevWidth / 2);
        const prevY = (prev.lane * 100) + 50;
        
        // Bezier curve to make it flowing
        const midX = (prevX + x) / 2;
        pathD += `C ${midX} ${prevY}, ${midX} ${y}, ${x} ${y} `;
      }
    });
    return pathD;
  };

  return (
    <div 
      className="relative w-full h-full flex flex-col transition-all duration-500 ease-in-out bg-[#020617] text-slate-50"
    >
      <VitalsBar isOpen={isAgentOpen} />
      
      <div className="flex-1 flex relative">
        {/* Scrollable Flow Area */}
        <div className={cn(
          "flex-1 flex flex-col pt-8 pb-32 pl-8 overflow-x-auto no-scrollbar relative min-w-0 transition-all duration-500",
          isAgentOpen ? "pr-[392px]" : "pr-8"
        )}>
          
          <div className="sticky left-0 right-0 top-0 z-40 flex justify-between items-center mb-16 pr-12 pointer-events-none">
             
             {/* Stream Active Path Selector */}
             <div className="inline-flex items-center gap-2 bg-[#0a192f]/80 backdrop-blur-md rounded-[14px] p-1.5 border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] pointer-events-auto">
               <Zap className="w-4 h-4 ml-2 text-teal-400" />
               <span className="text-xs font-bold text-slate-300 mr-2 tracking-wide uppercase">Stream Flow</span>
               <div className="flex gap-1">
                 <button onClick={() => setActiveStreamPathId(null)} className={cn("px-3 py-1 rounded-[10px] text-[10px] font-bold tracking-widest transition-all", !activeStreamPathId ? "bg-slate-800 text-slate-200" : "text-slate-500 hover:text-slate-300 hover:bg-white/5")}>NONE</button>
                 {Object.values(GLOBAL_STREAMS).map(stream => {
                   const colorHex = STREAM_COLORS[stream.colorKey].hex;
                   const isActive = activeStreamPathId === stream.id;
                   return (
                     <button 
                       key={stream.id} 
                       onClick={() => setActiveStreamPathId(prev => prev === stream.id ? null : stream.id)} 
                       className="px-3 py-1 rounded-[10px] text-[10px] font-bold tracking-widest transition-all"
                       style={{ 
                         backgroundColor: isActive ? `${colorHex}30` : 'transparent',
                         color: isActive ? colorHex : '#64748b',
                         boxShadow: isActive ? `inset 0 0 10px ${colorHex}20` : 'none'
                       }}
                     >
                       {stream.initials}
                     </button>
                   );
                 })}
               </div>
             </div>

             {/* Zoom Scale Selector */}
             <div className="inline-flex bg-[#0a192f]/80 backdrop-blur-md rounded-[14px] p-1 border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] pointer-events-auto">
               <button onClick={() => setZoomScale(1)} className={cn("px-4 py-1.5 rounded-[10px] text-xs font-bold tracking-wide transition-all", zoomScale === 1 ? "bg-teal-950/80 text-teal-400 shadow-inner shadow-teal-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-white/5")}>8h (Focus)</button>
               <button onClick={() => setZoomScale(0.6)} className={cn("px-4 py-1.5 rounded-[10px] text-xs font-bold tracking-wide transition-all", zoomScale === 0.6 ? "bg-teal-950/80 text-teal-400 shadow-inner shadow-teal-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-white/5")}>24h (Daily)</button>
               <button onClick={() => setZoomScale(0.25)} className={cn("px-4 py-1.5 rounded-[10px] text-xs font-bold tracking-wide transition-all", zoomScale === 0.25 ? "bg-teal-950/80 text-teal-400 shadow-inner shadow-teal-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-white/5")}>1w (Overview)</button>
             </div>
          </div>
          
          {/* Real-time Indicator (Now Line) */}
          <div 
            className="absolute top-[120px] bottom-0 w-[2px] bg-gradient-to-b from-cyan-400/0 via-cyan-400 to-cyan-400/0 z-10 animate-time-pulse before:absolute before:content-[''] before:left-1/2 before:-translate-x-1/2 before:-top-3 before:w-3.5 before:h-3.5 before:bg-cyan-400 before:rounded-full before:shadow-[0_0_10px_rgba(34,211,238,1)] after:content-['NOW'] after:absolute after:-top-8 after:left-1/2 after:-translate-x-1/2 after:text-cyan-400 after:text-xs after:font-bold after:tracking-widest transition-all duration-500"
            style={{ left: (NOW_LINE_X * zoomScale) + 240 }} 
          />

          {/* Swimlanes */}
          <div className="flex flex-col gap-0 mt-2 relative">
            
            {/* Stream Active Path SVG Overlay */}
            {activeStreamPathId && (
              <svg className="absolute top-0 bottom-0 pointer-events-none z-10 overflow-visible" style={{ left: 240, width: '4000px', height: '100%' }}>
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <motion.path 
                  d={getStreamPathData() || ""}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.6 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  fill="none"
                  stroke={STREAM_COLORS[GLOBAL_STREAMS[activeStreamPathId].colorKey].hex}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="8 8"
                  filter="url(#glow)"
                  className="animate-[dash_3s_linear_infinite]"
                  style={{ strokeDashoffset: 0 }}
                />
              </svg>
            )}

            {TEAM_MEMBERS.map((member, laneIndex) => {
              const laneDrops = drops.filter(d => d.lane === laneIndex);

              return (
                <div key={member.id} className="relative flex items-center min-h-[100px] rounded-[30px] border border-slate-800/30 bg-[#0a192f]/10 hover:bg-[#0a192f]/30 transition-colors group">
                  
                  {/* Member Info (Sticky) */}
                  <div className="w-60 shrink-0 flex items-center justify-between py-4 px-6 sticky left-0 z-30 backdrop-blur-sm rounded-l-[30px] border-r border-[#0a192f]/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-950 to-[#0a192f] border border-cyan-800/30 flex items-center justify-center shadow-lg group-hover:border-cyan-400/50 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all">
                        <span className="text-cyan-200 font-bold text-lg">{member.name.charAt(0)}</span>
                      </div>
                      <span className="font-semibold text-slate-300 group-hover:text-white transition-colors">{member.name}</span>
                    </div>

                    {/* Velocity Gauge */}
                    {(() => {
                      const vel = memberVelocity[member.id] || 0;
                      const isPositive = vel >= 0;
                      return (
                        <div className={cn("text-[10px] font-bold px-2 py-1 rounded-md transition-all duration-500", isPositive ? "bg-green-950/40 text-green-400 border border-green-500/30 shadow-[0_0_8px_rgba(34,197,94,0.1)]" : "bg-amber-950/40 text-amber-500 border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.1)]")}>
                          {isPositive ? '+' : ''}{vel}%
                        </div>
                      )
                    })()}
                  </div>

                  {/* Timeline Track Layer */}
                  <div className="flex-1 h-full relative border-l border-slate-800/30">
                    <div className="absolute inset-0 border-t border-dashed border-slate-800/50 top-1/2 w-[4000px] -z-10" />
                    
                    <div className="absolute inset-0 flex items-center">
                      {laneDrops.map(drop => {
                        const streamDef = drop.streamId ? GLOBAL_STREAMS[drop.streamId] : undefined;
                        const streamColorHex = streamDef ? STREAM_COLORS[streamDef.colorKey].hex : undefined;

                        return (
                          <Drop 
                            key={drop.id}
                            id={drop.id}
                            title={drop.title}
                            state={drop.state}
                            effortHours={drop.effortHours}
                            xOffset={drop.xOffset}
                            isBlocked={drop.isBlocked}
                            references={drop.references}
                            onAction={handleDropAction}
                            zoomScale={zoomScale}
                            streamId={drop.streamId}
                            streamInitials={streamDef?.initials}
                            streamColorHex={streamColorHex}
                            hoveredStreamId={hoveredStreamId}
                            activeStreamId={activeStreamPathId}
                            onHoverStream={setHoveredStreamId}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Agent Insights Panel */}
        <AgentPanel 
          feed={feed} 
          briefing="Current Momentum is high. All Streams are healthy. Oracle suggests reallocating 2 Drops from Developer B to Developer A to optimize for Friday’s milestone."
          isThinking={isThinking} 
          isOpen={isAgentOpen} 
          onToggle={setIsAgentOpen} 
        />
      </div>
    </div>
  );
}
