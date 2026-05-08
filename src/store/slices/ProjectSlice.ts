import { StateCreator } from 'zustand';
import { CouncilNode } from '@/types';
import { createClient } from '@/lib/supabase';

const supabase = createClient();

export interface ProjectSlice {
  activeView: 'workspace' | 'council' | 'library' | 'mcp' | 'catalog' | 'projects';
  currentSessionId: string | null;
  projects: any[];
  blueprints: any[];
  libraryItems: any[];
  sessionHistory: string[];
  sessionSummary: string;

  setView: (view: string) => void;
  createProject: (name: string, models: string[]) => Promise<void>;
  createSession: (projectId: string, name: string, persistMemory: boolean) => Promise<void>;
  fetchLibrary: () => Promise<void>;
  addToLibrary: (item: any) => Promise<void>;
  saveCurrentCouncilAsBlueprint: (name: string, nodes: CouncilNode[]) => Promise<void>;
  updateSessionSummary: (summary: string) => void;
  addToSessionHistory: (takeaway: string) => void;
}

export const createProjectSlice: StateCreator<ProjectSlice> = (set, get) => ({
  activeView: 'workspace',
  currentSessionId: null,
  projects: [],
  blueprints: [],
  libraryItems: [],
  sessionHistory: [],
  sessionSummary: '',

  setView: (view) => {
    const systemViews = ['workspace', 'council', 'library', 'mcp', 'catalog', 'projects'];
    const isSession = !systemViews.includes(view);
    set({ 
      activeView: isSession ? 'workspace' : view as any, 
      currentSessionId: isSession ? view : null 
    });
  },

  createProject: async (name, models) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from('projects').insert({ name: name.toUpperCase(), models, user_id: user.id }).select().single();
    if (!error && data) set((state) => ({ projects: [...state.projects, { ...data, sessions: [] }] }));
  },

  createSession: async (projectId, name, persistMemory) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from('sessions').insert({ project_id: projectId, name: name.toUpperCase(), persist_memory: persistMemory, user_id: user.id }).select().single();
    if (!error && data) {
      set((state) => ({
        projects: state.projects.map(p => p.id === projectId ? { ...p, sessions: [...(p.sessions || []), data] } : p)
      }));
    }
  },

  fetchLibrary: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [bpRes, libRes, projRes, sessRes] = await Promise.all([
      supabase.from('blueprints').select('*').order('created_at', { ascending: false }),
      supabase.from('library_items').select('*').order('created_at', { ascending: false }),
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
      supabase.from('sessions').select('*').order('created_at', { ascending: false })
    ]);
    const formattedProjects = (projRes.data || []).map(p => ({
      ...p,
      sessions: (sessRes.data || []).filter(s => s.project_id === p.id).map(s => ({
        id: s.id, name: s.name, persistMemory: s.persist_memory
      }))
    }));
    set({ blueprints: bpRes.data || [], libraryItems: libRes.data || [], projects: formattedProjects });
  },

  addToLibrary: async (item) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('library_items').insert({ ...item, timestamp: Date.now(), user_id: user.id });
    if (!error) get().fetchLibrary();
  },

  saveCurrentCouncilAsBlueprint: async (name, nodes) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('blueprints').insert({ name, nodes, user_id: user.id });
    if (!error) get().fetchLibrary();
  },

  updateSessionSummary: (summary) => set({ sessionSummary: summary }),
  addToSessionHistory: (takeaway) => set((state) => ({ sessionHistory: [...state.sessionHistory, takeaway] })),
});
