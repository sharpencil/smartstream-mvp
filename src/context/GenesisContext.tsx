'use client';

import React, { createContext, useContext, useState } from 'react';

interface GenesisContextType {
  isGenesisOpen: boolean;
  openGenesis: () => void;
  closeGenesis: () => void;
}

const GenesisContext = createContext<GenesisContextType | undefined>(undefined);

export function GenesisProvider({ children }: { children: React.ReactNode }) {
  const [isGenesisOpen, setIsGenesisOpen] = useState(false);

  const openGenesis = () => setIsGenesisOpen(true);
  const closeGenesis = () => setIsGenesisOpen(false);

  return (
    <GenesisContext.Provider value={{ isGenesisOpen, openGenesis, closeGenesis }}>
      {children}
    </GenesisContext.Provider>
  );
}

export function useGenesis() {
  const context = useContext(GenesisContext);
  if (!context) {
    throw new Error('useGenesis must be used within a GenesisProvider');
  }
  return context;
}
