'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Users, Globe, Search, Filter, SlidersHorizontal, Plus, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { TalentCard } from '@/components/TalentCard';
import { AISkillsBanner } from '@/components/AISkillsBanner';
import { PerformanceModal } from '@/components/PerformanceModal';
import { OnboardingModal } from '@/components/OnboardingModal';
import { AgentPanel, type FeedItem } from '@/components/AgentPanel';
import { mockEmployees as initialEmployees, Employee } from '@/lib/mockTeam';
import { cn } from '@/lib/utils';

export default function TeamPage() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [activeTab, setActiveTab] = useState('crew');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('All Skills');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [isRecommending, setIsRecommending] = useState(false);
  const [highlightedIds, setHighlightedIds] = useState<string[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  
  // Fly-to-bench animation state
  const [flyingCard, setFlyingCard] = useState<{ employee: Employee, startX: number, startY: number } | null>(null);
  const [ripplePos, setRipplePos] = useState<{ x: number, y: number } | null>(null);
  const benchTabRef = useRef<HTMLButtonElement>(null);

  const [feed, setFeed] = useState<FeedItem[]>([
    {
      id: 'r1',
      type: 'suggestion',
      text: <span>Analyzing current Team alignment against active Streams... Skill density is optimal for "The Crew".</span>
    }
  ]);

  // Get unique skills for filter
  const allSkills = useMemo(() => {
    const skills = new Set<string>();
    employees.forEach(emp => emp.skills.forEach(skill => skills.add(skill)));
    return ['All Skills', ...Array.from(skills)];
  }, [employees]);

  // Filter Logic
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSkill = selectedSkill === 'All Skills' || emp.skills.includes(selectedSkill);
      const matchesStatus = selectedStatus === 'All Status' || emp.availability === selectedStatus.toLowerCase();
      const matchesTab = activeTab === 'crew' ? emp.isAssigned : true;

      return matchesSearch && matchesSkill && matchesStatus && matchesTab;
    });
  }, [searchQuery, selectedSkill, selectedStatus, activeTab, employees]);

  const handleRecommend = () => {
    setIsRecommending(true);
    // Simulate AI scanning
    setTimeout(() => {
      const matches = employees
        .filter(emp => emp.skills.includes('Cloud Infrastructure'))
        .map(emp => ({ ...emp, matchScore: emp.reliability > 95 ? 98 : 92 }));

      setHighlightedIds(matches.map(m => m.id));
      setIsRecommending(false);
      setActiveTab('bench');
    }, 1500);
  };

  const handleCardClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const handleOnboardComplete = (newEmployee: Employee, rect: DOMRect) => {
    setIsOnboardingOpen(false);
    
    // Start fly animation
    setFlyingCard({
      employee: newEmployee,
      startX: rect.left,
      startY: rect.top
    });

    // After animation finishes
    setTimeout(() => {
      setEmployees(prev => [...prev, newEmployee]);
      setFlyingCard(null);
      
      // Trigger ripple at bench tab
      if (benchTabRef.current) {
        const benchRect = benchTabRef.current.getBoundingClientRect();
        setRipplePos({
          x: benchRect.left + benchRect.width / 2,
          y: benchRect.top + benchRect.height / 2
        });
        setTimeout(() => setRipplePos(null), 1000);
      }
      
      // Switch to bench
      setActiveTab('bench');
      
      // Add to feed
      setFeed(prev => [
        {
          id: Date.now().toString(),
          type: 'update',
          text: <span><span className="text-cyan-400 font-bold">{newEmployee.name}</span> has joined the Bench. Oracle predicts high synergy with active Streams.</span>
        },
        ...prev
      ]);
    }, 1000);
  };

  return (
    <div
      className={cn("w-full flex flex-col p-8 min-h-full transition-all duration-500 ease-in-out bg-[#020617] text-slate-50 pb-32", isAgentOpen ? "pr-[392px]" : "pr-8")}
    >
      {/* Ripple Effect */}
      {ripplePos && (
        <div 
          className="fixed z-[300] pointer-events-none"
          style={{ left: ripplePos.x, top: ripplePos.y }}
        >
          <div className="w-4 h-4 bg-cyan-400 rounded-full animate-ripple absolute -translate-x-1/2 -translate-y-1/2 shadow-[0_0_20px_rgba(34,211,238,0.8)]" />
          <div className="w-4 h-4 bg-teal-400 rounded-full animate-ripple absolute -translate-x-1/2 -translate-y-1/2 delay-100 shadow-[0_0_20px_rgba(13,148,136,0.8)]" />
        </div>
      )}

      {/* Flying Talent Card Pebble */}
      <AnimatePresence>
        {flyingCard && (
          <motion.div
            initial={{ 
              x: flyingCard.startX, 
              y: flyingCard.startY, 
              scale: 0.8,
              opacity: 1,
              borderRadius: '24px'
            }}
            animate={{ 
              x: benchTabRef.current ? benchTabRef.current.getBoundingClientRect().left : 0, 
              y: benchTabRef.current ? benchTabRef.current.getBoundingClientRect().top : 0,
              scale: 0.1,
              opacity: 0,
              borderRadius: '50%'
            }}
            transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
            className="fixed z-[250] w-64 h-32 bg-cyan-500 shadow-[0_0_40px_rgba(34,211,238,0.6)] flex items-center justify-center pointer-events-none"
          >
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-[#020617] flex items-center justify-center font-bold text-cyan-400">
                 {flyingCard.employee.avatar}
               </div>
               <span className="text-sm font-bold text-[#020617]">{flyingCard.employee.name}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full flex flex-col">

        {/* Identical Header (Matches Streams/LibraryDashboard) */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5 sticky top-0 bg-[#020617]/90 backdrop-blur-md z-40 relative">
          <h1 className="text-3xl font-bold font-sans tracking-tight text-slate-100 flex items-center gap-3">
            Team
          </h1>

          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 bg-[#0a192f]/60 border border-slate-800/60 rounded-full shadow-inner shadow-black/20">
            <button
              onClick={() => setActiveTab('crew')}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-all outline-none",
                activeTab === 'crew' ? "bg-teal-950/80 text-teal-400 shadow-inner shadow-teal-500/20 border border-teal-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}
            >
              The Crew
            </button>
            <button
              ref={benchTabRef}
              onClick={() => setActiveTab('bench')}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-all outline-none",
                activeTab === 'bench' ? "bg-teal-950/80 text-teal-400 shadow-inner shadow-teal-500/20 border border-teal-500/20" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}
            >
              The Bench
            </button>
          </div>

          <div className="flex items-center gap-4 pr-4">
            <button 
              onClick={() => setIsOnboardingOpen(true)}
              className="px-5 py-2.5 rounded-full bg-transparent border border-cyan-500/50 text-cyan-400 text-sm font-bold uppercase tracking-[0.1em] hover:bg-cyan-500 hover:text-[#020617] transition-all flex items-center gap-2 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] active:scale-95"
            >
              <Plus className="w-4 h-4" />
              ONBOARD
            </button>
          </div>
        </div>

        {/* Search & Filter Logic (Below the Header) */}
        <div className="flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center bg-[#0a192f]/20 backdrop-blur-xl border border-white/5 p-4 rounded-[28px] mb-8">
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            {/* Search */}
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name, role, or ID..."
                className="w-full bg-[#0a192f]/40 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all font-mono"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Skill Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <select
                className="appearance-none bg-[#0a192f]/40 border border-white/10 rounded-2xl py-3 pl-10 pr-10 text-xs font-bold text-slate-400 focus:outline-none focus:border-cyan-500/50 uppercase tracking-widest cursor-pointer"
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
              >
                {allSkills.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
              <SlidersHorizontal className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                className="appearance-none bg-[#0a192f]/40 border border-white/10 rounded-2xl py-3 pl-6 pr-10 text-xs font-bold text-slate-400 focus:outline-none focus:border-cyan-500/50 uppercase tracking-widest cursor-pointer"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option>All Status</option>
                <option>Available</option>
                <option>Saturated</option>
                <option>Blocked</option>
              </select>
              <SlidersHorizontal className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600 pointer-events-none" />
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-xs font-bold font-mono tracking-wider text-slate-400 uppercase">
             <span className="text-slate-500 opacity-80">Capacity:</span>
             <span>{filteredEmployees.length} <span className="text-slate-700 mx-1">/</span> {employees.length}</span>
          </div>
        </div>

        <Tabs defaultValue="crew" value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="crew" className="mt-0 outline-none">
            <AISkillsBanner onRecommend={handleRecommend} isRecommending={isRecommending} />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredEmployees.map((emp) => (
                  <TalentCard
                    key={emp.id}
                    employee={emp}
                    onClick={handleCardClick}
                    isHighlighted={highlightedIds.includes(emp.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>

          <TabsContent value="bench" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredEmployees.map((emp) => (
                  <TalentCard
                    key={emp.id}
                    employee={emp}
                    onClick={handleCardClick}
                    isHighlighted={highlightedIds.includes(emp.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <PerformanceModal
        employee={selectedEmployee}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onAdd={handleOnboardComplete}
      />

      <AgentPanel feed={feed} isOpen={isAgentOpen} onToggle={setIsAgentOpen} />
    </div>
  );
}
