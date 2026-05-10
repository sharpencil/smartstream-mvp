'use client';

import React from 'react';
import { Shield, ShieldCheck, Key, Lock, Fingerprint, Database, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SecurityPillar {
  id: string;
  name: string;
  provider: string;
  icon: any;
  status: 'active' | 'warning' | 'inactive';
  description: string;
  lastChecked: string;
}

const SECURITY_PILLARS: SecurityPillar[] = [
  {
    id: 'idm',
    name: 'Identity Management',
    provider: 'Clerk SSO',
    icon: Fingerprint,
    status: 'active',
    description: 'Enforcing MFA and role-based access control across all firm applications.',
    lastChecked: '2 mins ago',
  },
  {
    id: 'enc',
    name: 'Data Encryption',
    provider: 'AES-256 At Rest',
    icon: Database,
    status: 'active',
    description: 'All staging and production volumes encrypted at rest with managed keys.',
    lastChecked: '5 mins ago',
  },
  {
    id: 'llm',
    name: 'LLM Isolation',
    provider: 'Private VPC',
    icon: Cpu,
    status: 'active',
    description: 'Zero-retention policies active. Prompts are isolated from training sets.',
    lastChecked: '12 mins ago',
  },
  {
    id: 'pen',
    name: 'PEN Attack Protection',
    provider: 'Cloudflare WAF',
    icon: ShieldCheck,
    status: 'warning',
    description: 'Detecting elevated scanning activity from known Tor exit nodes. Auto-mitigation active.',
    lastChecked: 'Just now',
  }
];

export function SecurityDashboard() {
  return (
    <div className="w-full flex flex-col p-8 h-full bg-[#020617] overflow-y-auto pb-32 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5 sticky top-0 bg-[#020617]/90 backdrop-blur-md z-40 relative">
        <h1 className="text-3xl font-bold font-sans tracking-tight text-slate-100 flex items-center gap-3">
          Security
        </h1>
      </div>

      {/* Ambient background glow */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#020617] to-[#020617] pointer-events-none" />

      <div className="w-full max-w-6xl mx-auto flex flex-col z-10">

        {/* Security Pillars Grid */}
        <div className="grid grid-cols-2 gap-8 w-full">
          {SECURITY_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            const isActive = pillar.status === 'active';
            const isWarning = pillar.status === 'warning';

            return (
              <div 
                key={pillar.id}
                className={cn(
                  "relative bg-[#0a192f]/60 backdrop-blur-md rounded-3xl p-8 border flex flex-col gap-6 overflow-hidden transition-all duration-300",
                  isActive ? "border-emerald-500/20 hover:border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.03)]" : 
                  isWarning ? "border-amber-500/30 hover:border-amber-500/50 shadow-[0_0_40px_rgba(245,158,11,0.08)]" : 
                  "border-slate-700 hover:border-slate-600"
                )}
              >
                {/* Status Glow overlay */}
                {isActive && (
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none" />
                )}
                {isWarning && (
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 blur-[50px] rounded-full pointer-events-none" />
                )}

                <div className="flex justify-between items-start z-10">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center border",
                      isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : 
                      isWarning ? "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]" : 
                      "bg-slate-800 text-slate-500 border-slate-700"
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-100">{pillar.name}</h3>
                      <p className="text-sm font-medium text-slate-500 tracking-wide">{pillar.provider}</p>
                    </div>
                  </div>

                  {/* Bioluminescent Badge */}
                  <div className={cn(
                    "flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider",
                    isActive ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]" :
                    isWarning ? "bg-amber-500/10 border-amber-500/40 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)] animate-pulse" :
                    "bg-slate-800/50 border-slate-600 text-slate-500"
                  )}>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      isActive ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" :
                      isWarning ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" :
                      "bg-slate-500"
                    )} />
                    {pillar.status === 'active' ? 'Protected' : pillar.status === 'warning' ? 'Alert' : 'Inactive'}
                  </div>
                </div>

                <div className="z-10 mt-2">
                  <p className="text-slate-300 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="z-10 mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Policy Enforced</span>
                  </div>
                  <span>Last checked: {pillar.lastChecked}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
