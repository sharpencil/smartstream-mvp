'use client';

import { ReactNode } from 'react';
import { usePersona } from '@/context/PersonaContext';
import { cn } from '@/lib/utils';

export function MainLayoutWrapper({ children }: { children: ReactNode }) {
  const { isAgentOpen } = usePersona();
  return (
    <div className={cn("h-full w-full transition-all duration-500", isAgentOpen ? "pr-[360px]" : "pr-0")}>
      {children}
    </div>
  );
}
