'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, Database, UserPlus, Layers, Info, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AssistantFocus = 'intake' | 'roster' | 'streams' | null;

interface WizardAssistantProps {
  focus: AssistantFocus;
  genesisState: 'idle' | 'uploading' | 'scanning' | 'complete' | 'generating' | 'launched';
  isOpen: boolean;
}

export function WizardAssistant({ focus, genesisState, isOpen }: WizardAssistantProps) {
  if (!isOpen) return null;

  return (
    <motion.aside
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="w-[320px] bg-[#0a192f]/60 backdrop-blur-2xl border-l border-white/10 flex flex-col h-full z-40 relative"
    >
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-indigo-950/50 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <Bot className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Oracle Layer</h2>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Project Genesis</p>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 no-scrollbar flex flex-col gap-6">
        <AnimatePresence mode="wait">
          {/* Default / Intake State */}
          {(focus === 'intake' || (!focus && genesisState !== 'complete')) && (
            <motion.div
              key="intake-focus"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Requirements Advisor</span>
              </div>

              {genesisState === 'idle' && (
                <AdviceCard
                  icon={<Info className="w-4 h-4 text-indigo-400" />}
                  text="I'm ready to ingest your project context. Upload a PRD or Jira export to begin the synthesis."
                />
              )}

              {genesisState === 'scanning' && (
                <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 animate-pulse">
                   <p className="text-sm text-cyan-200 font-medium leading-relaxed">
                     Deconstructing natural language requirements into technical abstractions...
                   </p>
                </div>
              )}

              {['complete', 'generating', 'launched'].includes(genesisState) && (
                <>
                  <AdviceCard
                    icon={<CheckCircle2 className="w-4 h-4 text-green-400" />}
                    text="Synthesis successful. I've decoded 3 core work streams and identified 14 discrete Drops."
                    type="success"
                  />
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Detected Themes</p>
                    <ThemeTag label="Identity Hub" color="indigo" />
                    <ThemeTag label="Data Architecture" color="cyan" />
                    <ThemeTag label="UI Design System" color="teal" />
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Roster Focus */}
          {focus === 'roster' && (
            <motion.div
              key="roster-focus"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <UserPlus className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Talent Alignment Logic</span>
              </div>
              <AdviceCard
                icon={<Sparkles className="w-4 h-4 text-indigo-400" />}
                text="Sarah is leading the Roster due to her 98% match on JWT protocols. Her history in Project Phoenix shows identical Auth refactor patterns."
              />
              <AdviceCard
                icon={<Bot className="w-4 h-4 text-slate-400" />}
                text="I recommend keeping Mike on Database Architecture despite the lower velocity score; his schema knowledge is mission-critical for the decoded migrations."
              />
            </motion.div>
          )}

          {/* Streams Focus */}
          {focus === 'streams' && (
            <motion.div
              key="streams-focus"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Synthesis Blueprint</span>
              </div>
              <AdviceCard
                icon={<Info className="w-4 h-4 text-teal-400" />}
                text="I've optimized the stream sequence to resolve Auth dependencies first. This prevents potential bottlenecks in the API and UX streams."
              />
              <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20">
                <p className="text-sm text-indigo-200 font-medium leading-relaxed">
                  Streams are weighted by effort density. Current forecast: <span className="text-cyan-400 font-bold">120 Hours</span> total synthesis cost.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="p-6 border-t border-white/5 bg-black/20">
         <div className="flex items-center gap-2 opacity-40">
           <Sparkles className="w-3 h-3 text-cyan-400" />
           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Oracle Guidance Active</span>
         </div>
      </div>
    </motion.aside>
  );
}

function AdviceCard({ icon, text, type = 'default' }: { icon: React.ReactNode, text: string, type?: 'default' | 'success' }) {
  return (
    <div className={cn(
      "p-4 rounded-2xl border flex gap-3 animate-in fade-in slide-in-from-right-2",
      type === 'success' ? "bg-green-950/10 border-green-500/20 shadow-inner shadow-green-900/10" : "bg-slate-900/40 border-white/5"
    )}>
      <div className="shrink-0 mt-0.5">{icon}</div>
      <p className="text-sm text-slate-300 leading-relaxed font-light">
        {text}
      </p>
    </div>
  );
}

function ThemeTag({ label, color }: { label: string, color: 'indigo' | 'cyan' | 'teal' }) {
  const colors = {
    indigo: "bg-indigo-950/30 border-indigo-500/30 text-indigo-300",
    cyan: "bg-cyan-950/30 border-cyan-500/30 text-cyan-300",
    teal: "bg-teal-950/30 border-teal-500/30 text-teal-300"
  };

  return (
    <div className={cn("inline-flex items-center px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-widest mr-2 mb-2", colors[color])}>
      {label}
    </div>
  );
}
