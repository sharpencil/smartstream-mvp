'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Plus, Zap, Rocket, 
  FileUp, Layers, UserPlus, Database, Fingerprint, Network, UserCheck,
  ChevronDown, ChevronRight,
  Activity, Target, Briefcase, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGenesis } from '@/context/GenesisContext';
import { useRouter } from 'next/navigation';
import { StreamAccordion } from './StreamAccordion';
import { WizardAssistant, AssistantFocus } from './WizardAssistant';

export function GenesisModal() {
  const { isGenesisOpen, closeGenesis } = useGenesis();
  const [step, setStep] = useState(1);
  const [genesisState, setGenesisState] = useState<'idle' | 'uploading' | 'scanning' | 'complete' | 'generating' | 'launched'>('idle');
  const [progress, setProgress] = useState(0);
  const [assistantFocus, setAssistantFocus] = useState<AssistantFocus>(null);
  const router = useRouter();

  // Reset state when modal closes
  useEffect(() => {
    if (!isGenesisOpen) {
      setTimeout(() => {
        setStep(1);
        setGenesisState('idle');
        setProgress(0);
      }, 500);
    }
  }, [isGenesisOpen]);

  const handleLaunch = () => {
    closeGenesis();
    router.push('/');
  };

  return (
    <AnimatePresence>
      {isGenesisOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[100] bg-[#020617] flex flex-col overflow-hidden font-sans"
        >
          {/* Subtle Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(13,148,136,0.03),transparent_70%)] pointer-events-none" />
          
          {/* Header with Centered Stepper */}
          <div className="relative z-10 px-12 py-8 grid grid-cols-3 items-center border-b border-white/5 bg-[#020617]/40 backdrop-blur-md">
            {/* Left: Wizard Identity */}
            <div className="flex items-center gap-3">
               <h1 className="text-2xl font-bold font-sans tracking-tight text-slate-100 whitespace-nowrap">Create New Project</h1>
            </div>

            {/* Middle: Centered Progress Stepper (4 Phases) */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                {[1, 2, 3, 4].map((s) => (
                  <motion.div 
                    key={s} 
                    initial={false}
                    animate={{ 
                      width: step === s ? 64 : 20,
                      backgroundColor: step === s 
                        ? "rgba(20, 184, 166, 1)" // Current: Teal
                        : step > s 
                          ? "rgba(34, 197, 94, 1)"  // Completed: Green
                          : "rgba(255, 255, 255, 0.1)" // Upcoming
                    }}
                    className={cn(
                      "h-2 rounded-full transition-all duration-500",
                      step === s ? "shadow-[0_0_15px_rgba(13,148,136,0.4)]" : 
                      step > s ? "shadow-[0_0_15px_rgba(34,197,94,0.3)]" : ""
                    )}
                  />
                ))}
              </div>
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">
                Phase {step} <span className="text-slate-800 mx-1">/</span> 4
              </span>
            </div>

            {/* Right: Close Action */}
            <div className="flex justify-end">
              <button 
                onClick={closeGenesis}
                className="p-2 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-all group"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 overflow-y-auto no-scrollbar relative min-w-0">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <Step1ProjectProfile 
                      key="step1" 
                      onNext={() => setStep(2)} 
                    />
                  )}
                  {step === 2 && (
                    <Step2SynthesisWorkspace 
                      key="step2" 
                      onConfirm={() => setStep(3)} 
                      genesisState={genesisState}
                      setGenesisState={setGenesisState}
                      progress={progress}
                      setProgress={setProgress}
                      onUpdateFocus={setAssistantFocus}
                    />
                  )}
                  {step === 3 && (
                    <Step3BacklogGeneration 
                      key="step3"
                      onComplete={() => setStep(4)}
                      genesisState={genesisState}
                      setGenesisState={setGenesisState}
                    />
                  )}
                  {step === 4 && (
                    <Step4FinalPreview
                      key="step4"
                      onLaunch={handleLaunch}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Wizard AI Assistant Panel */}
              {step > 1 && (
                <WizardAssistant 
                  isOpen={true} 
                  focus={assistantFocus} 
                  genesisState={genesisState} 
                />
              )}
            </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// --- STEP COMPONENTS ---

function Step1ProjectProfile({ onNext }: { onNext: () => void }) {
  const [projectName, setProjectName] = useState('');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex-1 flex flex-col items-center justify-start px-12 pt-24 pb-20 max-w-4xl mx-auto w-full"
    >
      <div className="flex flex-col max-w-md w-full gap-8">
        {/* Organization first */}
        <div className="space-y-4">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] ml-1">Organization</label>
          <div className="relative">
            <select className="w-full bg-slate-900/40 border border-slate-800/60 rounded-2xl px-6 py-5 text-xl text-white focus:outline-none focus:border-cyan-500/30 transition-all font-bold tracking-tight appearance-none cursor-pointer">
              <option>Acme Corp</option>
              <option>Global Logistics</option>
              <option>Project Alpha</option>
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-600 pointer-events-none" />
          </div>
        </div>

        {/* Project Name second */}
        <div className="space-y-4">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] ml-1">Project Name</label>
          <input 
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="e.g., Project Phoenix"
            className="w-full bg-slate-900/40 border border-slate-800/60 rounded-2xl px-6 py-5 text-xl text-white placeholder:text-slate-700 focus:outline-none focus:border-cyan-500/50 transition-all font-bold tracking-tight shadow-inner shadow-black/20"
          />
        </div>
      </div>

      <button 
        onClick={onNext}
        disabled={!projectName.trim()}
        className={cn(
          "mt-20 group relative flex items-center gap-4 px-10 py-5 rounded-full font-bold text-lg transition-all shadow-[0_0_40px_rgba(34,211,238,0.2)] active:scale-95",
          projectName.trim() 
            ? "bg-cyan-500 text-[#020617] hover:bg-cyan-400 hover:scale-105 shadow-cyan-500/30" 
            : "bg-slate-900/40 text-slate-500 border border-slate-800/60 cursor-not-allowed opacity-50"
        )}
      >
        NEXT
        <ChevronRight className={cn("w-6 h-6 transition-transform", projectName.trim() && "group-hover:translate-x-1")} />
      </button>
    </motion.div>
  );
}

function Step2SynthesisWorkspace({ 
  onConfirm, genesisState, setGenesisState, progress, setProgress, onUpdateFocus
}: { 
  onConfirm: () => void, 
  genesisState: string,
  setGenesisState: (s: any) => void,
  progress: number,
  setProgress: (p: number) => void,
  onUpdateFocus: (focus: AssistantFocus) => void
}) {
  const handleScan = () => {
    if (genesisState !== 'idle') return;
    setGenesisState('uploading');
    setProgress(0);
    
    let val = 0;
    const interval = setInterval(() => {
      val += Math.floor(Math.random() * 8) + 2;
      if (val >= 100) val = 100;
      
      setProgress(val);
      if (val >= 35 && val < 99) {
        setGenesisState('scanning');
      }
      
      if (val >= 100) {
        clearInterval(interval);
        setGenesisState('complete');
      }
    }, 150);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
      className="flex-1 flex flex-col px-12 py-10 max-w-7xl mx-auto w-full pb-32"
    >
      <div className="w-full flex gap-8">
        {/* Left: Intake Dropzone */}
        <div 
          onMouseEnter={() => onUpdateFocus('intake')}
          onMouseLeave={() => onUpdateFocus(null)}
          className={cn(
            "flex-[2] bg-[#0a192f]/40 border border-slate-800/60 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[320px] transition-all relative overflow-hidden",
            ['idle', 'uploading', 'scanning'].includes(genesisState) ? "border-dashed hover:border-cyan-500/50 hover:bg-cyan-950/10 cursor-pointer group" : "border-solid shadow-inner shadow-cyan-900/10"
          )} 
          onClick={handleScan}
        >
           {genesisState === 'idle' && (
             <>
               <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700/50 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-cyan-500/50 transition-all shadow-lg shadow-black relative">
                  <FileUp className="w-8 h-8 text-cyan-400 group-hover:text-cyan-300" />
                  <div className="absolute -top-1 -right-1">
                    <Sparkles className="w-4 h-4 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
                  </div>
               </div>
               <h3 className="text-lg font-medium text-slate-200">Drag & Drop Requirements</h3>
               <p className="text-sm text-slate-500 mt-2 font-light">Support for Jira Epics, PRDs, and FigJam links.</p>
             </>
           )}
           
           {(genesisState === 'uploading' || genesisState === 'scanning') && (
             <div className="flex flex-col items-center w-full max-w-md z-10 transition-opacity">
               <div className="relative w-16 h-16 flex items-center justify-center mb-6">
                 {genesisState === 'scanning' ? <Network className="w-8 h-8 text-teal-400 animate-pulse" /> : <Database className="w-8 h-8 text-cyan-400 animate-bounce" />}
                 <div className="absolute inset-0 rounded-full border-2 border-cyan-500/10 border-t-cyan-400 animate-spin" />
               </div>
               
               <div className="w-full flex justify-between text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">
                 <span>{genesisState === 'scanning' ? 'Neural Indexing Matrix...' : 'Ingesting Context...'}</span>
                 <span className={genesisState === 'scanning' ? "text-teal-400" : "text-cyan-400"}>{progress}%</span>
               </div>
               <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden shadow-inner flex">
                 <motion.div 
                   className={cn("h-full transition-colors duration-500", genesisState === 'scanning' ? "bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.8)]" : "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]")}
                   initial={{ width: 0 }}
                   animate={{ width: `${progress}%` }}
                   transition={{ ease: "linear" }}
                 />
               </div>
             </div>
           )}

           {['complete', 'generating', 'launched'].includes(genesisState) && (
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center z-10 text-center">
               <div className="w-16 h-16 rounded-full bg-green-950/40 border border-green-500/50 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                 <Fingerprint className="w-8 h-8 text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
               </div>
               <h3 className="text-xl font-bold text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]">Context Decoded</h3>
               <div className="flex gap-4 mt-4">
                  <div className="px-3 py-1 bg-slate-900/60 rounded-lg border border-white/5 text-xs text-slate-300 font-mono tracking-wide"><span className="text-cyan-400 font-bold">3</span> STREAMS</div>
                  <div className="px-3 py-1 bg-slate-900/60 rounded-lg border border-white/5 text-xs text-slate-300 font-mono tracking-wide"><span className="text-teal-400 font-bold">14</span> DROPS</div>
               </div>
             </motion.div>
           )}

           {genesisState === 'scanning' && (
             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-500/5 to-transparent w-[200%] h-[200%] animate-[shimmer_3s_infinite_linear] pointer-events-none" />
           )}
        </div>

        {/* Right: Team Recommendations */}
        <div 
          onMouseEnter={() => onUpdateFocus('team')}
          onMouseLeave={() => onUpdateFocus(null)}
          className="flex-1 bg-[#0a192f]/40 border border-slate-800/60 rounded-3xl p-6 flex flex-col relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
            <UserPlus className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-semibold text-slate-200">Oracle Team Alignments</h2>
          </div>
          {['complete', 'generating', 'launched'].includes(genesisState) ? (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {[
                { name: 'Sarah', role: 'Authentication', match: 98, color: 'green' },
                { name: 'Mike', role: 'Database Arch', match: 92, color: 'teal' },
                { name: 'Alex', role: 'UI / UX', match: 85, color: 'blue' }
              ].map((p, i) => (
                <div key={p.name} className={cn("flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border shadow-inner transition-all group/card cursor-help", `border-${p.color}-500/20 hover:border-indigo-500/40 shadow-${p.color}-900/10 hover:shadow-indigo-500/5`)}>
                  <div className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border font-bold text-xs shadow-lg relative", `bg-${p.color}-900/40 border-${p.color}-500/30 text-${p.color}-300`)}>
                      {p.name.charAt(0)}
                      <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-indigo-400 opacity-0 group-hover/card:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-200 group-hover/card:text-indigo-200 transition-colors">{p.name}</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                        {p.role}
                      </span>
                    </div>
                  </div>
                  <div className={cn("text-xs font-bold font-mono tracking-wide", `text-${p.color}-400 group-hover/card:text-indigo-400`)}>{p.match}% MATCH</div>
                </div>
              ))}
              
              <div className="mt-4 p-4 rounded-2xl bg-cyan-900/10 border border-cyan-500/20 flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                 <p className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest leading-relaxed">Oracle matrixing Team to stream signatures...</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-40">
               <UserCheck className="w-12 h-12 text-slate-600 mb-3" />
               <p className="text-xs text-slate-400 text-center px-4">Provide raw context to unlock predictive AI Team match scoring.</p>
            </div>
          )}
        </div>
      </div>

      {/* MERGED: Drafted Streams (Step 2 content appearing below once decoded) */}
      <AnimatePresence>
        {genesisState === 'complete' && (
          <motion.div 
            key="blueprint-area"
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }}
            onMouseEnter={() => onUpdateFocus('streams')}
            onMouseLeave={() => onUpdateFocus(null)}
            className="w-full mt-10 pt-10 border-t border-white/5 flex flex-col gap-6"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
               <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3 tracking-tight">
                    <Layers className="w-6 h-6 text-indigo-400" />
                    Drafted Streams
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 ml-2">
                       <Sparkles className="w-3 h-3 text-indigo-400" />
                       <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">AI Synthesis</span>
                    </div>
                  </h2>
                  <p className="text-sm text-slate-500 font-light">Review the AI-generated streams before activating the project in Pulse.</p>
               </div>

               {/* APPROVE STREAMS button */}
               <motion.button 
                 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} 
                 onClick={onConfirm}
                 className="group flex items-center gap-3 px-8 py-3 bg-cyan-500 rounded-full text-[#0a192f] font-bold text-sm tracking-widest shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_40px_rgba(34,211,238,0.6)] hover:scale-105 transition-all outline-none uppercase whitespace-nowrap active:scale-95"
               >
                 APPROVE STREAMS
                 <div className="w-6 h-6 rounded-full bg-[#0a192f]/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                   <ChevronDown className="w-4 h-4 text-[#0a192f] -rotate-90" />
                 </div>
               </motion.button>
            </div>
            
            <StreamAccordion type="drafted" showDrops={false} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PersistentGenesisSummary() {
   return (
    <div className="w-full flex gap-8 mb-10 pb-10 border-b border-white/5 opacity-80 pointer-events-none scale-95 origin-top grayscale-[0.2]">
      {/* Left: Intake Dropzone Summary */}
      <div className="flex-[2] bg-[#0a192f]/40 border border-slate-800/60 rounded-3xl p-6 flex flex-col items-center justify-center shadow-inner shadow-cyan-900/10">
         <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center z-10 text-center">
           <div className="w-12 h-12 rounded-full bg-green-950/40 border border-green-500/50 flex items-center justify-center mb-3">
             <Fingerprint className="w-6 h-6 text-green-400" />
           </div>
           <h3 className="text-lg font-bold text-green-400">Context Decoded</h3>
           <div className="flex gap-4 mt-2">
              <div className="px-2 py-0.5 bg-slate-900/60 rounded-lg border border-white/5 text-[10px] text-slate-300 font-mono tracking-wide">3 STREAMS</div>
              <div className="px-2 py-0.5 bg-slate-900/60 rounded-lg border border-white/5 text-[10px] text-slate-300 font-mono tracking-wide">14 DROPS</div>
           </div>
         </motion.div>
      </div>

      {/* Right: Team Recommendations Summary */}
      <div className="flex-1 bg-[#0a192f]/40 border border-slate-800/60 rounded-3xl p-6 flex flex-col relative overflow-hidden group shadow-inner shadow-cyan-900/10">
        <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-3">
          <UserPlus className="w-4 h-4 text-indigo-400" />
          <h2 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest text-slate-200">Oracle Alignments</h2>
        </div>
        <div className="flex flex-col gap-2">
          {[
            { name: 'Sarah', match: 98, color: 'green' },
            { name: 'Mike', match: 92, color: 'teal' },
            { name: 'Alex', match: 85, color: 'blue' }
          ].map((p) => (
            <div key={p.name} className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-white/5 shadow-inner">
               <div className={cn("w-6 h-6 rounded-full flex items-center justify-center border font-bold text-[8px] bg-slate-800/40 border-slate-800", `text-${p.color}-300 border-${p.color}-500/30`)}>
                 {p.name.charAt(0)}
               </div>
               <div className="text-[10px] font-bold text-slate-400">{p.name}</div>
               <div className={cn("text-[8px] font-bold font-mono tracking-wide", `text-${p.color}-400`)}>{p.match}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
   );
}

function Step3BacklogGeneration({ 
  onComplete, 
  genesisState, 
  setGenesisState 
}: { 
  onComplete: () => void, 
  genesisState: string, 
  setGenesisState: (s: any) => void 
}) {
  const [localProgress, setLocalProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Start generating automatically when we reach this step
    setGenesisState('generating');
  }, []);

  useEffect(() => {
    if (genesisState !== 'generating') return;

    const logPool = [
      "Synthesizing stream dependencies...",
      "Normalizing effort heuristics...",
      "Levelling swimlanes for Sarah...",
      "Optimizing database schema Drops...",
      "Analyzing UX refactors...",
      "Allocating resource buffers...",
      "Cross-referencing Jira Epics...",
      "Validating JWT lifecycle logic...",
      "Oracle AI: Balancing velocity...",
      "Finalizing project blueprint..."
    ];

    let val = 0;
    const interval = setInterval(() => {
      val += Math.floor(Math.random() * 5) + 1;
      if (val >= 100) {
        val = 100;
        clearInterval(interval);
        setGenesisState('launched');
        setTimeout(onComplete, 800); // Auto-transition to final review
      }
      setLocalProgress(val);
      
      // Add logs occasionally
      if (Math.random() > 0.7 && logs.length < 8) {
         setLogs(prev => {
            const newLog = logPool[Math.floor(Math.random() * logPool.length)];
            if (prev.includes(newLog)) return prev;
            return [...prev, newLog].slice(-5);
         });
      }
    }, 150); // Slightly faster for ~7s simulation

    return () => clearInterval(interval);
  }, [genesisState, setGenesisState, onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="flex-1 flex flex-col items-center justify-start px-12 py-10 max-w-7xl mx-auto w-full"
    >
      <PersistentGenesisSummary />

      <div className="flex flex-col items-center justify-center w-full max-w-4xl text-center">
        <div className="w-20 h-20 rounded-full bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-center mb-6 relative">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/10 border-t-cyan-400 animate-spin" />
          <Rocket className={cn("w-8 h-8 text-cyan-400 transition-all duration-1000", genesisState === 'launched' ? "translate-y-[-100px] opacity-0" : "")} />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
          {genesisState === 'launched' ? "Synthesis Complete" : "Generating Backlog"}
        </h2>
        <p className="text-sm text-slate-500 mb-8 max-w-md mx-auto">
          Oracle is deep-linking requirements and generating all constituent Drops across the timeline.
        </p>

        <div className="w-full max-w-md mb-8">
          <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-[0.2em]">
            <span>Backlog Synthesis</span>
            <span className="text-cyan-400">{localProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5 relative">
            <motion.div 
              className="h-full bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)]"
              initial={{ width: 0 }}
              animate={{ width: `${localProgress}%` }}
            />
          </div>
          
          {/* Terminal Logs */}
          <div className="mt-8 bg-black/40 border border-white/5 rounded-2xl p-6 font-mono text-left h-40 overflow-hidden relative">
             <div className="flex flex-col gap-2">
               {logs.map((log, i) => (
                 <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-[10px] text-teal-500/60 leading-relaxed flex gap-3">
                   <span className="text-slate-700 select-none">[{new Date().toLocaleTimeString([], {hour12: false})}]</span>
                   <span>{log}</span>
                 </motion.div>
               ))}
               {genesisState === 'generating' && <div className="text-[10px] text-cyan-400 animate-pulse">_</div>}
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Step4FinalPreview({ onLaunch }: { onLaunch: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
      className="flex-1 flex flex-col p-12 max-w-7xl mx-auto w-full pb-32"
    >
       <div className="w-full flex gap-12 items-start mt-4">
         {/* Left: Final Backlog */}
         <div className="flex-[2] flex flex-col gap-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-6 mb-2">
               <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3 tracking-tight">
                    <Rocket className="w-6 h-6 text-green-400" />
                    Final Backlog Preview
                  </h2>
                  <p className="text-sm text-slate-500 font-light">The synthesis is complete. Review all Drops before launching the project.</p>
               </div>

               {/* LAUNCH PROJECT button */}
               <motion.button 
                 initial={{ opacity: 0, scale: 0.9 }} 
                 animate={{ opacity: 1, scale: 1 }} 
                 transition={{ type: "spring", stiffness: 300, damping: 25 }}
                 onClick={onLaunch}
                 className="group flex items-center gap-3 px-8 py-4 bg-cyan-500 rounded-full text-[#0a192f] font-bold text-sm tracking-widest shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_40px_rgba(34,211,238,0.6)] hover:scale-105 transition-all outline-none uppercase whitespace-nowrap active:scale-95"
               >
                 LAUNCH PROJECT
                 <div className="w-6 h-6 rounded-full bg-[#0a192f]/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                   <ChevronRight className="w-4 h-4 text-[#0a192f]" />
                 </div>
               </motion.button>
            </div>
            
            <StreamAccordion type="drafted" showDrops={true} />
         </div>

         {/* Right: Team Alignments (Detailed) */}
         <div className="flex-1 bg-[#0a192f]/40 border border-slate-800/60 rounded-3xl p-8 flex flex-col relative overflow-hidden shadow-2xl">
            <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
              <UserPlus className="w-6 h-6 text-indigo-400" />
              <h2 className="text-sm font-semibold text-slate-200">Full Team Matrix</h2>
            </div>

            <div className="flex flex-col gap-3">
               {[
                 { name: 'Sarah', role: 'Authentication', match: 98, color: 'green' },
                 { name: 'Mike', role: 'Database Arch', match: 92, color: 'teal' },
                 { name: 'Alex', role: 'UI / UX', match: 85, color: 'blue' }
               ].map((p) => (
                 <div key={p.name} className={cn("flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border transition-all", `border-${p.color}-500/20 shadow-inner shadow-${p.color}-900/10`)}>
                   <div className="flex items-center gap-3">
                     <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border font-bold text-xs shadow-lg", `bg-${p.color}-900/40 border-${p.color}-500/30 text-${p.color}-300`)}>
                       {p.name.charAt(0)}
                     </div>
                     <div className="flex flex-col">
                       <span className="text-sm font-bold text-slate-200 tracking-tight">{p.name}</span>
                       <span className="text-[10px] text-slate-500 uppercase tracking-widest">{p.role}</span>
                     </div>
                   </div>
                   <div className={cn("text-xs font-bold font-mono tracking-wide", `text-${p.color}-400`)}>{p.match}% MATCH</div>
                 </div>
               ))}
            </div>
         </div>
       </div>
    </motion.div>
  );
}
