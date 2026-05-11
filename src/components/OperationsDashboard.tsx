'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Coins, Activity, Shield, Server, Box, Plus, Download, RefreshCw, AlertCircle, CheckCircle2, Building, ShieldCheck, Database, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePersona } from '@/context/PersonaContext';

export function OperationsDashboard() {
  const { activePersona } = usePersona();

  return (
    <div className="w-full h-full bg-[#020617] overflow-y-auto pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#020617]/95 backdrop-blur-md px-8 pt-8 pb-6 border-b border-white/5 flex items-center justify-between">
        <h1 className="text-3xl font-bold font-sans tracking-tight text-slate-100 flex items-center gap-3">
          Operations
        </h1>
      </div>

      {/* Bioluminescent Background Grid (Shared) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
         {Array.from({ length: 40 }).map((_, i) => (
           <div key={`v-${i}`} className="absolute top-0 bottom-0 border-l border-white/[0.02]" style={{ left: i * 80 }} />
         ))}
         {Array.from({ length: 20 }).map((_, i) => (
           <div key={`h-${i}`} className="absolute left-0 right-0 border-t border-white/[0.02]" style={{ top: i * 80 }} />
         ))}
      </div>

      <div className="w-full max-w-6xl mx-auto flex flex-col z-10 px-8 pt-8">
        <AnimatePresence mode="wait">
          {activePersona === 'Project Manager' ? (
            <motion.div
              key="pm-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <ProjectManagerView />
            </motion.div>
          ) : (
            <motion.div
              key="owner-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <OrgOwnerView />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Project Manager View (Time/Health - Teal/Cyan Focus)
// ----------------------------------------------------------------------
function ProjectManagerView() {
  const [tokens, setTokens] = useState(124500);
  const [isSliderModalOpen, setIsSliderModalOpen] = useState(false);
  const [intelligenceDepth, setIntelligenceDepth] = useState(70);

  useEffect(() => {
    const interval = setInterval(() => {
      setTokens(prev => prev + Math.floor(Math.random() * 20));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const currentBurn = tokens / 100;
  const estimatedBurn = 1850.00;
  const burnPercent = (currentBurn / estimatedBurn) * 100;

  return (
    <div className="w-full">


      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Project Token Burn */}
        <div className="bg-[#0a192f]/60 backdrop-blur-md border border-teal-500/20 rounded-3xl p-8 shadow-[0_0_40px_rgba(20,184,166,0.05)] relative overflow-hidden flex flex-col items-center text-center">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent opacity-50" />
          <div className="w-14 h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-4 text-teal-400 border border-teal-500/20">
            <Coins className="w-7 h-7" />
          </div>
          <p className="text-sm font-semibold text-teal-400/80 uppercase tracking-widest mb-2">Project Token Burn</p>
          <h2 className="text-5xl font-bold text-slate-100 font-mono tracking-tight mb-4">
            ${currentBurn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          
          <div className="w-full max-w-xs mb-6">
            <div className="flex justify-between text-[10px] font-bold text-teal-500 uppercase tracking-widest mb-2">
              <span>Budget Used</span>
              <span>{burnPercent.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900 border border-teal-500/20 overflow-hidden">
              <div 
                className="h-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)] transition-all duration-1000"
                style={{ width: `${burnPercent}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-3 font-medium">
              Estimated total burn at completion: <span className="text-slate-200">${estimatedBurn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </p>
          </div>

          <button 
            onClick={() => setIsSliderModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-bold transition-all shadow-[0_0_15px_rgba(34,211,238,0.1)]"
          >
            <RefreshCw className="w-4 h-4" />
            Re-level AI Budget
          </button>
        </div>

        {/* Stream-Level Scope Creep */}
        <div className="bg-[#0a192f]/60 backdrop-blur-md border border-white/5 rounded-3xl p-8 flex flex-col justify-center">
          <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
            <Box className="w-5 h-5 text-slate-400" />
            Stream-Level Scope Creep
          </h3>
          
          <div className="flex items-center justify-between mb-8 relative">
            <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-0.5 bg-white/10" />
            <div className="relative z-10 bg-[#0a192f] px-6 py-4 rounded-full border border-white/10 text-slate-400">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-slate-300">45</span>
                <span className="text-[10px] uppercase font-bold tracking-widest">Genesis Baseline</span>
              </div>
            </div>
            <div className="relative z-10 bg-[#0a192f] px-6 py-4 rounded-full border border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2">
                  <svg width="40" height="20" viewBox="0 0 40 20" className="opacity-80">
                    <polyline fill="none" stroke="#f59e0b" strokeWidth="2" points="0,15 10,12 20,14 30,5 40,2" />
                    <circle cx="40" cy="2" r="2" fill="#f59e0b" />
                  </svg>
                  <span className="text-2xl font-bold">62</span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest">Current Drops</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
            <span className="text-sm text-slate-300">Total Scope Deviation</span>
            <span className="text-lg font-bold text-amber-400">+17 Drops Added</span>
          </div>
        </div>

        {/* Active Security Guards */}
        <div className="bg-[#0a192f]/60 backdrop-blur-md border border-white/5 rounded-3xl p-8">
          <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-slate-400" />
            Active Security Guards
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-semibold text-slate-200">Prompt Injection Protection</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded mb-1">Active</span>
                <span className="text-[10px] text-slate-400 font-medium">24 Attempts Blocked</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-semibold text-slate-200">File Scanning (Ingestion)</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded mb-1">Active</span>
                <span className="text-[10px] text-slate-400 font-medium">Last Scanned: 2m ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Local API Health */}
        <div className="bg-[#0a192f]/60 backdrop-blur-md border border-white/5 rounded-3xl p-8">
          <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
            <Server className="w-5 h-5 text-slate-400" />
            Local API Health
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-white/5">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-200">AI Orchestrator</span>
                <span className="text-xs text-slate-500">LLM Connection</span>
              </div>
              <div className="text-right">
                <span className="block text-sm font-bold text-emerald-400">99.9% Uptime</span>
                <span className="text-xs text-slate-500">1420ms latency</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-white/5">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-200">Tracking Service</span>
                <span className="text-xs text-slate-500">us-east-1a</span>
              </div>
              <div className="text-right">
                <span className="block text-sm font-bold text-emerald-400">99.9% Uptime</span>
                <span className="text-xs text-slate-500">12ms latency</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-white/5">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-200">Route Builder</span>
                <span className="text-xs text-slate-500">us-east-1b</span>
              </div>
              <div className="text-right">
                <span className="block text-sm font-bold text-emerald-400">100% Uptime</span>
                <span className="text-xs text-slate-500">8ms latency</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Slider Modal Overlay */}
      <AnimatePresence>
        {isSliderModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/80 backdrop-blur-xl p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-[#0a192f] border border-cyan-500/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(34,211,238,0.15)] relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50" />
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-400" />
                    Token Allocation
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">Adjust Agent Intelligence Depth</p>
                </div>
                <button 
                  onClick={() => setIsSliderModalOpen(false)}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-8">
                <div className="flex justify-between text-sm font-bold mb-4">
                  <span className="text-slate-400">Speed (Lower Cost)</span>
                  <span className="text-cyan-400">Accuracy (Higher Cost)</span>
                </div>
                
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={intelligenceDepth}
                  onChange={(e) => setIntelligenceDepth(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                
                <div className="mt-6 p-4 bg-cyan-950/30 border border-cyan-500/20 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-slate-300">Intelligence Depth</span>
                    <span className="text-lg font-bold text-cyan-400">{intelligenceDepth}%</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    {intelligenceDepth > 80 ? "Maximum depth. High token usage, comprehensive analysis." : 
                     intelligenceDepth > 40 ? "Balanced mode. Standard token usage, moderate analysis." : 
                     "Fast mode. Low token usage, surface-level analysis."}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setIsSliderModalOpen(false)}
                  className="px-5 py-2 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setIsSliderModalOpen(false)}
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-cyan-500 text-[#020617] hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                >
                  Apply Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


// ----------------------------------------------------------------------
// Org Owner View (Cost/Compliance - Gold/Emerald Focus)
// ----------------------------------------------------------------------
function OrgOwnerView() {
  const [tokens, setTokens] = useState(14528300);

  useEffect(() => {
    const interval = setInterval(() => {
      setTokens(prev => prev + Math.floor(Math.random() * 500));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const tokenCost = (tokens / 1000) * 0.02; // $0.02 per 1k
  const budget = 500; // $500 budget
  const budgetPercent = Math.min(100, (tokenCost / budget) * 100);

  return (
    <div className="w-full">


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Firm-Wide Financials */}
        <div className="bg-[#0a192f]/60 backdrop-blur-md border border-amber-500/20 rounded-3xl p-8 shadow-[0_0_40px_rgba(245,158,11,0.05)] relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
          
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-500/80 uppercase tracking-widest">Global Token Spend</p>
                <h2 className="text-3xl font-bold text-slate-100 font-mono tracking-tight">
                  ${tokenCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors border border-white/10">
              <Download className="w-4 h-4" />
              Export Invoice
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium text-slate-400">
              <span>Usage vs. Budget ($500)</span>
              <span>{budgetPercent.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/5">
              <div 
                className={cn("h-full transition-all duration-1000", budgetPercent > 90 ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" : "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]")}
                style={{ width: `${budgetPercent}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 font-mono mt-2 text-right">{tokens.toLocaleString()} tokens ingested</p>
          </div>
        </div>

        {/* Global Security Posture */}
        <div className="bg-[#0a192f]/60 backdrop-blur-md border border-white/5 rounded-3xl p-8 flex flex-col justify-center">
          <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Global Security Posture
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex flex-col items-center text-center">
              <span className="text-xs text-slate-400 font-medium mb-2">Encryption at Rest</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.2)]">Active</span>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex flex-col items-center text-center">
              <span className="text-xs text-slate-400 font-medium mb-2">PEN Attack</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.2)]">Certified</span>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex flex-col items-center text-center">
              <span className="text-xs text-slate-400 font-medium mb-2">Data Anonymization</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.2)]">Enabled</span>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Organization Onboarding */}
        <div className="lg:col-span-2 bg-[#0a192f]/60 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden">
          <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Building className="w-5 h-5 text-slate-400" />
              Organization Onboarding
            </h3>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider border border-cyan-500/30 transition-colors">
              <Plus className="w-3.5 h-3.5" />
              Add Org
            </button>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/20 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-white/5">
                <th className="px-8 py-4">Organization Name</th>
                <th className="px-8 py-4">Admin Contact</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              <tr className="hover:bg-white/[0.02]">
                <td className="px-8 py-4 font-semibold text-slate-200">Acme Corp</td>
                <td className="px-8 py-4 text-slate-400">admin@acme.inc</td>
                <td className="px-8 py-4"><span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-xs font-bold">Active</span></td>
                <td className="px-8 py-4 text-right"><button className="text-slate-500 hover:text-slate-300">Manage</button></td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="px-8 py-4 font-semibold text-slate-200">Globex Data</td>
                <td className="px-8 py-4 text-slate-400">tech@globex.com</td>
                <td className="px-8 py-4"><span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded text-xs font-bold">Pending Review</span></td>
                <td className="px-8 py-4 text-right"><button className="text-cyan-400 hover:text-cyan-300 font-medium">Review</button></td>
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="px-8 py-4 font-semibold text-slate-200">Stark Industries</td>
                <td className="px-8 py-4 text-slate-400">security@stark.io</td>
                <td className="px-8 py-4"><span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-xs font-bold">Active</span></td>
                <td className="px-8 py-4 text-right"><button className="text-slate-500 hover:text-slate-300">Manage</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Infrastructure Scalability */}
        <div className="lg:col-span-1 bg-[#0a192f]/60 backdrop-blur-md border border-white/5 rounded-3xl p-8 flex flex-col justify-center">
          <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
            <Server className="w-5 h-5 text-slate-400" />
            Infrastructure Load
          </h3>
          <div className="flex items-end justify-between mb-2">
            <span className="text-sm font-semibold text-slate-300">K8s Container Capacity</span>
            <span className="text-2xl font-mono font-bold text-emerald-400">68%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-4 overflow-hidden border border-white/5 mb-6 relative">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 w-[68%] relative shadow-[0_0_15px_rgba(16,185,129,0.3)]">
               <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-white/30 to-transparent mix-blend-overlay" />
            </div>
            {/* Markers */}
            <div className="absolute top-0 bottom-0 w-px bg-white/20 left-1/4" />
            <div className="absolute top-0 bottom-0 w-px bg-white/20 left-2/4" />
            <div className="absolute top-0 bottom-0 w-px bg-white/20 left-3/4" />
          </div>
          <div className="flex items-start gap-3 p-4 bg-slate-900/50 rounded-xl border border-white/5">
            <AlertCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 leading-relaxed">
              Auto-scaling is enabled. The cluster will spin up additional nodes if sustained load exceeds 80%.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
