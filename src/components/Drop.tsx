'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CheckCircle2, CircleDashed, AlertTriangle, Link2, FileText, Palette } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { useState } from 'react';
import { Reference, GLOBAL_STREAMS, STREAM_COLORS } from '@/lib/streams';

export type DropState = 'completed' | 'active' | 'ghost';

export interface DropProps {
  id: string;
  title: string;
  state: DropState;
  effortHours: number; // For width relative to the day
  xOffset: number; // Simulated absolute positioning on the timeline
  isBlocked?: boolean;
  references?: Reference[];
  zoomScale?: number;
  streamId?: string;
  streamColorHex?: string;
  streamInitials?: string;
  hoveredStreamId?: string | null;
  activeStreamId?: string | null;
  onHoverStream?: (streamId: string | null) => void;
  onAction?: (id: string, action: 'complete' | 'block' | 'in-progress' | 'ghost' | 'remove', rationale?: string) => void;
}

export function Drop({ id, title, state, effortHours, xOffset, isBlocked, references, onAction, zoomScale = 1, streamId, streamColorHex, streamInitials, hoveredStreamId, activeStreamId, onHoverStream }: DropProps) {
  const isGhost = state === 'ghost';
  const isCompleted = state === 'completed';
  const isActive = state === 'active';
  const [rationale, setRationale] = useState('');

  // Base drop styles for the organic 'pebble' shape
  // effortHours dictates base width roughly
  const width = Math.max(120 * zoomScale, (effortHours * 80) * zoomScale); 
  const actualLeft = xOffset * zoomScale;
  
  const isHighlighted = (hoveredStreamId === streamId || activeStreamId === streamId) && streamId != null;
  
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <motion.button
          layout
          data-id={id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: isHighlighted ? 1.05 : 1,
            boxShadow: isHighlighted && streamColorHex 
              ? `0 0 20px ${streamColorHex}80, inset 0 0 10px ${streamColorHex}20` 
              : isCompleted 
                ? "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" 
                : isActive && !isBlocked 
                  ? "0 0 15px rgba(6,182,212,0.3)" 
                  : isActive && isBlocked 
                    ? "0 0 15px rgba(225,29,72,0.3)" 
                    : "none"
          }}
          whileHover={{ scale: 1.02, filter: "brightness(1.1)" }}
          onMouseEnter={() => streamId && onHoverStream?.(streamId)}
          onMouseLeave={() => onHoverStream?.(null)}
          transition={{ type: "spring", stiffness: 300, damping: isHighlighted ? 15 : 30 }}
          style={{ width, position: 'absolute', left: actualLeft }}
          className={cn(
            "h-16 rounded-full flex items-center pl-6 pr-4 cursor-pointer backdrop-blur-md border relative overflow-hidden group transition-all duration-300 z-20 outline-none",
            isCompleted && "bg-green-950/20 border-green-500/30 w-full hover:bg-green-900/30",
            isActive && !isBlocked && "bg-gradient-to-r from-blue-900/60 to-cyan-900/40 border-cyan-500/50 hover:border-cyan-400",
            isActive && isBlocked && "bg-gradient-to-r from-rose-900/60 to-rose-950/40 border-rose-500/50 hover:border-rose-400",
            isGhost && !isBlocked && "bg-teal-900/20 border-teal-500/30 border-dashed hover:border-teal-500/50 hover:bg-teal-900/30",
            isGhost && isBlocked && "bg-rose-900/20 border-rose-500/30 border-dashed hover:border-rose-500/50 hover:bg-rose-900/30",
            isHighlighted && "z-30 border-white/40 shadow-xl"
          )}
        >
          {/* Stream Tag */}
          {streamInitials && (
            <div className="absolute top-1.5 right-3 text-[8px] font-bold tracking-[0.2em] opacity-50 mix-blend-plus-lighter" style={{ color: streamColorHex || '#fff' }}>
              {streamInitials}
            </div>
          )}
          <div className="flex items-center gap-3 w-full">
            {isBlocked ? (
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
            ) : isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
            ) : isActive ? (
              <div className="w-5 h-5 shrink-0 rounded-full border-2 border-cyan-400 flex items-center justify-center animate-pulse">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              </div>
            ) : (
              <CircleDashed className="w-5 h-5 text-teal-500/50 shrink-0" />
            )}
            
            <span className={cn(
              "text-sm font-medium truncate pointer-events-none",
              isCompleted ? "text-green-100" : isActive ? "text-cyan-50" : "text-teal-200/70"
            )}>
              {title}
            </span>
          </div>

          {isActive && !isBlocked && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent w-[200%] animate-[shimmer_2s_infinite] -z-10" />
          )}
          {isActive && isBlocked && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-rose-400/10 to-transparent w-[200%] animate-[shimmer_2s_infinite] -z-10" />
          )}
        </motion.button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content 
          sideOffset={10} 
          side="top" 
          className="w-64 bg-[#0a192f]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.15)] p-4 outline-none z-50 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 mb-1 border-b border-white/10 pb-4 relative">
              {/* Stream Initials in Popover Corner */}
              {streamInitials && (
                <div className="absolute top-0 right-0 text-[10px] font-bold tracking-[0.2em] opacity-40 uppercase" style={{ color: streamColorHex || '#fff' }}>
                  {streamInitials}
                </div>
              )}
              
              <h4 className="text-sm font-bold text-cyan-50 pr-12 drop-shadow-sm leading-tight">{title}</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Popover.Close asChild>
                <button 
                  onClick={() => onAction?.(id, 'in-progress')}
                  disabled={isActive && !isBlocked}
                  className="bg-cyan-500/90 hover:bg-cyan-400 border border-cyan-400/50 text-[#020617] text-xs font-bold py-2 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                >
                  {isBlocked ? 'Unblock Active' : 'Set Active'}
                </button>
              </Popover.Close>
              <Popover.Close asChild>
                <button 
                  onClick={() => onAction?.(id, 'ghost')}
                  disabled={isGhost && !isBlocked}
                  className="bg-slate-900/50 hover:bg-teal-950/30 border border-white/5 border-dashed hover:border-teal-500/30 text-xs text-teal-400 py-2 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isBlocked ? 'Unblock Ghost' : 'Set Ghost'}
                </button>
              </Popover.Close>
              <Popover.Close asChild>
                <button 
                  onClick={() => onAction?.(id, 'complete')}
                  disabled={isCompleted}
                  className="bg-cyan-600/20 hover:bg-cyan-500 border border-cyan-500/50 text-cyan-400 hover:text-[#020617] text-xs font-bold py-2 rounded-full transition-all shadow-inner disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isCompleted ? 'Completed' : 'Complete Early'}
                </button>
              </Popover.Close>
              <Popover.Close asChild>
                <button 
                  onClick={() => onAction?.(id, 'block', rationale)}
                  disabled={isCompleted || isBlocked}
                  className="bg-slate-900/50 hover:bg-rose-950/30 border border-white/5 hover:border-rose-500/30 text-xs text-rose-400 py-2 rounded-full transition-all shadow-inner hover:shadow-rose-500/10 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isBlocked ? 'Blocked' : 'Block'}
                </button>
              </Popover.Close>
            </div>
            {!isCompleted && (
              <div className="mt-2 pt-3 border-t border-white/10">
                <Popover.Close asChild>
                  <button 
                    onClick={() => onAction?.(id, 'remove')}
                    className="w-full bg-transparent hover:bg-red-950/20 text-xs text-red-500/60 hover:text-red-400 py-1.5 rounded-lg transition-all mb-2 font-medium"
                  >
                    Remove Drop
                  </button>
                </Popover.Close>
                <input 
                  type="text" 
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  placeholder="Add rationale... (Why?)" 
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-2 px-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all font-mono shadow-inner block"
                />
              </div>
            )}
          </div>
          <Popover.Arrow className="fill-[#0a192f] opacity-90 w-4 h-2" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
