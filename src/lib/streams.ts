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
  indigo: { hex: '#818CF8', tw: 'indigo-400' },
  fuchsia: { hex: '#E879F9', tw: 'fuchsia-400' },
  emerald: { hex: '#34D399', tw: 'emerald-400' },
  pink: { hex: '#38BDF8', tw: 'sky-400' },
  violet: { hex: '#A78BFA', tw: 'violet-400' },
  slate: { hex: '#94A3B8', tw: 'slate-400' },
};

export const PALETTE_KEYS: StreamColorKey[] = ['indigo', 'fuchsia', 'emerald', 'pink', 'violet', 'slate'];

export function getStreamColor(colorKey: string | undefined): { hex: string, tw: string } {
  if (colorKey && (PALETTE_KEYS as string[]).includes(colorKey)) {
    return STREAM_COLORS[colorKey as StreamColorKey];
  }
  return STREAM_COLORS.slate;
}

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
