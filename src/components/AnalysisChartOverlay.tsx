'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Download } from 'lucide-react';

interface AnalysisChartOverlayProps {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  onClose: () => void;
  children: React.ReactNode;
}

export function AnalysisChartOverlay({ title, subtitle, icon: Icon, onClose, children }: AnalysisChartOverlayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[1000] bg-[#020617]/95 backdrop-blur-3xl flex flex-col p-12"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h2 className="text-4xl font-bold text-slate-100 flex items-center gap-4">
            <Icon className="w-10 h-10 text-cyan-400" />
            {title}
          </h2>
          <p className="text-slate-400 mt-3 text-lg font-light tracking-wide">{subtitle}</p>
        </div>
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-bold text-slate-200 transition-all active:scale-95">
            <Download className="w-5 h-5" />
            Export High-Res
          </button>
          <button 
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400 border border-white/10 transition-all active:scale-95"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 bg-[#0a192f]/40 border border-white/10 rounded-[40px] p-12 relative overflow-y-auto shadow-2xl flex flex-col items-center">
         <div className="w-full max-w-[1400px] flex-1 flex flex-col min-h-0">
            {children}
         </div>
      </div>
    </motion.div>
  );

  if (!mounted) return null;

  return createPortal(content, document.body);
}
