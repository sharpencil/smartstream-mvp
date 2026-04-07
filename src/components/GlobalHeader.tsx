'use client';

import { useState } from 'react';
import { ChevronDown, Search, Bell, Plus, Check } from 'lucide-react';
import { useGenesis } from '@/context/GenesisContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const organizations = [
  "Acme Corp",
  "Global Logistics",
  "CyberDyne Systems",
  "Stark Industries",
  "Umbrella Corp",
];

const projects = [
  "Project Phoenix",
  "Arctic Pulse",
  "Genesis Protocol",
  "Nebula Stream",
  "Solar Flare",
];

export function GlobalHeader() {
  const { openGenesis } = useGenesis();
  const [selectedOrg, setSelectedOrg] = useState(organizations[0]);
  const [selectedProject, setSelectedProject] = useState(projects[0]);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#162744]/60 backdrop-blur-2xl border-b border-white/15 z-50 px-6 flex items-center justify-between">
      <div className="flex items-center gap-12">
        {/* Logo */}
        <div className="h-12 min-w-[48px] flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/SmartStreamLogo.svg" alt="SmartStream Logo" className="h-full w-auto object-contain drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] invert-[0.05]" />
        </div>

        {/* Organization & Project Selectors */}
        <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
          <Popover>
            <PopoverTrigger asChild>
              <button className="h-[34px] flex items-center gap-2 hover:text-white transition-colors bg-slate-800/30 px-3 rounded-[12px] group focus:outline-none">
                {selectedOrg}
                <ChevronDown className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-56">
              <div className="flex flex-col gap-1">
                {organizations.map((org) => (
                  <button
                    key={org}
                    onClick={() => setSelectedOrg(org)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-[12px] text-left text-sm transition-all duration-200 hover:bg-white/5",
                      selectedOrg === org ? "text-teal-400 bg-teal-400/5 font-semibold" : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    {org}
                    {selectedOrg === org && <Check className="w-4 h-4 text-teal-400" />}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <span className="text-slate-600">/</span>

          <Popover>
            <PopoverTrigger asChild>
              <button className="h-[34px] flex items-center gap-2 hover:text-white transition-colors bg-cyan-950/20 text-cyan-100 px-3 rounded-[12px] border border-cyan-500/10 group focus:outline-none">
                {selectedProject}
                <ChevronDown className="w-4 h-4 opacity-50 text-cyan-400 group-hover:opacity-100 transition-opacity" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64">
              <div className="flex flex-col gap-1">
                {projects.map((project) => (
                  <button
                    key={project}
                    onClick={() => setSelectedProject(project)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-[12px] text-left text-sm transition-all duration-200 hover:bg-white/5",
                      selectedProject === project ? "text-teal-400 bg-teal-400/5 font-semibold" : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    {project}
                    {selectedProject === project && <Check className="w-4 h-4 text-teal-400" />}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* New Project Action */}
        <button
          onClick={openGenesis}
          className="h-[34px] flex items-center gap-2 px-4 rounded-full bg-transparent border border-cyan-500/50 text-cyan-400 text-[10px] font-black uppercase tracking-[0.1em] hover:bg-cyan-500 hover:text-[#020617] transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>

        {/* Search */}
        <div className="relative group">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-cyan-400 transition-colors" />
          <input
            type="text"
            placeholder="Search drops, people..."
            className="w-64 bg-slate-900/50 border border-slate-800/80 rounded-[16px] py-1.5 pl-9 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-950"></span>
        </button>
      </div>
    </header>
  );
}
