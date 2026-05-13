'use client';

import { useState } from 'react';
import { 
  Activity, LayoutDashboard, Users, Cpu, 
  GitCommit, BarChart, Map, Brain, Shield 
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import * as Popover from '@radix-ui/react-popover';
import { motion, AnimatePresence } from 'framer-motion';
import { usePersona, PersonaType } from '@/context/PersonaContext';

const PERSONA_MENUS: Record<PersonaType, Array<{ name: string; icon: any; href: string }>> = {
  'Project Manager': [
    { name: 'Pulse', icon: Activity, href: '/' },
    { name: 'Streams', icon: LayoutDashboard, href: '/library' },
    { name: 'Team', icon: Users, href: '/team' },
    { name: 'Operations', icon: Cpu, href: '/operations' },
  ],
  'Team Member': [
    { name: 'My Flow', icon: GitCommit, href: '/' },
    { name: 'My Performance', icon: BarChart, href: '/performance' },
    { name: 'Project Map', icon: Map, href: '/map' },
  ],
  'Org Owner': [
    { name: 'Firm Pulse', icon: Activity, href: '/' },
    { name: 'Talent Intelligence', icon: Brain, href: '/talent' },
    { name: 'Operations', icon: Cpu, href: '/operations' },
    { name: 'Security', icon: Shield, href: '/security' },
  ]
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { activePersona, setActivePersona, isTransitioning, setIsTransitioning } = usePersona();
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handlePersonaSwitch = (persona: PersonaType) => {
    if (persona === activePersona) {
      setPopoverOpen(false);
      return;
    }
    setPopoverOpen(false);
    setIsTransitioning(true);
    
    // Switch persona slightly after ripple starts
    setTimeout(() => {
      setActivePersona(persona);
      router.push('/');
    }, 200);

    // End transition
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1000);
  };

  const pillars = PERSONA_MENUS[activePersona];

  return (
    <>
      <aside className="fixed top-16 bottom-0 left-0 w-20 flex flex-col items-center py-8 bg-[#0a192f]/40 backdrop-blur-xl border-r border-white/10 z-[200] transition-all duration-300">
        
        <nav className="flex-1 flex flex-col gap-8 w-full items-center mt-4">
          <AnimatePresence mode="wait">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              const isActive = pathname === pillar.href || (pathname === '' && pillar.href === '/');
              
              return (
                <motion.div
                  key={pillar.name + activePersona}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link 
                    href={pillar.href}
                    className={cn(
                      "group relative p-3 rounded-[20px] transition-all duration-300 block",
                      isActive ? "bg-teal-950/40 text-teal-400 shadow-[0_0_15px_rgba(13,148,136,0.2)] border border-teal-500/30" : "text-slate-400 hover:text-teal-400 hover:bg-teal-950/30 border border-transparent"
                    )}
                  >
                    <Icon className="w-6 h-6 stroke-[1.5]" />
                    <span className="sr-only">{pillar.name}</span>
                    
                    {/* Tooltip */}
                    <div className="absolute left-14 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-800 text-slate-200 text-sm rounded-[12px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none before:content-[''] before:absolute before:-left-1 before:top-1/2 before:-translate-y-1/2 before:border-4 before:border-transparent before:border-r-slate-800 backdrop-blur-md z-50">
                      {pillar.name}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </nav>
        
        <div className="mt-auto relative z-50">
          <Popover.Root open={popoverOpen} onOpenChange={setPopoverOpen}>
            <Popover.Trigger asChild>
              <div className="w-10 h-10 rounded-[15px] bg-gradient-to-br from-cyan-900/60 to-slate-900 border border-slate-700/50 flex items-center justify-center cursor-pointer hover:border-cyan-500/80 transition-colors shadow-inner shadow-cyan-500/10">
                <span className="text-cyan-300 font-bold text-sm tracking-widest">U1</span>
              </div>
            </Popover.Trigger>

            <Popover.Portal>
              <Popover.Content 
                side="right" 
                align="end" 
                sideOffset={16}
                className="z-[250] w-56 rounded-[16px] bg-[#0a192f]/90 backdrop-blur-2xl border border-white/10 shadow-2xl p-2 outline-none animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95"
              >
                <div className="px-3 py-2 mb-2 border-b border-white/10">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Switch Persona</p>
                </div>
                <div className="flex flex-col gap-1">
                  {(Object.keys(PERSONA_MENUS) as PersonaType[]).map((persona) => (
                    <button
                      key={persona}
                      onClick={() => handlePersonaSwitch(persona)}
                      className={cn(
                        "flex items-center w-full px-3 py-2 text-sm rounded-xl transition-all duration-200",
                        activePersona === persona 
                          ? "bg-cyan-950/50 text-cyan-400 font-medium" 
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      {persona}
                      {activePersona === persona && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                      )}
                    </button>
                  ))}
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      </aside>

      {/* Liquid Ripple Transition Overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 200, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: "easeOut" }}
            className="fixed z-[40] w-10 h-10 rounded-full bg-cyan-500/20 pointer-events-none"
            style={{ 
              bottom: '2rem', 
              left: '1.25rem', // roughly matching the avatar position
              transformOrigin: 'center center'
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
