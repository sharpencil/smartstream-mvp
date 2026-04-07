'use client';

import { Activity, LayoutDashboard, Users, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const pillars = [
  { name: 'Pulse', icon: Activity, href: '/' },
  { name: 'Streams', icon: LayoutDashboard, href: '/library' },
  { name: 'Roster', icon: Users, href: '/roster' },
  { name: 'Operations', icon: Settings, href: '/operations' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-16 bottom-0 left-0 w-20 flex flex-col items-center py-8 bg-[#0a192f]/40 backdrop-blur-xl border-r border-white/10 z-50 transition-all duration-300">
      
      <nav className="flex-1 flex flex-col gap-8 w-full items-center mt-4">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          const isActive = pathname === pillar.href || (pathname === '' && pillar.href === '/');
          
          return (
            <Link 
              key={pillar.name} 
              href={pillar.href}
              className={cn(
                "group relative p-3 rounded-[20px] transition-all duration-300",
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
          );
        })}
      </nav>
      
      <div className="mt-auto">
        <div className="w-10 h-10 rounded-[15px] bg-gradient-to-br from-cyan-900/60 to-slate-900 border border-slate-700/50 flex items-center justify-center cursor-pointer hover:border-cyan-500/80 transition-colors shadow-inner shadow-cyan-500/10">
          <span className="text-cyan-300 font-bold text-sm tracking-widest">U1</span>
        </div>
      </div>
    </aside>
  );
}
