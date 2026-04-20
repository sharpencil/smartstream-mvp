'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CheckCircle2, CircleDashed, AlertTriangle, Link, ChevronDown } from 'lucide-react';
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
  complexity?: number; // 1–9: used to drive card width
  description?: string;
  tasks?: string[];
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
  hoveredDropId?: string | null;
  onHoverDrop?: (id: string | null) => void;
  selectedDropId?: string | null;
  onSelectDrop?: (id: string | null) => void;
  variant?: 'full' | 'minimal';
  ownerName?: string;
  intensity?: number;
  forceDimmed?: boolean;
  isCriticalPath?: boolean;
  isReady?: boolean;
}

/** Map complexity 1–9 to a pixel width multiplier for the card. */
export function complexityToWidth(complexity: number, zoomScale: number = 1): number {
  // complexity 1 → ~120px, complexity 9 → ~360px (base), then zoomed
  const base = 100 + (complexity * 28);
  return Math.round(base * zoomScale);
}

export function getDropWidth(drop: { effortHours: number, complexity?: number }, zoomScale: number = 1): number {
  if (drop.complexity) return complexityToWidth(drop.complexity, zoomScale);
  return Math.max(120 * zoomScale, (drop.effortHours * 80) * zoomScale);
}

export function Drop({
  id,
  title,
  state,
  effortHours,
  xOffset,
  complexity,
  description,
  tasks,
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
  hoveredDropId,
  onHoverDrop,
  selectedDropId,
  onSelectDrop,
  variant = 'full',
  ownerName,
  intensity = 1,
  forceDimmed = false,
  isCriticalPath = false,
  isReady = false,
}: DropProps) {
  const isGhost = state === 'ghost';
  const isDraggable = !!onDragEnd;
  const isCompleted = state === 'completed';
  const isActive = state === 'active';
  const [rationale, setRationale] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const width = getDropWidth({ effortHours, complexity }, zoomScale);
  const actualLeft = xOffset * zoomScale;

  // Dim-highlight: if any stream or drop is being hovered, or if forceDimmed is applied
  const isStreamHovered = hoveredStreamId != null;
  const isMatchingStream = hoveredStreamId === streamId && streamId != null;
  const isDimmed = 
    (hoveredStreamId && hoveredStreamId !== streamId) || 
    ((hoveredDropId || selectedDropId) && hoveredDropId !== id && selectedDropId !== id && !hasDependencies) || 
    forceDimmed;

  // Complexity badge label
  const complexityLabel = complexity ? `C${complexity}` : null;

  // Compute box shadow
  const getBoxShadow = () => {
    if (variant === 'minimal') return 'none';
    if (isMilestoneViolation) return '0 0 20px rgba(244,63,94,0.5), inset 0 0 12px rgba(244,63,94,0.1)';
    if (isMatchingStream && streamColorHex) return `0 0 20px ${streamColorHex}80, inset 0 0 10px ${streamColorHex}20`;
    if (isCompleted) return '0 4px 6px -1px rgb(0 0 0 / 0.1)';
    if (isActive && !isBlocked) return '0 0 15px rgba(6,182,212,0.3)';
    if (isActive && isBlocked) return '0 0 20px rgba(244,63,94,0.4)';
    return 'none';
  };

  // Flow Intensity Height (for Liquid Tube)
  const tubeHeight = Math.min(24, 6 + (intensity * 4));

  return (
    <Popover.Root>
      <div className="relative" style={{ position: 'absolute', left: actualLeft }}>
        {/* Smart Tooltip (Minimal Only) */}
        {variant === 'minimal' && isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-[999] w-64 p-3 bg-[#030b1a]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] pointer-events-none origin-bottom"
          >
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className={cn(
                  'text-[8px] font-black uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-sm',
                  isCompleted ? 'bg-green-500/20 text-green-400'
                    : isActive ? 'bg-cyan-500/20 text-cyan-400'
                    : 'bg-slate-500/20 text-slate-400'
                )}>
                  {isCompleted ? 'Completed' : isActive ? 'Active' : 'Planned'}
                </span>
                <span className="text-[10px] font-bold text-slate-500">{ownerName}</span>
              </div>
              <h5 className="text-[11px] font-bold text-slate-100 line-clamp-2 leading-tight">
                {title}
              </h5>
              {isBlocked && (
                <div className="flex items-center gap-1.5 mt-1 text-[9px] font-bold text-rose-400 uppercase tracking-wider animate-pulse">
                  <AlertTriangle className="w-3 h-3" />
                  Blocked by Upstream
                </div>
              )}
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#030b1a]/95" />
          </motion.div>
        )}

        <Popover.Trigger asChild>
          <motion.button
            layout
            data-id={id}
            onClick={() => onSelectDrop?.(selectedDropId === id ? null : id)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: isDimmed ? 0.10 : 1, // Enforce solid opacity unless dimmed 
              scale: (variant === 'full' && isMatchingStream) || isCriticalPath ? 1.05 : 1,
              boxShadow: isCriticalPath ? `0 0 15px 5px ${streamColorHex}40` : getBoxShadow(),
              width,
              height: variant === 'minimal' ? tubeHeight : undefined,
              filter: isCriticalPath 
                ? 'brightness(1.5) saturate(1.5)' 
                : (variant === 'minimal' ? `saturate(${1 + (intensity - 1) * 0.4})` : undefined),
              zIndex: isBlocked || isCriticalPath ? 40 : 20 // Enforce visual Z-index priority 
            }}
          whileHover={{ 
            scale: variant === 'minimal' ? 1.1 : (isDimmed ? 0.99 : 1.02), 
            filter: 'brightness(1.2) saturate(1.2)',
            zIndex: 50
          }}
          onMouseEnter={() => {
            if (streamId) onHoverStream?.(streamId);
            onHoverDrop?.(id);
            setIsHovered(true);
          }}
          onMouseLeave={() => {
            onHoverStream?.(null);
            onHoverDrop?.(null);
            setIsHovered(false);
          }}
          transition={{ type: 'spring', stiffness: 300, damping: isMatchingStream ? 15 : 30 }}
          style={{
            backgroundImage: isBlocked
              ? (variant === 'minimal' ? undefined : 'repeating-linear-gradient(45deg, rgba(244,63,94,0.12) 0px, rgba(244,63,94,0.12) 4px, transparent 4px, transparent 12px)')
              : undefined,
            ...(variant === 'full' && isMatchingStream && streamColorHex ? {
              borderColor: streamColorHex,
              borderWidth: '2px',
            } : {}),
            ...(isDraft || (variant === 'minimal' && isGhost) ? { borderStyle: 'dashed' } : {}),
            backgroundColor: variant === 'minimal' ? (isBlocked ? '#f43f5e' : (isGhost ? (isReady ? '#06b6d4' : '#64748b') : streamColorHex)) : undefined
          }}
            {...(isDraggable ? {
              drag: true,
              dragSnapToOrigin: true,
              dragElastic: 0.2,
              onDragStart: () => setIsDragging(true),
              whileDrag: { zIndex: 100, scale: 1.05, cursor: 'grabbing', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)' },
              onDragEnd: (event: any, info: any) => {
                setIsDragging(false);
                onDragEnd?.(id, info.point.x, info.point.y);
              }
            } : {})}
            className={cn(
              variant === 'full' ? 'h-16 rounded-full pl-6 pr-4' : 'rounded-full px-2',
              'flex items-center cursor-pointer backdrop-blur-md border border-white/10 relative group transition-all duration-300 z-20 outline-none -ml-1',
              isCompleted && variant === 'full' && 'bg-green-950/20 border-green-500/30 hover:bg-green-900/30',
              isActive && !isBlocked && variant === 'full' && 'bg-gradient-to-r from-blue-900/60 to-cyan-900/40 border-cyan-500/50 hover:border-cyan-400',
              isActive && isBlocked && variant === 'full' && 'bg-rose-950/40 border-rose-500/70 hover:border-rose-400',
              isGhost && !isBlocked && !isMilestoneViolation && variant === 'full' && 'bg-teal-900/20 border-teal-500/30 border-dashed hover:border-teal-500/50 hover:bg-teal-900/30',
              isGhost && isMilestoneViolation && variant === 'full' && 'bg-amber-950/20 border-amber-500/50 border-dashed hover:border-amber-400/70',
              isGhost && isBlocked && variant === 'full' && 'bg-rose-900/20 border-rose-500/30 border-dashed hover:border-rose-500/50 hover:bg-rose-900/30',
              variant === 'minimal' && 'border-white/20 hover:border-white/40 shadow-[0_0_10px_rgba(34,211,238,0.1)]',
              isMatchingStream && streamColorHex && 'z-30',
            )}
          >
            {/* Stream tag */}
            {variant === 'full' && streamInitials && (
              <div
                className="absolute top-1.5 right-3 text-[8px] font-bold tracking-[0.2em] opacity-50 mix-blend-plus-lighter"
                style={{ color: streamColorHex || '#fff' }}
              >
                {streamInitials}
              </div>
            )}

            {/* Complexity badge */}
            {variant === 'full' && complexityLabel && (
              <div
                className="absolute bottom-1.5 right-3 text-[8px] font-bold tracking-[0.15em] opacity-40"
                style={{ color: streamColorHex || '#94a3b8' }}
              >
                {complexityLabel}
              </div>
            )}

            {/* Milestone violation pulse ring */}
            {isMilestoneViolation && (
              <div className={cn("absolute inset-0 rounded-full border border-amber-500/40 animate-pulse pointer-events-none", variant === 'minimal' && 'border-amber-500/60')} />
            )}

            {/* Dependency indicator */}
            {hasDependencies && variant === 'full' && (
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
              {variant === 'full' && (
                <>
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
                </>
              )}


            </div>

            {/* Active shimmer */}
            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none -z-10">
              {isActive && !isBlocked && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent w-[200%] animate-[shimmer_2s_infinite]" />
              )}
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
      </div>

      <Popover.Portal>
        <Popover.Content
          sideOffset={10}
          side="top"
          className="w-80 bg-[#0a192f]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_0_30px_rgba(34,211,238,0.15)] outline-none z-50 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[480px]"
        >
          {/* Header */}
          <div className="p-4 pb-3 border-b border-white/10 relative flex-shrink-0">
            {streamInitials && (
              <div className="absolute top-3 right-3 text-[10px] font-bold tracking-[0.2em] opacity-40 uppercase" style={{ color: streamColorHex || '#fff' }}>
                {streamInitials}
              </div>
            )}
            <div className="flex items-center gap-2 mb-1">
              {isCompleted && <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />}
              {isGhost && <CircleDashed className="w-4 h-4 text-teal-400/60 shrink-0" />}
              {isActive && <div className="w-4 h-4 shrink-0 rounded-full border-2 border-cyan-400 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-cyan-400" /></div>}
              <span className={cn(
                'text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full',
                isCompleted ? 'bg-green-950/60 text-green-400 border border-green-500/30'
                  : isActive ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-500/30'
                  : 'bg-slate-800/60 text-slate-400 border border-slate-700/30'
              )}>
                {isCompleted ? 'Completed' : isActive ? 'In Progress' : 'Not Started'}
              </span>
              {complexity && (
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-800/60 text-slate-400 border border-slate-700/30">
                  Weight {complexity}/9
                </span>
              )}
            </div>
            <h4 className="text-sm font-bold text-cyan-50 leading-snug mt-2 pr-8">{title}</h4>
            {isMilestoneViolation && (
              <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider mt-1">⚠ Milestone Deadline Conflict</p>
            )}
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-700/50 scrollbar-track-transparent min-h-0">
            {/* Description */}
            {description && (
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Objective</p>
                <p className="text-xs text-slate-300 leading-relaxed">{description}</p>
              </div>
            )}

            {/* Tasks */}
            {tasks && tasks.length > 0 && (
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Tasks ({tasks.length})</p>
                <ul className="space-y-1.5">
                  {tasks.map((task, i) => (
                    <li key={i} className="flex gap-2 text-xs text-slate-300 leading-relaxed">
                      <span className="shrink-0 w-4 h-4 rounded-full border border-cyan-500/30 flex items-center justify-center text-[9px] font-bold text-cyan-500/70 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="p-4 pt-3 border-t border-white/10 flex-shrink-0 space-y-2">
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
              <div>
                <Popover.Close asChild>
                  <button
                    onClick={() => onAction?.(id, 'remove')}
                    className="w-full bg-transparent hover:bg-red-950/20 text-xs text-red-500/60 hover:text-red-400 py-1.5 rounded-lg transition-all font-medium"
                  >
                    Remove Drop
                  </button>
                </Popover.Close>
                <input
                  type="text"
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  placeholder="Add rationale... (Why?)"
                  className="w-full bg-black/30 border border-white/10 rounded-xl py-2 px-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all font-mono shadow-inner block mt-1"
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
