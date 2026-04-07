'use client';

import { FileUp, Layers, UserPlus, Database, Fingerprint, Network, UserCheck, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { StreamAccordion } from './StreamAccordion';
import { DependencyMatrix } from './DependencyMatrix';
import { AgentPanel, type FeedItem } from './AgentPanel';

export function LibraryDashboard() {
  const [activeTab, setActiveTab] = useState<'active' | 'genesis' | 'dependencies'>('active');
  const [genesisState, setGenesisState] = useState<'idle' | 'uploading' | 'scanning' | 'complete'>('idle');
  const [isRosterConfirmed, setIsRosterConfirmed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isAgentOpen, setIsAgentOpen] = useState(true);
  const [feed, setFeed] = useState<FeedItem[]>([
    {
      id: 'l1',
      type: 'suggestion',
      text: <span>Provide requirements documentation via the Genesis zone. I am standing by to matrix the data.</span>
    }
  ]);

  const handleUpload = () => {
    if (genesisState !== 'idle') return;
    setGenesisState('uploading');
    setIsRosterConfirmed(false);
    setProgress(0);
    setFeed(prev => [{ id: Date.now().toString(), type: 'update', text: <span>Deep-scanning uploaded contextual requirements...</span> }, ...prev]);
    
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
        setFeed(prev => [{ id: Date.now().toString(), type: 'update', text: <span><span className="text-emerald-400 font-bold">Analysis Complete:</span> 3 Streams successfully decompiled. Formulating dynamic Roster suggestions.</span> }, ...prev]);
      }
    }, 200);
  };

  const handleConfirmRoster = () => {
    setIsRosterConfirmed(true);
    setFeed(prev => [{ id: Date.now().toString(), type: 'update', text: <span><span className="text-indigo-400 font-bold">Roster Confirmed:</span> Matrixing stream signatures and activation logic.</span> }, ...prev]);
  };

  return (
    <div 
      className={cn("w-full flex flex-col p-8 min-h-full transition-all duration-500 ease-in-out bg-[#020617] text-slate-50 pb-32", isAgentOpen ? "pr-[392px]" : "pr-8")}
    >
       
       {/* Library Global Header & Tab Bar */}
       <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5 sticky top-0 bg-[#020617]/90 backdrop-blur-md z-40 relative">
         <h1 className="text-3xl font-bold font-sans tracking-tight text-slate-100 flex items-center gap-3">
           Streams
         </h1>

         <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 bg-[#0a192f]/60 border border-slate-800/60 rounded-full shadow-inner shadow-black/20">
           <button 
             onClick={() => setActiveTab('active')}
             className={cn("px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-all outline-none", activeTab === 'active' ? "bg-emerald-950/80 text-emerald-400 shadow-inner shadow-emerald-500/20 border border-emerald-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-white/5")}
           >
             Active Streams
           </button>
           <button 
             onClick={() => setActiveTab('dependencies')}
             className={cn("px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-all outline-none", activeTab === 'dependencies' ? "bg-emerald-950/80 text-emerald-400 shadow-inner shadow-emerald-500/20 border border-emerald-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-white/5")}
           >
             Stream Dependencies
           </button>
           <button 
             onClick={() => setActiveTab('genesis')}
             className={cn("px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-all outline-none", activeTab === 'genesis' ? "bg-emerald-950/80 text-emerald-400 shadow-inner shadow-emerald-500/20 border border-emerald-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-white/5")}
           >
             Stream Genesis
           </button>
         </div>
       </div>

       {/* TAB 1: ACTIVE STREAMS */}
       {activeTab === 'active' && (
         <motion.div 
           initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
           className="w-full flex-1 flex flex-col items-center"
         >
           <div className="w-full flex items-center justify-between max-w-4xl mx-auto mb-6">
             <h2 className="text-xl font-bold text-slate-300 flex items-center gap-2">
               <Layers className="w-5 h-5 text-indigo-400" />
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

                {genesisState === 'complete' && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center z-10">
                    <div className="w-16 h-16 rounded-full bg-emerald-950/40 border border-emerald-500/50 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                      <Fingerprint className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    </div>
                    <h3 className="text-xl font-bold text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]">Context Decoded</h3>
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

              {/* Right: Roster Recommendations */}
              <div className="flex-1 bg-[#0a192f]/40 border border-slate-800/60 rounded-3xl p-6 flex flex-col relative overflow-hidden group">
                <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                  <UserPlus className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-sm font-semibold text-slate-200">Oracle Roster Alignments</h2>
                </div>

               {genesisState === 'complete' ? (
                 <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
                   <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-emerald-500/20 shadow-inner shadow-emerald-900/10">
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-900 to-slate-900 flex items-center justify-center border border-emerald-500/30 text-emerald-300 font-bold text-xs">S</div>
                       <div className="flex flex-col">
                         <span className="text-sm font-medium text-slate-200">Sarah</span>
                         <span className="text-[10px] text-slate-500 uppercase tracking-widest">Authentication</span>
                       </div>
                     </div>
                     <div className="text-emerald-400 text-xs font-bold font-mono tracking-wide">98% MATCH</div>
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

                    {!isRosterConfirmed && (
                      <button 
                        onClick={handleConfirmRoster}
                        className="w-full mt-4 py-3 rounded-full bg-cyan-500/90 border border-cyan-400/50 text-[#020617] font-bold text-xs tracking-widest hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all uppercase"
                      >
                        CONFIRM ROSTER
                      </button>
                    )}
                 </div>
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                    <UserCheck className="w-12 h-12 text-slate-600 mb-3" />
                    <p className="text-xs text-slate-400 text-center px-4 max-w-[200px]">Provide raw context to unlock predictive AI Roster match scoring.</p>
                 </div>
               )}
             </div>
           </div>

           {/* Vertical Blueprint Canvas */}
           <AnimatePresence>
             {(genesisState === 'complete' && isRosterConfirmed) && (
               <motion.div 
                 initial={{ opacity: 0, y: 30 }} 
                 animate={{ opacity: 1, y: 0 }} 
                 transition={{ duration: 0.5, delay: 0.1 }}
                 className="w-full mt-10 pb-24 relative z-10 flex flex-col items-center border-t border-white/5 pt-10"
               >
                 <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between max-w-4xl mx-auto mb-6 gap-4">
                   <div className="flex flex-col gap-1">
                     <h2 className="text-xl font-bold text-slate-100 flex items-center gap-3">
                      <Layers className="w-6 h-6 text-indigo-400" />
                      Drafted Streams
                    </h2>
                     <span className="text-sm text-slate-400">Review the AI generated streams before sending them to the Pulse.</span>
                   </div>
                   
                   <motion.button 
                     initial={{ opacity: 0, scale: 0.9 }} 
                     animate={{ opacity: 1, scale: 1 }} 
                     transition={{ type: "spring", stiffness: 300, damping: 25, delay: 1 }}
                     onClick={() => window.location.href = '/'}
                     className="group flex items-center gap-3 px-6 py-3 bg-cyan-500 rounded-full text-[#0a192f] font-bold text-sm tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(34,211,238,0.6)] hover:scale-105 transition-all outline-none"
                   >
                     SEND TO PULSE
                     <div className="w-6 h-6 rounded-full bg-[#0a192f]/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                       <ChevronDown className="w-4 h-4 text-[#0a192f] -rotate-90" />
                     </div>
                   </motion.button>
                 </div>
                 
                 <StreamAccordion type="drafted" />

               </motion.div>
             )}
           </AnimatePresence>

        </motion.div>
       )}

       <AgentPanel feed={feed} isThinking={genesisState === 'scanning' || genesisState === 'uploading'} isOpen={isAgentOpen} onToggle={setIsAgentOpen} />
    </div>
  );
}
