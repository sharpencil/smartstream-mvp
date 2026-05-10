'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type PersonaType = 'Project Manager' | 'Team Member' | 'Org Owner';

interface PersonaContextType {
  activePersona: PersonaType;
  setActivePersona: (persona: PersonaType) => void;
  isTransitioning: boolean;
  setIsTransitioning: (val: boolean) => void;
  isDeepDive: boolean;
  setIsDeepDive: (val: boolean) => void;
  isAgentOpen: boolean;
  setIsAgentOpen: (val: boolean) => void;
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [activePersona, setActivePersona] = useState<PersonaType>('Project Manager');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDeepDive, setIsDeepDive] = useState(false);
  const [isAgentOpen, setIsAgentOpen] = useState(false);

  return (
    <PersonaContext.Provider value={{ activePersona, setActivePersona, isTransitioning, setIsTransitioning, isDeepDive, setIsDeepDive, isAgentOpen, setIsAgentOpen }}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  const context = useContext(PersonaContext);
  if (context === undefined) {
    throw new Error('usePersona must be used within a PersonaProvider');
  }
  return context;
}
