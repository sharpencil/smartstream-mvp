'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CheckCircle2, CircleDashed, AlertTriangle, Link } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { useState } from 'react';
import { Reference } from '@/lib/streams';

export type DropState = 'completed' | 'active' | 'ghost';

export interface DropProps {
  id: string;
  title: string;
  state: DropState;
  effortHours: number;
  xOffset: number;
  isBlocked?: boolean;
  isMilestoneViolation?: boolean;
  references?: Reference[];
  zoomScale?: number;
  streamId?: string;
  streamColorHex?: string;
  streamInitials?: string;
  hoveredStreamId?: string | null;
  onHoverStream?: (streamId: string | null) => void;
  onAction?: (id: string, action: 'complete' | 'block' | 'in-progress' | 'ghost' | 'remove', rationale?: string) => void;
  isDraft?: boolean;
  onDragEnd?: (id: string, clientX: number, clientY: number) => void;
  dragTooltip?: string;
  hasDependencies?: boolean;
  isDependencyBlocked?: boolean;
  onHoverDrop?: (id: string | null) => void;
}

export function Drop({
  id,
  title,
  state,
  effortHours,
  xOffset,
  isBlocked,
  isMilestoneViolation,
  references,
  onAction,
  zoomScale = 1,
  streamId,
  streamColorHex,
  streamInitials,
  hoveredStreamId,
  onHoverStream,
  isDraft,
  onDragEnd,
  dragTooltip,
  hasDependencies,
  isDependencyBlocked,
  onHoverDrop,
}: DropProps) {
  const isGhost = state === 'ghost';
  const isDraggable = !!onDragEnd;
  const isCompleted = state === 'completed';
  const isActive = state === 'active';
  const [rationale, setRationale] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const width = Math.max(120 * zoomScale, (effortHours * 80) * zoomScale);
  const actualLeft = xOffset * zoomScale;

  // Dim-highlight: if any stream is being hovered and it's NOT this drop's stream → dim
  const isStreamHovered = hoveredStreamId != null;
  const isMatchingStream = hoveredStreamId === streamId && streamId != null;
  const isDimmed = isStreamHovered && !isMatchingStream;

  // Compute box shadow
  const getBoxShadow = () => {
    if (isMilestoneViolation) return '0 0 20px rgba(225,29,72,0.5), inset 0 0 12px rgba(225,29,72,0.1)';
    if (isMatchingStream && streamColorHex) return `0 0 20px ${streamColorHex}80, inset 0 0 10px ${streamColorHex}20`;
    if (isCompleted) return '0 4px 6px -1px rgb(0 0 0 / 0.1)';
    if (isActive && !isBlocked) return '0 0 15px rgba(6,182,212,0.3)';
    if (isActive && isBlocked) return '0 0 20px rgba(225,29,72,0.4)';
    return 'none';
  };

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <motion.button
          layout
          data-id={id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: isDimmed ? 0.18 : 1,
            scale: isMatchingStream ? 1.05 : 1,
            boxShadow: getBoxShadow(),
            width,
            left: actualLeft,
          }}
          whileHover={{ scale: isDimmed ? 0.99 : 1.02, filter: 'brightness(1.1)' }}
          onMouseEnter={() => {
            if (streamId) onHoverStream?.(streamId);
            onHoverDrop?.(id);
          }}
          onMouseLeave={() => {
            onHoverStream?.(null);
            onHoverDrop?.(null);
          }}
          transition={{ type: 'spring', stiffness: 300, damping: isMatchingStream ? 15 : 30 }}
          style={{
            position: 'absolute',
            backgroundImage: isBlocked
              ? 'repeating-linear-gradient(45deg, rgba(225,29,72,0.12) 0px, rgba(225,29,72,0.12) 4px, transparent 4px, transparent 12px)'
              : undefined,
            ...(isMatchingStream && streamColorHex ? {
              borderColor: streamColorHex,
              borderWidth: '2px',
            } : {}),
            ...(isDraft ? { borderStyle: 'dashed' } : {})
          }}
          {...(isDraggable ? {
            drag: true,
            dragSnapToOrigin: true,
            dragElastic: 0.2,
            onDragStart: () => setIsDragging(true),
            whileDrag: { zIndex: 100, scale: 1.05, cursor: 'grabbing', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)' },
            onDragEnd: (event, info) => {
              setIsDragging(false);
              onDragEnd?.(id, info.point.x, info.point.y);
            }
          } : {})}
          className={cn(
            'h-16 rounded-full flex items-center pl-6 pr-4 cursor-pointer backdrop-blur-md border relative group transition-all duration-300 z-20 outline-none',
            isCompleted && 'bg-green-950/20 border-green-500/30 hover:bg-green-900/30',
            isActive && !isBlocked && 'bg-gradient-to-r from-blue-900/60 to-cyan-900/40 border-cyan-500/50 hover:border-cyan-400',
            isActive && isBlocked && 'bg-rose-950/40 border-rose-500/70 hover:border-rose-400',
            isGhost && !isBlocked && !isMilestoneViolation && 'bg-teal-900/20 border-teal-500/30 border-dashed hover:border-teal-500/50 hover:bg-teal-900/30',
            isGhost && isMilestoneViolation && 'bg-amber-950/20 border-amber-500/50 border-dashed hover:border-amber-400/70',
            isGhost && isBlocked && 'bg-rose-900/20 border-rose-500/30 border-dashed hover:border-rose-500/50 hover:bg-rose-900/30',
            isMatchingStream && streamColorHex && 'z-30',
          )}
        >
          {/* Stream tag */}
          {streamInitials && (
            <div
              className="absolute top-1.5 right-3 text-[8px] font-bold tracking-[0.2em] opacity-50 mix-blend-plus-lighter"
              style={{ color: streamColorHex || '#fff' }}
            >
              {streamInitials}
            </div>
          )}

          {/* Milestone violation pulse ring */}
          {isMilestoneViolation && (
            <div className="absolute inset-0 rounded-full border border-amber-500/40 animate-pulse pointer-events-none" />
          )}

          {/* Dependency indicator */}
          {hasDependencies && (
            <div className={cn(
              "absolute bottom-0.5 right-6 z-40 p-0.5 rounded-full border shadow-sm transition-colors",
              isDependencyBlocked 
                ? "bg-rose-950 border-rose-500/50 text-rose-400 animate-pulse" 
                : "bg-slate-900/80 border-slate-700/50 text-slate-400"
            )}>
              <Link className="w-2.5 h-2.5" />
            </div>
          )}

          <div className="flex items-center gap-3 w-full">
            {isBlocked ? (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            ) : isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
            ) : isActive ? (
              <div className="w-5 h-5 shrink-0 rounded-full border-2 border-cyan-400 flex items-center justify-center animate-pulse">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              </div>
            ) : (
              <CircleDashed className={cn('w-5 h-5 shrink-0', isMilestoneViolation ? 'text-amber-500/60' : 'text-teal-500/50')} />
            )}

            <span className={cn(
              'text-sm font-medium truncate pointer-events-none',
              isCompleted ? 'text-green-100'
                : isActive ? 'text-cyan-50'
                : isMilestoneViolation ? 'text-amber-200/80'
                : 'text-teal-200/70',
            )}>
              {title}
            </span>
          </div>

          {/* Active shimmer */}
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none -z-10">
            {isActive && !isBlocked && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent w-[200%] animate-[shimmer_2s_infinite]" />
            )}
            {/* Blocked shimmer */}
            {isBlocked && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-rose-400/8 to-transparent w-[200%] animate-[shimmer_3s_infinite]" />
            )}
          </div>

          {isDragging && dragTooltip && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-cyan-500 text-slate-900 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-lg pointer-events-none drop-shadow-md z-50">
              {dragTooltip}
            </div>
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
              {streamInitials && (
                <div className="absolute top-0 right-0 text-[10px] font-bold tracking-[0.2em] opacity-40 uppercase" style={{ color: streamColorHex || '#fff' }}>
                  {streamInitials}
                </div>
              )}
              <h4 className="text-sm font-bold text-cyan-50 pr-12 drop-shadow-sm leading-tight">{title}</h4>
              {isMilestoneViolation && (
                <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">⚠ Milestone Deadline Conflict</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
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

            <div className="bg-slate-900/40 border border-white/5 rounded-xl p-2.5">
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest text-center leading-relaxed">
                Assignment managed by <span className="text-cyan-400">Oracle AI</span> algorithm
              </p>
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
