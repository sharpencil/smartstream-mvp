'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Plus, Zap, Rocket, 
  FileUp, Layers, UserPlus, Database, Fingerprint, Network, UserCheck,
  ChevronDown, ChevronRight,
  Activity, Target, Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGenesis } from '@/context/GenesisContext';
import { useRouter } from 'next/navigation';
import { StreamAccordion } from './StreamAccordion';

export function GenesisModal() {
  const { isGenesisOpen, closeGenesis } = useGenesis();
  const [step, setStep] = useState(1);
  const [genesisState, setGenesisState] = useState<'idle' | 'uploading' | 'scanning' | 'complete'>('idle');
  const [progress, setProgress] = useState(0);
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

            {/* Middle: Centered Progress Stepper (Enhanced) */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                {[1, 2, 3].map((s) => (
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
                Phase {step} <span className="text-slate-800 mx-1">/</span> 3
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

          {/* Wizard Content Area */}
          <div className="flex-1 relative overflow-y-auto overflow-x-hidden flex flex-col bg-[#020617]">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <Step1ProjectProfile 
                  key="step1" 
                  onNext={() => setStep(2)} 
                />
              )}
              {step === 2 && (
                <Step2Ingestion 
                  key="step2" 
                  onNext={() => setStep(3)} 
                  genesisState={genesisState}
                  setGenesisState={setGenesisState}
                  progress={progress}
                  setProgress={setProgress}
                />
              )}
              {step === 3 && (
                <Step3Blueprint 
                  key="step3" 
                  onLaunch={handleLaunch} 
                  genesisState={genesisState}
                />
              )}
            </AnimatePresence>
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

function Step2Ingestion({ 
  onNext, genesisState, setGenesisState, progress, setProgress 
}: { 
  onNext: () => void, 
  genesisState: string,
  setGenesisState: (s: any) => void,
  progress: number,
  setProgress: (p: number) => void
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
      className="flex-1 flex flex-col px-12 py-10 max-w-7xl mx-auto w-full"
    >
      <div className="w-full flex gap-8">
        {/* Left: Intake Dropzone */}
        <div 
          className={cn(
            "flex-[2] bg-[#0a192f]/40 border border-slate-800/60 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[320px] transition-all relative overflow-hidden",
            genesisState === 'idle' ? "border-dashed hover:border-cyan-500/50 hover:bg-cyan-950/10 cursor-pointer group" : "border-solid shadow-inner shadow-cyan-900/10"
          )} 
          onClick={handleScan}
        >
           {genesisState === 'idle' && (
             <>
               <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700/50 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-cyan-500/50 transition-all shadow-lg shadow-black">
                 <FileUp className="w-8 h-8 text-cyan-400 group-hover:text-cyan-300" />
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

           {genesisState === 'complete' && (
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

        {/* Right: Roster Recommendations */}
        <div className="flex-1 bg-[#0a192f]/40 border border-slate-800/60 rounded-3xl p-6 flex flex-col relative overflow-hidden group">
          <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
            <UserPlus className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-semibold text-slate-200">Oracle Roster Alignments</h2>
          </div>

          {genesisState === 'complete' ? (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {[
                { name: 'Sarah', role: 'Authentication', match: 98, color: 'green' },
                { name: 'Mike', role: 'Database Arch', match: 92, color: 'teal' },
                { name: 'Alex', role: 'UI / UX', match: 85, color: 'blue' }
              ].map((p, i) => (
                <div key={p.name} className={cn("flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border shadow-inner transition-all", `border-${p.color}-500/20 shadow-${p.color}-900/10`)}>
                  <div className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border font-bold text-xs shadow-lg", `bg-${p.color}-900/40 border-${p.color}-500/30 text-${p.color}-300`)}>
                      {p.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-200">{p.name}</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                        {p.role}
                      </span>
                    </div>
                  </div>
                  <div className={cn("text-xs font-bold font-mono tracking-wide", `text-${p.color}-400`)}>{p.match}% MATCH</div>
                </div>
              ))}

              <button 
                onClick={onNext}
                className="w-full mt-4 py-3 rounded-full bg-cyan-500/90 border border-cyan-400/50 text-[#020617] font-bold text-xs tracking-widest hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all uppercase active:scale-95"
              >
                CONFIRM ROSTER
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-40">
               <UserCheck className="w-12 h-12 text-slate-600 mb-3" />
               <p className="text-xs text-slate-400 text-center px-4">Provide raw context to unlock predictive AI Roster match scoring.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function Step3Blueprint({ onLaunch, genesisState }: { onLaunch: () => void, genesisState: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
      className="flex-1 flex flex-col p-12 max-w-7xl mx-auto w-full pb-32"
    >
       <div className="w-full flex gap-12 items-start">
         {/* Left: Drafted Streams (Matching Library Tab) */}
         <div className="flex-[2] flex flex-col gap-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-6 mb-2">
               <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3 tracking-tight">
                    <Layers className="w-6 h-6 text-indigo-400" />
                    Drafted Streams
                  </h2>
                  <p className="text-sm text-slate-500 font-light">Review the AI-generated streams before activating the project in Pulse.</p>
               </div>

               {/* SEND TO PULSE button in the header - exact match to LibraryDashboard */}
               <motion.button 
                 initial={{ opacity: 0, scale: 0.9 }} 
                 animate={{ opacity: 1, scale: 1 }} 
                 transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.5 }}
                 onClick={onLaunch}
                 className="group flex items-center gap-3 px-6 py-3 bg-cyan-500 rounded-full text-[#0a192f] font-bold text-sm tracking-widest shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_40px_rgba(34,211,238,0.6)] hover:scale-105 transition-all outline-none uppercase whitespace-nowrap active:scale-95"
               >
                 SEND TO PULSE
                 <div className="w-6 h-6 rounded-full bg-[#0a192f]/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                   <ChevronDown className="w-4 h-4 text-[#0a192f] -rotate-90" />
                 </div>
               </motion.button>
            </div>
            
            <StreamAccordion type="drafted" />
         </div>

         {/* Right: Roster Alignments (Matching Library Tab) */}
         <div className="flex-1 bg-[#0a192f]/40 border border-slate-800/60 rounded-3xl p-8 flex flex-col relative overflow-hidden shadow-2xl">
            <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
              <UserPlus className="w-6 h-6 text-indigo-400" />
              <h2 className="text-sm font-semibold text-slate-200">Oracle Roster Alignments</h2>
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
