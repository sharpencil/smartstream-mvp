export type StreamColorKey = 'teal' | 'purple' | 'cyan' | 'blue' | 'indigo' | 'emerald';

export interface StreamDef {
  id: string;
  title: string;
  initials: string;
  colorKey: StreamColorKey;
}

export const STREAM_COLORS: Record<StreamColorKey, { hex: string, tw: string }> = {
  teal: { hex: '#14b8a6', tw: 'teal-500' },       // Teal 500
  purple: { hex: '#a855f7', tw: 'purple-500' },   // Purple 500
  cyan: { hex: '#06b6d4', tw: 'cyan-500' },       // Cyan 500
  blue: { hex: '#3b82f6', tw: 'blue-500' },       // Blue 500
  indigo: { hex: '#6366f1', tw: 'indigo-500' },   // Indigo 500
  emerald: { hex: '#10b981', tw: 'emerald-500' }, // Emerald 500
};

export interface Reference {
  type: 'stream' | 'doc' | 'design';
  targetId?: string; // e.g. 's_auth'
  label?: string;    // e.g. 'PRD', 'Figma'
}

export interface DropDef {
  id: string;
  title: string;
  skill: string;
  effort: string;
  icon: any; // Lucide icon
  state: string;
  references?: Reference[];
}

export const GLOBAL_STREAMS: Record<string, StreamDef> = {
  's_auth': { id: 's_auth', title: 'Identity & Auth Hub', initials: 'AUTH', colorKey: 'purple' },
  's_infra': { id: 's_infra', title: 'Core Infrastructure', initials: 'CORE', colorKey: 'teal' },
  's_ux': { id: 's_ux', title: 'User Experience', initials: 'UX', colorKey: 'blue' },
  's_billing': { id: 's_billing', title: 'Payment Gateway', initials: 'PAY', colorKey: 'emerald' },
  's_comms': { id: 's_comms', title: 'Communications', initials: 'COM', colorKey: 'cyan' },
};
