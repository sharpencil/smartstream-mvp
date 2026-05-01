'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, ListTodo } from 'lucide-react';
import { DropData } from './PulseDashboard';
import { Drop } from './Drop';
import { getStreamColor, PALETTE_KEYS } from '@/lib/streams';
import { STAGING_STREAMS } from '@/lib/stagingData';
import { useMemo } from 'react';

interface BacklogTrayProps {
  unassignedDrops: DropData[];
  onDragEnd: (id: string, x: number, y: number) => void;
  isSandboxActive?: boolean;
}

export function BacklogTray({ unassignedDrops, onDragEnd, isSandboxActive }: BacklogTrayProps) {
  const [isOpen, setIsOpen] = useState(false);

  const streamColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    STAGING_STREAMS.forEach((s, idx) => {
      const colorKey = PALETTE_KEYS[idx % PALETTE_KEYS.length];
      map[s.id] = getStreamColor(colorKey).hex;
    });
    return map;
  }, []);

  return (
    <motion.div
      initial={false}
      animate={{ y: isOpen ? 0 : 'calc(100% - 48px)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-8 right-[400px] z-[60] flex flex-col items-center pointer-events-none"
    >
      <div className="w-full max-w-4xl bg-[#0b1929]/95 backdrop-blur-xl border border-white/10 rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] pointer-events-auto">
        
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-center gap-2 py-3 hover:bg-white/5 transition-colors rounded-t-2xl text-slate-400 hover:text-slate-200"
        >
          <ListTodo className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 whitespace-nowrap">
            The Reservoir | Unassigned Drops 
            <span className="bg-slate-800 text-slate-300 px-2 rounded-full py-0.5">{unassignedDrops.length}</span>
          </span>
          {isOpen ? <ChevronDown className="w-4 h-4 ml-2" /> : <ChevronUp className="w-4 h-4 ml-2" />}
        </button>

        {/* Content */}
        <div className="px-8 pb-6 pt-2">
          <div className="flex gap-6 overflow-x-auto pb-4 pt-2 no-scrollbar min-h-[80px]">
            {unassignedDrops.map((drop) => {
              const width = Math.max(120, drop.effortHours * 80);
              return (
                <div key={drop.id} className="relative shrink-0" style={{ width, height: 64 }}>
                  <Drop
                    id={drop.id}
                    title={drop.title}
                    state="ghost"
                    effortHours={drop.effortHours}
                    xOffset={0}
                    streamId={drop.streamId}
                    streamColorHex={drop.streamId ? streamColorMap[drop.streamId] : undefined}
                    isDraft={isSandboxActive}
                    onDragEnd={onDragEnd}
                    dragTooltip="Adding to Flow..."
                  />
                </div>
              );
            })}
            {unassignedDrops.length === 0 && (
              <div className="w-full text-center py-6 text-slate-500 text-sm italic">
                The Reservoir is empty. All drops have been assigned to the flow.
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
