'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, UserPlus, FileSearch, CheckCircle, 
  Upload, Sparkles, Zap, Target, 
  Plus, Trash2, ChevronRight, User,
  Mail, Phone, MessageSquare, Award, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Employee } from '@/lib/mockRoster';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (employee: Employee, rect: DOMRect) => void;
}

export function OnboardingModal({ isOpen, onClose, onAdd }: OnboardingModalProps) {
  const [step, setStep] = useState<'mode' | 'manual' | 'ai-dropzone' | 'ai-scanning' | 'review'>('mode');
  const [ingestionMode, setIngestionMode] = useState<'manual' | 'ai' | null>(null);
  const [manualData, setManualData] = useState({ 
    name: '', 
    email: '', 
    role: '',
    availability: 'available' as Employee['availability'],
    experienceYears: 0,
    phoneNumber: '',
    messagingPlatform: '',
    messagingPlatformId: '',
    skills: [] as string[],
    certificates: [] as string[],
    adaptabilityNote: ''
  });
  const [tempSkill, setTempSkill] = useState('');
  const [tempCert, setTempCert] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [draftProfile, setDraftProfile] = useState<Employee | null>(null);
  const addBtnRef = useRef<HTMLButtonElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('mode');
      setIngestionMode(null);
      setManualData({ 
        name: '', 
        email: '', 
        role: '',
        availability: 'available',
        experienceYears: 0,
        phoneNumber: '',
        messagingPlatform: '',
        messagingPlatformId: '',
        skills: [],
        certificates: [],
        adaptabilityNote: ''
      });
      setScanProgress(0);
      setScanLogs([]);
      setDraftProfile(null);
    }
  }, [isOpen]);

  const handleAIScan = () => {
    setStep('ai-scanning');
    const logs = [
      'Initializing Neural Indexer...',
      'Extracting core competencies...',
      'Mapping Node.js experience...',
      'Analyzing architectural signatures...',
      'Estimating baseline velocity...',
      'Contextualizing project fit...',
      'Synthesizing predicted growth...',
      'Finalizing Oracle Profile...'
    ];

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Generate Mock Draft Profile
        const draft: Employee = {
          id: `new-${Math.random().toString(36).substr(2, 9)}`,
          name: 'Alex Rivera',
          role: 'Fullstack Engineer',
          avatar: 'AR',
          skills: ['React', 'Node.js', 'AWS', 'TypeScript'],
          velocity: 85,
          avgVelocity: 82,
          availability: 'available',
          reliability: 94,
          isAssigned: false,
          history: [],
          projectHistory: []
        };
        
        setTimeout(() => {
          setDraftProfile(draft);
          setStep('review');
        }, 800);
      }
      setScanProgress(progress);
      
      // Update logs based on progress
      const logIndex = Math.min(Math.floor((progress / 100) * logs.length), logs.length - 1);
      setScanLogs(prev => {
        const nextLog = logs[logIndex];
        if (prev[prev.length - 1] === nextLog) return prev;
        return [...prev, nextLog].slice(-4);
      });
    }, 400);
  };

  const handleReviewAddSkill = () => {
    if (!draftProfile) return;
    setDraftProfile({
      ...draftProfile,
      skills: [...draftProfile.skills, 'New Skill']
    });
  };

  const handleReviewRemoveSkill = (skillToRemove: string) => {
    if (!draftProfile) return;
    setDraftProfile({
      ...draftProfile,
      skills: draftProfile.skills.filter(s => s !== skillToRemove)
    });
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const draft: Employee = {
      id: `new-${Math.random().toString(36).substr(2, 9)}`,
      name: manualData.name,
      role: manualData.role,
      avatar: manualData.name.split(' ').map(n => n[0]).join('').toUpperCase() || '??',
      skills: manualData.skills.length > 0 ? manualData.skills : ['New Resource'],
      velocity: 80, // Default for manual
      avgVelocity: 80,
      availability: manualData.availability,
      reliability: 100,
      history: [],
      projectHistory: [],
      isAssigned: false,
      experienceYears: manualData.experienceYears,
      phoneNumber: manualData.phoneNumber,
      messagingPlatform: manualData.messagingPlatform,
      messagingPlatformId: manualData.messagingPlatformId,
      certificates: manualData.certificates,
      adaptabilityNote: manualData.adaptabilityNote
    };
    
    setDraftProfile(draft);
    setStep('review');
  };

  const handleManualAddSkill = () => {
    if (tempSkill.trim() && !manualData.skills.includes(tempSkill.trim())) {
      setManualData({
        ...manualData,
        skills: [...manualData.skills, tempSkill.trim()]
      });
      setTempSkill('');
    }
  };

  const handleRemoveManualSkill = (skill: string) => {
    setManualData({
      ...manualData,
      skills: manualData.skills.filter(s => s !== skill)
    });
  };

  const handleAddCert = () => {
    if (tempCert.trim() && !manualData.certificates.includes(tempCert.trim())) {
      setManualData({
        ...manualData,
        certificates: [...manualData.certificates, tempCert.trim()]
      });
      setTempCert('');
    }
  };

  const handleRemoveCert = (cert: string) => {
    setManualData({
      ...manualData,
      certificates: manualData.certificates.filter(c => c !== cert)
    });
  };

  const handleFinalize = () => {
    if (!draftProfile || !addBtnRef.current) return;
    const rect = addBtnRef.current.getBoundingClientRect();
    onAdd(draftProfile, rect);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#020617]/40 backdrop-blur-[100px]"
        >
          {/* Liquid-fill background effect */}
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-indigo-500/10 pointer-events-none"
          />

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative w-full max-w-4xl bg-[#0a192f]/60 border border-white/10 rounded-[40px] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-8 border-b border-white/5 bg-white/5 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Onboard Talent</h2>
                  <p className="text-sm text-slate-400 font-medium">Add a new resource to the Bench</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 text-slate-500 hover:text-white transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-12">
              <AnimatePresence mode="wait">
                {/* Step 1: Mode Selection */}
                {step === 'mode' && (
                  <motion.div 
                    key="mode"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                  >
                    <button 
                      onClick={() => setStep('manual')}
                      className="group p-8 rounded-[32px] bg-slate-900/40 border border-white/5 hover:border-indigo-500/30 transition-all text-left flex flex-col gap-6"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <User className="w-7 h-7 text-slate-400 group-hover:text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">Manual Entry</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">Directly input name, email, and role to create a base profile.</p>
                      </div>
                    </button>

                    <button 
                      onClick={() => setStep('ai-dropzone')}
                      className="group p-8 rounded-[32px] bg-indigo-950/20 border border-indigo-500/20 hover:border-cyan-500/50 transition-all text-left flex flex-col gap-6 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-4">
                        <div className="px-2 py-1 bg-indigo-500/20 rounded-md border border-indigo-500/30 text-[10px] font-black text-indigo-400 uppercase tracking-widest">Oracle Feature</div>
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FileSearch className="w-7 h-7 text-indigo-400 group-hover:text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">AI Resume Scout</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">Drop a PDF or Docx. Oracle will synthesize a complete skill matrix and velocity projection.</p>
                      </div>
                      <div className="mt-auto pt-4 flex items-center gap-2 text-cyan-400 font-bold text-sm tracking-widest uppercase">
                        Open Scout <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  </motion.div>
                )}

                {/* Step: AI Dropzone */}
                {step === 'ai-dropzone' && (
                  <motion.div 
                    key="dropzone"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="flex flex-col items-center justify-center"
                  >
                    <div 
                      onClick={handleAIScan}
                      className="w-full bg-[#0a192f]/40 border-2 border-dashed border-slate-800/60 rounded-[32px] p-16 flex flex-col items-center justify-center gap-6 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all cursor-pointer group"
                    >
                      <div className="w-20 h-20 rounded-full bg-slate-800/80 border border-slate-700/50 flex items-center justify-center group-hover:scale-110 group-hover:border-cyan-500/50 transition-all shadow-xl relative">
                        <Upload className="w-10 h-10 text-cyan-400 group-hover:text-cyan-300" />
                        <div className="absolute -top-1 -right-1">
                          <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                        </div>
                      </div>
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-white mb-2">Drop Resume to Analyze</h3>
                        <p className="text-sm text-slate-500 font-medium">Oracle supports PDF, Docx, and LinkedIn exports.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setStep('mode')}
                      className="mt-8 text-[10px] font-bold text-slate-500 hover:text-slate-300 uppercase tracking-widest-xl transition-colors"
                    >
                      Go Back
                    </button>
                  </motion.div>
                )}

                {/* Step: Manual Entry */}
                {step === 'manual' && (
                  <motion.div 
                    key="manual"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="max-h-[65vh] overflow-y-auto pr-4 custom-scrollbar"
                  >
                    <form onSubmit={handleManualSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {/* Section 1: Basic Info */}
                      <div className="space-y-6">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest-xl flex items-center gap-2">
                          <User className="w-3 h-3 text-indigo-400" />
                          Basic Information
                        </label>
                        
                        <div className="space-y-4">
                          <div className="group relative">
                            <input 
                              required
                              type="text" 
                              placeholder="Member Name"
                              value={manualData.name}
                              onChange={e => setManualData({...manualData, name: e.target.value})}
                              className="w-full bg-[#0a192f]/40 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                            />
                          </div>

                          <div className="group relative">
                            <input 
                              required
                              type="email" 
                              placeholder="Member Email"
                              value={manualData.email}
                              onChange={e => setManualData({...manualData, email: e.target.value})}
                              className="w-full bg-[#0a192f]/40 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="group relative">
                              <select 
                                required
                                value={manualData.role}
                                onChange={e => setManualData({...manualData, role: e.target.value})}
                                className="w-full bg-[#0a192f]/40 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer"
                              >
                                <option value="" disabled className="bg-[#0a192f]">Member Role</option>
                                <option value="User" className="bg-[#0a192f]">User</option>
                                <option value="Manager" className="bg-[#0a192f]">Manager</option>
                                <option value="Admin" className="bg-[#0a192f]">Admin</option>
                              </select>
                            </div>
                            <div className="group relative">
                              <input 
                                type="number" 
                                placeholder="Years of Exp"
                                value={manualData.experienceYears || ''}
                                onChange={e => setManualData({...manualData, experienceYears: parseInt(e.target.value) || 0})}
                                className="w-full bg-[#0a192f]/40 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                              />
                            </div>
                          </div>

                          <div className="group relative">
                            <select 
                              value={manualData.availability}
                              onChange={e => setManualData({...manualData, availability: e.target.value as Employee['availability']})}
                              className="w-full bg-[#0a192f]/40 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer"
                            >
                              <option value="available" className="bg-[#0a192f]">Full Time (Available)</option>
                              <option value="saturated" className="bg-[#0a192f]">Part Time (Saturated)</option>
                              <option value="blocked" className="bg-[#0a192f]">Blocked</option>
                            </select>
                          </div>
                        </div>

                        {/* Section: Skills */}
                        <div className="pt-4 space-y-4">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest-xl flex items-center gap-2">
                            <Zap className="w-3 h-3 text-teal-400" />
                            Skills
                          </label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="Add a skill..."
                              value={tempSkill}
                              onChange={e => setTempSkill(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleManualAddSkill())}
                              className="flex-1 bg-[#0a192f]/40 border border-white/10 rounded-xl py-2 px-4 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500/50 transition-all"
                            />
                            <button 
                              type="button"
                              onClick={handleManualAddSkill}
                              className="px-4 py-2 bg-slate-800 rounded-xl text-teal-400 hover:bg-slate-700 transition-all"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {manualData.skills.map(skill => (
                              <span key={skill} className="px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-full text-[10px] font-bold text-teal-400 flex items-center gap-2 group">
                                {skill}
                                <button type="button" onClick={() => handleRemoveManualSkill(skill)}>
                                  <X className="w-3 h-3 text-teal-500/50 group-hover:text-teal-400" />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Contact & Platforms */}
                      <div className="space-y-6">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest-xl flex items-center gap-2">
                          <Phone className="w-3 h-3 text-indigo-400" />
                          Communication Channels
                        </label>

                        <div className="space-y-4">
                          <div className="group relative">
                            <input 
                              type="text" 
                              placeholder="Member Phone Number"
                              value={manualData.phoneNumber}
                              onChange={e => setManualData({...manualData, phoneNumber: e.target.value})}
                              className="w-full bg-[#0a192f]/40 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="group relative">
                              <input 
                                type="text" 
                                placeholder="Messaging Platform"
                                value={manualData.messagingPlatform}
                                onChange={e => setManualData({...manualData, messagingPlatform: e.target.value})}
                                className="w-full bg-[#0a192f]/40 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                              />
                            </div>
                            <div className="group relative">
                              <input 
                                type="text" 
                                placeholder="Platform ID"
                                value={manualData.messagingPlatformId}
                                onChange={e => setManualData({...manualData, messagingPlatformId: e.target.value})}
                                className="w-full bg-[#0a192f]/40 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Section: Certificates */}
                        <div className="pt-4 space-y-4">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest-xl flex items-center gap-2">
                            <Award className="w-3 h-3 text-indigo-400" />
                            Certificates
                          </label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="Add a certificate..."
                              value={tempCert}
                              onChange={e => setTempCert(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCert())}
                              className="flex-1 bg-[#0a192f]/40 border border-white/10 rounded-xl py-2 px-4 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                            />
                            <button 
                              type="button"
                              onClick={handleAddCert}
                              className="px-4 py-2 bg-slate-800 rounded-xl text-indigo-400 hover:bg-slate-700 transition-all"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {manualData.certificates.map(cert => (
                              <span key={cert} className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-bold text-indigo-400 flex items-center gap-2 group">
                                {cert}
                                <button type="button" onClick={() => handleRemoveCert(cert)}>
                                  <X className="w-3 h-3 text-indigo-500/50 group-hover:text-indigo-400" />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>

                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest-xl flex items-center gap-2 pt-4">
                          <Target className="w-3 h-3 text-teal-400" />
                          Member Adaptability Note
                        </label>

                        <div className="space-y-4">
                          <textarea 
                            placeholder="Member Adaptability Notes"
                            value={manualData.adaptabilityNote}
                            onChange={e => setManualData({...manualData, adaptabilityNote: e.target.value})}
                            className="w-full bg-[#0a192f]/40 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all min-h-[80px] resize-none"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2 flex justify-end gap-4 mt-8">
                        <button 
                          type="button"
                          onClick={() => setStep('mode')}
                          className="px-8 py-4 rounded-full border border-white/10 text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          className="group px-10 py-4 bg-cyan-500 rounded-full text-[#0a192f] font-bold text-sm tracking-widest shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_40px_rgba(34,211,238,0.6)] hover:scale-105 transition-all outline-none uppercase whitespace-nowrap active:scale-95 flex items-center justify-center gap-3"
                        >
                          Generate Profile
                          <div className="w-6 h-6 rounded-full bg-[#0a192f]/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                            <ChevronRight className="w-4 h-4 text-[#0a192f]" />
                          </div>
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* Step: AI Scanning */}
                {step === 'ai-scanning' && (
                  <motion.div 
                    key="scanning"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-12"
                  >
                    {/* Synaptic Analysis Animation */}
                    <div className="relative w-64 h-64 mb-12">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        {/* Connecting Lines */}
                        {[...Array(6)].map((_, i) => (
                          <motion.line
                            key={`line-${i}`}
                            x1="50" y1="50"
                            x2={50 + 40 * Math.cos((i * 60 * Math.PI) / 180)}
                            y2={50 + 40 * Math.sin((i * 60 * Math.PI) / 180)}
                            stroke="rgba(20, 184, 166, 0.2)"
                            strokeWidth="0.5"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: [0, 1, 0] }}
                            transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
                          />
                        ))}
                        {/* Nodes */}
                        <motion.circle cx="50" cy="50" r="4" fill="#14b8a6" className="shadow-[0_0_20px_rgba(20,184,166,0.8)]" />
                        {[...Array(6)].map((_, i) => (
                          <motion.circle
                            key={`node-${i}`}
                            cx={50 + 40 * Math.cos((i * 60 * Math.PI) / 180)}
                            cy={50 + 40 * Math.sin((i * 60 * Math.PI) / 180)}
                            r="2"
                            fill="#0d9488"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                          />
                        ))}
                      </svg>
                    </div>

                    <div className="w-full max-w-md">
                      {/* Progress Indicator */}
                      <div className="flex justify-between items-end mb-2">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest-xl">Neural Matrix Scanning</div>
                        <div className="text-xl font-black text-teal-400 font-mono tracking-tighter">{scanProgress}%</div>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5 mb-8">
                        <motion.div 
                          className="h-full bg-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.6)]"
                          initial={{ width: 0 }}
                          animate={{ width: `${scanProgress}%` }}
                        />
                      </div>

                      <div className="flex flex-col gap-2 bg-black/20 border border-white/5 rounded-2xl p-6 font-mono">
                        {scanLogs.map((log, i) => (
                          <motion.div 
                            key={i} 
                            initial={{ opacity: 0, x: -10 }} 
                            animate={{ opacity: 1, x: 0 }}
                            className="text-[11px] text-teal-500/70 tracking-widest-xl uppercase"
                          >
                            <span className="text-slate-700 mr-3">&gt;</span>
                            {log}
                          </motion.div>
                        ))}
                        <div className="text-[11px] text-teal-400 animate-pulse">&gt; ANALYZING_</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step: Profile Review */}
                {step === 'review' && draftProfile && (
                  <motion.div 
                    key="review"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col gap-8"
                  >
                    <div className="flex flex-col md:flex-row gap-10">
                      {/* Left: Identity & Skills */}
                      <div className="flex-[2] flex flex-col gap-8">
                        <div className="flex items-center gap-6">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-950 to-[#0a192f] border border-teal-800/30 flex items-center justify-center text-3xl font-bold text-teal-200 shadow-xl">
                            {draftProfile.avatar}
                          </div>
                          <div>
                            <h3 className="text-3xl font-bold text-white tracking-tight">{draftProfile.name}</h3>
                            <p className="text-lg text-slate-400 font-medium">{draftProfile.role}</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest-xl flex items-center gap-2">
                              <Sparkles className="w-3 h-3 text-indigo-400" />
                              Oracle Skill Matrix
                            </label>
                            <button 
                              onClick={handleReviewAddSkill}
                              className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-widest transition-colors flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> Add Skill
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {draftProfile.skills.map(skill => (
                              <div 
                                key={skill}
                                className="group flex items-center bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-bold text-indigo-300 hover:border-indigo-400/40 transition-all shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                              >
                                <span className="pl-4 pr-4 group-hover:pr-2 transition-all py-2">{skill}</span>
                                <button 
                                  onClick={() => handleReviewRemoveSkill(skill)} 
                                  className="w-0 opacity-0 group-hover:w-8 group-hover:opacity-100 transition-all overflow-hidden flex items-center justify-center"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-indigo-400 hover:text-rose-400" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="p-6 bg-slate-900/40 border border-white/5 rounded-3xl">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest-xl flex items-center gap-2 mb-4">
                            <Target className="w-3 h-3 text-teal-400" />
                            Predicted Project Fit
                          </label>
                          <p className="text-sm text-slate-300 leading-relaxed font-light">
                            Excellent fit for the <span className="text-teal-400 font-bold">'Cloud Migration'</span> Stream or <span className="text-teal-400 font-bold">'Frontend UI'</span> Drops. Predicted high synergy with Lead Architect <span className="text-slate-100 font-medium">Lena Vane</span>.
                          </p>
                        </div>
                      </div>

                      {/* Right: Velocity Gauge */}
                      <div className="flex-1 flex flex-col gap-8 p-8 bg-[#0a192f]/40 border border-white/10 rounded-[32px] shadow-inner shadow-black/20">
                        <div className="flex flex-col items-center text-center gap-4">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest-xl">Predicted Speed</label>
                          <div className="relative w-32 h-32 flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                              <circle cx="50" cy="50" r="45" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                              <motion.circle 
                                cx="50" cy="50" r="45" fill="transparent" stroke="#14b8a6" strokeWidth="8" 
                                strokeDasharray="283"
                                initial={{ strokeDashoffset: 283 }}
                                animate={{ strokeDashoffset: 283 - (283 * draftProfile.velocity) / 120 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-3xl font-black text-white">{draftProfile.velocity}</span>
                              <span className="text-[10px] font-bold text-slate-500 uppercase">PTS/Day</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-500 font-medium px-4">Based on historical project complexity in resume data.</p>
                        </div>

                        <motion.button 
                          ref={addBtnRef}
                          initial={{ opacity: 0, scale: 0.9 }} 
                          animate={{ opacity: 1, scale: 1 }} 
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                          onClick={handleFinalize}
                          className="group w-full py-4 bg-cyan-500 rounded-full text-[#0a192f] font-bold text-sm tracking-widest shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_40px_rgba(34,211,238,0.6)] hover:scale-105 transition-all outline-none uppercase whitespace-nowrap active:scale-95 flex items-center justify-center gap-3"
                        >
                          ADD TO ROSTER
                          <div className="w-6 h-6 rounded-full bg-[#0a192f]/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                            <ChevronRight className="w-4 h-4 text-[#0a192f]" />
                          </div>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
