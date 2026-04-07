export interface HistoricalData {
  date: string;
  velocity: number;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  avatar: string;
  skills: string[];
  velocity: number; // Current speed
  avgVelocity: number; // Historical average
  availability: 'available' | 'saturated' | 'blocked';
  reliability: number; // 0-100 percentage
  history: HistoricalData[];
  projectHistory: string[];
  isAssigned: boolean; // Currently in 'The Crew'
  matchScore?: number; // For recommendations
}

export const mockEmployees: Employee[] = [
  {
    id: 'emp-1',
    name: 'Lena Vane',
    role: 'Lead Architect',
    avatar: 'LV',
    skills: ['System Design', 'Node.js', 'Go'],
    velocity: 88,
    avgVelocity: 82,
    availability: 'saturated',
    reliability: 96,
    isAssigned: true,
    history: [
      { date: 'Oct', velocity: 78 },
      { date: 'Nov', velocity: 85 },
      { date: 'Dec', velocity: 82 },
      { date: 'Jan', velocity: 90 },
      { date: 'Feb', velocity: 87 },
      { date: 'Mar', velocity: 88 },
    ],
    projectHistory: ['Project Neptune', 'Core Engine Refresh', 'Auth Zero'],
  },
  {
    id: 'emp-2',
    name: 'Marcus Thorne',
    role: 'Senior Frontend',
    avatar: 'MT',
    skills: ['React', 'Framer Motion', 'Tailwind'],
    velocity: 94,
    avgVelocity: 89,
    availability: 'available',
    reliability: 92,
    isAssigned: true,
    history: [
      { date: 'Oct', velocity: 85 },
      { date: 'Nov', velocity: 88 },
      { date: 'Dec', velocity: 92 },
      { date: 'Jan', velocity: 95 },
      { date: 'Feb', velocity: 93 },
      { date: 'Mar', velocity: 94 },
    ],
    projectHistory: ['Design System 2.0', 'Mobile Sync', 'Client X Dashboard'],
  },
  {
    id: 'emp-3',
    name: 'Sarah Chen',
    role: 'QA Engineer',
    avatar: 'SC',
    skills: ['Cypress', 'Playwright', 'Node.js'],
    velocity: 72,
    avgVelocity: 75,
    availability: 'blocked',
    reliability: 88,
    isAssigned: true,
    history: [
      { date: 'Oct', velocity: 70 },
      { date: 'Nov', velocity: 72 },
      { date: 'Dec', velocity: 74 },
      { date: 'Jan', velocity: 76 },
      { date: 'Feb', velocity: 73 },
      { date: 'Mar', velocity: 72 },
    ],
    projectHistory: ['Automation Suite', 'E2E Refactor'],
  },
  {
    id: 'emp-4',
    name: 'David Aris',
    role: 'Cloud Architect',
    avatar: 'DA',
    skills: ['AWS', 'Kubernetes', 'Cloud Infrastructure', 'Terraform'],
    velocity: 85,
    avgVelocity: 84,
    availability: 'available',
    reliability: 98,
    isAssigned: false,
    history: [
      { date: 'Oct', velocity: 80 },
      { date: 'Nov', velocity: 82 },
      { date: 'Dec', velocity: 85 },
      { date: 'Jan', velocity: 88 },
      { date: 'Feb', velocity: 86 },
      { date: 'Mar', velocity: 85 },
    ],
    projectHistory: ['Infra Migration', 'Scalability Sprint'],
  },
  {
    id: 'emp-5',
    name: 'Chloe Kim',
    role: 'Backend Dev',
    avatar: 'CK',
    skills: ['Go', 'Postgres', 'Redis'],
    velocity: 91,
    avgVelocity: 88,
    availability: 'available',
    reliability: 95,
    isAssigned: false,
    history: [
      { date: 'Oct', velocity: 85 },
      { date: 'Nov', velocity: 87 },
      { date: 'Dec', velocity: 89 },
      { date: 'Jan', velocity: 92 },
      { date: 'Feb', velocity: 90 },
      { date: 'Mar', velocity: 91 },
    ],
    projectHistory: ['Data Lake', 'API Optimizations'],
  },
  {
    id: 'emp-6',
    name: 'James Wilson',
    role: 'Fullstack Dev',
    avatar: 'JW',
    skills: ['React', 'Node.js', 'Postgres'],
    velocity: 79,
    avgVelocity: 81,
    availability: 'saturated',
    reliability: 90,
    isAssigned: false,
    history: [
      { date: 'Oct', velocity: 82 },
      { date: 'Nov', velocity: 80 },
      { date: 'Dec', velocity: 78 },
      { date: 'Jan', velocity: 81 },
      { date: 'Feb', velocity: 83 },
      { date: 'Mar', velocity: 79 },
    ],
    projectHistory: ['Legacy Port', 'Internal Tools'],
  },
];
