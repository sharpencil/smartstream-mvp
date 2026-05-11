'use client';

import { FileUp, Layers, UserPlus, Database, Fingerprint, Network, UserCheck, ChevronDown, ChevronRight, Rocket, Activity, Target, Briefcase } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { StreamAccordion } from './StreamAccordion';
import { DependencyMatrix } from './DependencyMatrix';


export function LibraryDashboard() {
  const [activeTab, setActiveTab] = useState<'active' | 'genesis' | 'dependencies'>('active');
  const [genesisState, setGenesisState] = useState<'idle' | 'uploading' | 'scanning' | 'complete' | 'approving' | 'synthesizing' | 'reviewed'>('idle');
  const [isTeamConfirmed, setIsTeamConfirmed] = useState(false);
  const [synthesisProgress, setSynthesisProgress] = useState(0);
  const [progress, setProgress] = useState(0);


  const handleUpload = () => {
    if (genesisState !== 'idle') return;
    setGenesisState('uploading');
    setIsTeamConfirmed(false);
    setProgress(0);
    
    // Simulate file upload -> AI scan -> decompiled success
    let val = 0;
    const interval = setInterval(() => {
      val += Math.floor(Math.random() * 8) + 2;
      if (val >= 100) val = 100;
      
      setProgress(val);
      if (val >= 35 && val < 99) {
        setGenesisState(prev => prev === 'uploading' ? 'scanning' : prev);
      }
      
      if (val >= 100) {
        clearInterval(interval);
        setGenesisState('complete');
        
        // Auto-transition to Step 3 (Stream Approval)
        setTimeout(() => {
          setGenesisState('approving');
        }, 1800);
      }
    }, 200);
  };

  const handleConfirmTeam = () => {
    setIsTeamConfirmed(true);
    setGenesisState('approving');
  };

  const handleApproveStreams = () => {
    setGenesisState('synthesizing');
    setSynthesisProgress(0);
    
    let val = 0;
    const interval = setInterval(() => {
      val += Math.floor(Math.random() * 10) + 5;
      if (val >= 100) {
        val = 100;
        clearInterval(interval);
        setTimeout(() => {
          setGenesisState('reviewed');
        }, 800);
      }
      setSynthesisProgress(val);
    }, 250);
  };

  return (
    <div 
      className="w-full h-full transition-all duration-500 ease-in-out bg-[#020617] text-slate-50 pb-32 overflow-y-auto"
    >
       
       {/* Library Global Header & Tab Bar */}
       <div className="sticky top-0 z-40 bg-[#020617]/95 backdrop-blur-md px-8 pt-8 pb-6 border-b border-white/5 flex items-center justify-between">
         <h1 className="text-3xl font-bold font-sans tracking-tight text-slate-100 flex items-center gap-3">
           Streams
         </h1>

         <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 bg-[#0a192f]/60 border border-slate-800/60 rounded-full shadow-inner shadow-black/20 flex-nowrap">
           <button 
             onClick={() => setActiveTab('active')}
             className={cn("px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-all outline-none whitespace-nowrap", activeTab === 'active' ? "bg-teal-950/80 text-teal-400 shadow-inner shadow-teal-500/20 border border-teal-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-white/5")}
           >
             Active Streams
           </button>
           <button 
             onClick={() => setActiveTab('dependencies')}
             className={cn("px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-all outline-none whitespace-nowrap", activeTab === 'dependencies' ? "bg-teal-950/80 text-teal-400 shadow-inner shadow-teal-500/20 border border-teal-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-white/5")}
           >
             Stream Dependencies
           </button>
           <button 
             onClick={() => setActiveTab('genesis')}
             className={cn("px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-all outline-none whitespace-nowrap", activeTab === 'genesis' ? "bg-teal-950/80 text-teal-400 shadow-inner shadow-teal-500/20 border border-teal-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-white/5")}
           >
             Stream Genesis
           </button>
         </div>
       </div>

       {/* TAB 1: ACTIVE STREAMS */}
       {activeTab === 'active' && (
         <motion.div 
           initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
           className="w-full flex-1 flex flex-col items-center px-8 pt-8"
         >
           <div className="w-full flex items-center justify-between max-w-4xl mx-auto mb-6">
             <h2 className="text-xl font-bold text-slate-300 flex items-center gap-2 whitespace-nowrap">
               <Layers className="w-5 h-5 text-indigo-400 shrink-0" />
               Active Streams
             </h2>
             <span className="text-sm text-slate-500">Atomic drops from these AI streams are executing currently in Pulse.</span>
           </div>
           
           <StreamAccordion type="active" />
         </motion.div>
       )}

       {/* TAB 2: DEPENDENCIES MATRIX */}
       {activeTab === 'dependencies' && (
         <DependencyMatrix />
       )}

       {/* TAB 3: STREAM GENESIS */}
       {activeTab === 'genesis' && (
         <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full flex flex-col">
           
           {genesisState !== 'reviewed' && (
             <div className="w-full flex gap-8">
               {/* Left: Intake Dropzone */}
               <div 
                 className={cn(
                   "flex-[2] bg-[#0a192f]/40 border border-slate-800/60 rounded-3xl p-8 flex flex-col items-center justify-center min-h-[280px] transition-all relative overflow-hidden",
                   genesisState === 'idle' ? "border-dashed hover:border-cyan-500/50 hover:bg-cyan-950/10 cursor-pointer group" : "border-solid shadow-inner shadow-cyan-900/10"
                 )} 
                 onClick={handleUpload}
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

                   {/* Context Decoded State (Persists after Complete) */}
                   {(genesisState === 'complete' || genesisState === 'approving' || genesisState === 'synthesizing') && (
                     <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center z-10">
                       <div className="w-16 h-16 rounded-full bg-green-950/40 border border-green-500/50 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                         <Fingerprint className="w-8 h-8 text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                       </div>
                       <h3 className="text-xl font-bold text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]">Context Decoded</h3>
                       <div className="flex gap-4 mt-3">
                          <div className="px-3 py-1 bg-slate-900/60 rounded-lg border border-white/5 text-xs text-slate-300 font-mono tracking-wide"><span className="text-cyan-400 font-bold">3</span> STREAMS</div>
                          <div className="px-3 py-1 bg-slate-900/60 rounded-lg border border-white/5 text-xs text-slate-300 font-mono tracking-wide"><span className="text-teal-400 font-bold">14</span> DROPS</div>
                       </div>
                     </motion.div>
                   )}

                  {/* Background scanning simulation effects */}
                  {genesisState === 'scanning' && (
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-500/5 to-transparent w-[200%] h-[200%] animate-[shimmer_3s_infinite_linear] pointer-events-none" />
                  )}
               </div>

                {/* Right: Team Recommendations */}
                <div className="flex-1 bg-[#0a192f]/40 border border-slate-800/60 rounded-3xl p-6 flex flex-col relative overflow-hidden group">
                  <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                    <UserPlus className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-sm font-semibold text-slate-200 whitespace-nowrap">Oracle Team Alignments</h2>
                  </div>

                  {(genesisState === 'complete' || genesisState === 'approving' || genesisState === 'synthesizing') ? (
                    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-green-500/20 shadow-inner shadow-green-900/10">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-900 to-slate-900 flex items-center justify-center border border-green-500/30 text-green-300 font-bold text-xs">S</div>
                           <div className="flex flex-col">
                             <span className="text-sm font-medium text-slate-200">Sarah</span>
                             <span className="text-[10px] text-slate-500 uppercase tracking-widest">Authentication</span>
                           </div>
                        </div>
                        <div className="text-green-400 text-xs font-bold font-mono tracking-wide">98% MATCH</div>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-teal-500/20 shadow-inner shadow-teal-900/10">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-900 to-slate-900 flex items-center justify-center border border-teal-500/30 text-teal-300 font-bold text-xs">M</div>
                           <div className="flex flex-col">
                             <span className="text-sm font-medium text-slate-200">Mike</span>
                             <span className="text-[10px] text-slate-500 uppercase tracking-widest">Database Arch</span>
                           </div>
                        </div>
                        <div className="text-teal-400 text-xs font-bold font-mono tracking-wide">92% MATCH</div>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-blue-500/20 shadow-inner shadow-blue-900/10">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-900 to-slate-900 flex items-center justify-center border border-blue-500/30 text-blue-300 font-bold text-xs">A</div>
                           <div className="flex flex-col">
                             <span className="text-sm font-medium text-slate-200">Alex</span>
                             <span className="text-[10px] text-slate-500 uppercase tracking-widest">UI / UX</span>
                           </div>
                        </div>
                        <div className="text-blue-400 text-xs font-bold font-mono tracking-wide">85% MATCH</div>
                      </div>

                      <div className="mt-4 p-4 rounded-2xl bg-cyan-900/10 border border-cyan-500/20 flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                         <p className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest leading-relaxed">
                           {genesisState === 'complete' ? "Oracle matrixing Team to stream signatures..." : "Oracle sync active. Heuristics aligned."}
                         </p>
                      </div>
                    </div>
                  ) : (
                   <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                      <UserCheck className="w-12 h-12 text-slate-600 mb-3" />
                      <p className="text-xs text-slate-400 text-center px-4 max-w-[200px]">Provide raw context to unlock predictive AI Team match scoring.</p>
                   </div>
                  )}
                </div>
             </div>
           )}

           {/* Genesis Workflow Canvas */}
           <AnimatePresence mode="wait">
             {(genesisState === 'approving' || genesisState === 'synthesizing' || genesisState === 'reviewed') && (
               <motion.div 
                 key={genesisState}
                 initial={{ opacity: 0, y: 30 }} 
                 animate={{ opacity: 1, y: 0 }} 
                 exit={{ opacity: 0, scale: 0.95 }}
                 className={cn(
                   "w-full pb-24 relative z-10 flex flex-col items-center",
                   genesisState !== 'reviewed' && "mt-10 border-t border-white/5 pt-10"
                 )}
               >
                 {/* Phase 3: Stream Approval */}
                 {genesisState === 'approving' && (
                   <div className="w-full flex flex-col gap-6">
                     <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between max-w-4xl mx-auto mb-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-3 whitespace-nowrap">
                            <Layers className="w-6 h-6 text-indigo-400 shrink-0" />
                            Drafted Streams
                          </h2>
                          <p className="text-sm text-slate-400">Review the AI-generated streams before activating the project in Pulse.</p>
                        </div>
                        
                        <motion.button 
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={handleApproveStreams}
                          className="group flex items-center gap-3 px-8 py-3 bg-cyan-500 rounded-full text-[#0a192f] font-bold text-sm tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                        >
                          APPROVE STREAMS
                        </motion.button>
                     </div>
                     <StreamAccordion type="drafted" showDrops={false} />
                   </div>
                 )}

                 {/* Phase 4: Synthesis Simulation */}
                 {genesisState === 'synthesizing' && (
                   <div className="w-full max-w-2xl py-20 flex flex-col items-center text-center">
                     <div className="relative w-20 h-20 mb-8">
                       <div className="absolute inset-0 rounded-full border-2 border-cyan-500/10 border-t-cyan-400 animate-spin" />
                       <div className="flex items-center justify-center h-full">
                         <Network className="w-8 h-8 text-cyan-400 animate-pulse" />
                       </div>
                     </div>
                     <h2 className="text-2xl font-bold text-white mb-4 whitespace-nowrap">Synthesizing Backlog</h2>
                     <p className="text-slate-500 mb-8 max-w-md">Oracle is generating individual Drops and levelling swimlanes based on approved stream structures.</p>
                     
                     <div className="w-full max-w-md">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">
                          <span>Progress</span>
                          <span className="text-cyan-400">{synthesisProgress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.6)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${synthesisProgress}%` }}
                          />
                        </div>
                     </div>
                   </div>
                 )}

                 {/* Phase 5: Final Review (Synced with Wizard Layout) */}
                 {genesisState === 'reviewed' && (
                   <div className="w-full flex gap-10 items-start mt-4">
                     {/* Left: Final Backlog */}
                     <div className="flex-[2] flex flex-col gap-6">
                       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-6 mb-2">
                          <div className="flex flex-col gap-1">
                             <h2 className="text-xl font-bold text-slate-100 flex items-center gap-3 tracking-tight whitespace-nowrap">
                               <Rocket className="w-6 h-6 text-green-400 shrink-0" />
                               Final Backlog Ready
                             </h2>
                             <p className="text-sm text-slate-500 font-light">The synthesis is complete. Review all Drops before launching the project.</p>
                          </div>

                          <motion.button 
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => window.location.href = '/'}
                            className="group flex items-center gap-3 px-8 py-3 bg-cyan-500 rounded-full text-[#0a192f] font-bold text-sm tracking-widest shadow-[0_0_20px_rgba(34,211,238,0.4)] uppercase"
                          >
                            SEND TO PULSE
                            <ChevronRight className="w-4 h-4" />
                          </motion.button>
                       </div>
                       
                       <StreamAccordion type="drafted" showDrops={true} />
                     </div>

                     {/* Right: Full Team Matrix (Detailed) */}
                     <div className="flex-1 bg-[#0a192f]/40 border border-slate-800/60 rounded-3xl p-8 flex flex-col relative overflow-hidden shadow-2xl">
                        <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                          <UserPlus className="w-6 h-6 text-indigo-400" />
                          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-widest">Full Team Matrix</h2>
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
                 )}
               </motion.div>
             )}
           </AnimatePresence>

        </motion.div>
       )}


    </div>
  );
}
