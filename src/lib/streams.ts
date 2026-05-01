export type StreamColorKey = 'indigo' | 'fuchsia' | 'emerald' | 'pink' | 'violet' | 'slate';

export interface StreamDef {
  id: string;
  workstream_id?: number | string;
  title: string;
  description?: string;
  initials: string;
  colorKey: StreamColorKey;
  priority?: string;
  complexity?: number;
  estimated_completion_time?: string | number;
  workstream_hash?: string;
}

export const STREAM_COLORS: Record<StreamColorKey, { hex: string, tw: string }> = {
  indigo: { hex: '#6366f1', tw: 'indigo-500' },
  fuchsia: { hex: '#D946EF', tw: 'fuchsia-500' },
  emerald: { hex: '#059669', tw: 'emerald-600' },
  pink: { hex: '#EC4899', tw: 'pink-500' },
  violet: { hex: '#8B5CF6', tw: 'violet-600' },
  slate: { hex: '#94A3B8', tw: 'slate-400' },
};

export interface Reference {
  type: 'stream' | 'doc' | 'design';
  targetId?: string; // e.g. 's_auth'
  label?: string;    // e.g. 'PRD', 'Figma'
}

export interface DropDef {
  id: string;
  drop_id?: string;
  title: string;
  tasks?: string[];
  priority?: string;
  complexity?: number;
  status?: string;
  drop_hash?: string;
  skill: string;
  effort: string;
  icon?: any; // Lucide icon
  state: string;
  references?: Reference[];
}

export const GLOBAL_STREAMS: Record<string, StreamDef> = {
  's_auth': { id: 's_auth', title: 'Identity & Auth Hub', initials: 'AUTH', colorKey: 'fuchsia' },
  's_infra': { id: 's_infra', title: 'Core Infrastructure', initials: 'CORE', colorKey: 'indigo' },
  's_ux': { id: 's_ux', title: 'User Experience', initials: 'UX', colorKey: 'violet' },
  's_billing': { id: 's_billing', title: 'Payment Gateway', initials: 'PAY', colorKey: 'slate' },
  's_comms': { id: 's_comms', title: 'Communications', initials: 'COM', colorKey: 'emerald' },
};
