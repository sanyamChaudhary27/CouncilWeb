import { create } from 'zustand';
import { CouncilNode, CouncilSynapse, BrainstormMessage } from '@/types';
import { AVAILABLE_MODELS } from '@/lib/constants';
import { createClient } from '@/lib/supabase';

const supabase = createClient();

interface CouncilState {
  nodes: CouncilNode[];
  edges: CouncilSynapse[];
  selectedNodeId: string | null;
  messages: BrainstormMessage[];
  isDeliberating: boolean;
  objective: string;
  consensusScore: number | null;
  activeView: 'workspace' | 'council' | 'library' | 'mcp' | 'catalog' | 'projects';
  currentSessionId: string | null;
  projects: { id: string, name: string, models: string[], sessions: { id: string, name: string, persistMemory: boolean }[] }[];
  mcpTools: { id: string, name: string, active: boolean, description: string }[];
  catalog: { id: string, name: string, provider: string, latency: number, status: 'active' | 'inactive' }[];
  sessionHistory: string[];
  sessionSummary: string;
  blueprints: { id: string, name: string, nodes: CouncilNode[] }[];
  libraryItems: { id: string, type: 'session' | 'code', title: string, content: string, timestamp: number }[];
  
  // Actions
  addNode: () => void;
  updateNode: (id: string, updates: Partial<CouncilNode>) => void;
  removeNode: (id: string) => void;
  selectNode: (id: string | null) => void;
  setObjective: (objective: string) => void;
  setView: (view: CouncilState['activeView']) => void;
  startDeliberation: () => void;
  stopDeliberation: () => void;
  addMessage: (message: BrainstormMessage) => void;
  appendTokenToMessage: (nodeId: string, token: string) => void;
  setConsensusScore: (score: number | null) => void;
  clearMessages: () => void;
  addToSessionHistory: (takeaway: string) => void;
  updateSessionSummary: (summary: string) => void;
  saveCurrentCouncilAsBlueprint: (name: string) => Promise<void>;
  loadBlueprint: (id: string) => void;
  autoAssembleCouncil: (intensity: 'low' | 'medium' | 'high' | 'xhigh' | 'max', task: string) => Promise<void>;
  addToLibrary: (item: Omit<CouncilState['libraryItems'][0], 'id' | 'timestamp'>) => Promise<void>;
  fetchLibrary: () => Promise<void>;
  toggleMcpTool: (id: string) => void;
  createProject: (name: string, models: string[]) => void;
  createSession: (projectId: string, name: string, persistMemory: boolean) => void;
  updateCatalogLatency: (id: string, latency: number) => void;
}

export const useCouncilStore = create<CouncilState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  messages: [],
  isDeliberating: false,
  objective: '',
  consensusScore: null,
  activeView: 'workspace',
  currentSessionId: null,
  projects: [
    { 
      id: 'p1', name: 'PROJECT 1', models: ['llama-3.3-70b', 'mistral-large'], sessions: [
        { id: 's1', name: 'ARCHI', persistMemory: true },
        { id: 's2', name: 'ARCH 2', persistMemory: false }
      ] 
    }
  ],
  mcpTools: [
    { id: 't1', name: 'Search Engine', active: true, description: 'Web search capabilities' },
    { id: 't2', name: 'Code Sandbox', active: false, description: 'Python execution environment' },
    { id: 't3', name: 'File System', active: true, description: 'Local file read/write' }
  ],
  catalog: [
    { id: 'c1', name: 'Llama 3.3 70B', provider: 'Groq', latency: 0, status: 'active' },
    { id: 'c2', name: 'Mistral Large 3', provider: 'NVIDIA', latency: 0, status: 'active' },
    { id: 'c3', name: 'Kimi k2.6', provider: 'NVIDIA', latency: 0, status: 'active' },
    { id: 'c4', name: 'DeepSeek v4', provider: 'NVIDIA', latency: 0, status: 'active' },
    { id: 'c5', name: 'GPT-4o', provider: 'OpenAI', latency: 0, status: 'inactive' },
    { id: 'c6', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', latency: 0, status: 'inactive' },
    { id: 'c7', name: 'Gemini 1.5 Pro', provider: 'Google', latency: 0, status: 'inactive' },
    { id: 'c8', name: 'Qwen 2.5 72B', provider: 'Alibaba', latency: 0, status: 'inactive' },
    { id: 'c9', name: 'Phi-4', provider: 'Microsoft', latency: 0, status: 'inactive' },
    { id: 'c10', name: 'Gemma 2 27B', provider: 'Google', latency: 0, status: 'inactive' },
    // ... adding more to reach 20-30
    ...Array.from({ length: 15 }).map((_, i) => ({
      id: `m-${i + 11}`,
      name: `Specialized Model ${i + 11}`,
      provider: ['NVIDIA', 'Groq', 'HuggingFace'][i % 3],
      latency: 0,
      status: 'inactive' as const
    }))
  ],
  sessionHistory: [],
  sessionSummary: '',
  blueprints: [],
  libraryItems: [],

  setView: (view) => {
    const systemViews = ['workspace', 'council', 'library', 'mcp', 'catalog', 'projects'];
    const isSession = !systemViews.includes(view);
    
    set({ 
      activeView: isSession ? 'workspace' : view as any, 
      currentSessionId: isSession ? view : null 
    });
  },
  toggleMcpTool: (id) => set((state) => ({
    mcpTools: state.mcpTools.map(t => t.id === id ? { ...t, active: !t.active } : t)
  })),

  createProject: async (name, models) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase.from('projects').insert({
      name: name.toUpperCase(),
      models,
      user_id: user.id
    }).select().single();

    if (!error && data) {
      set((state) => ({
        projects: [...state.projects, { ...data, sessions: [] }]
      }));
    }
  },

  createSession: async (projectId, name, persistMemory) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase.from('sessions').insert({
      project_id: projectId,
      name: name.toUpperCase(),
      persist_memory: persistMemory,
      user_id: user.id
    }).select().single();

    if (!error && data) {
      set((state) => ({
        projects: state.projects.map(p => p.id === projectId ? {
          ...p,
          sessions: [...(p.sessions || []), data]
        } : p)
      }));
    }
  },

  updateCatalogLatency: (id: string, latency: number) => set((state) => ({
    catalog: state.catalog.map(c => c.id === id ? { ...c, latency } : c)
  })),

  addNode: () => {
    const roles: CouncilNode['role'][] = ['architect', 'critic', 'maverick', 'realist', 'synthesizer'];
    const randomRole = roles[Math.floor(Math.random() * roles.length)];
    const id = Math.random().toString(36).substring(2, 9);
    
    const newNode: CouncilNode = {
      id,
      name: `${randomRole.charAt(0).toUpperCase() + randomRole.slice(1)} Node`,
      model: AVAILABLE_MODELS.NIM.MISTRAL_LARGE,
      provider: 'nvidia',
      role: randomRole,
      position: [(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5],
      status: 'idle',
      confidence: 0
    };
    
    set((state) => ({ nodes: [...state.nodes, newNode] }));
  },

  updateNode: (id, updates) => {
    set((state) => ({
      nodes: state.nodes.map(node => node.id === id ? { ...node, ...updates } : node)
    }));
  },

  setConsensusScore: (score) => set({ consensusScore: score }),

  removeNode: (id) => {
    set((state) => ({
      nodes: state.nodes.filter(node => node.id !== id),
      edges: state.edges.filter(edge => edge.sourceId !== id && edge.targetId !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId
    }));
  },

  selectNode: (id) => set({ selectedNodeId: id }),
  
  setObjective: (objective) => set({ objective }),
  
  startDeliberation: () => set({ isDeliberating: true }),
  
  stopDeliberation: () => set({ isDeliberating: false }),
  
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  
  appendTokenToMessage: (nodeId: string, token: string) => {
    set((state) => {
      const lastMessageIndex = state.messages.findLastIndex(m => m.nodeId === nodeId);
      
      if (lastMessageIndex === -1) {
        // Create new message for this node
        const node = state.nodes.find(n => n.id === nodeId);
        const newMessage: BrainstormMessage = {
          nodeId,
          nodeName: node?.name || 'Unknown',
          role: node?.role || 'architect',
          content: token,
          timestamp: Date.now()
        };
        return { messages: [...state.messages, newMessage] };
      } else {
        // Append to existing message
        const newMessages = [...state.messages];
        newMessages[lastMessageIndex] = {
          ...newMessages[lastMessageIndex],
          content: newMessages[lastMessageIndex].content + token
        };
        return { messages: newMessages };
      }
    });
  },

  clearMessages: () => set({ messages: [] }),

  addToSessionHistory: (takeaway) => set((state) => ({
    sessionHistory: [...state.sessionHistory, takeaway]
  })),

  updateSessionSummary: (summary) => set({ sessionSummary: summary }),

  saveCurrentCouncilAsBlueprint: async (name) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { nodes } = get();
    const { error } = await supabase.from('blueprints').insert({
      name,
      nodes,
      user_id: user.id
    });

    if (!error) {
      get().fetchLibrary();
    }
  },

  loadBlueprint: (id) => set((state) => {
    const bp = state.blueprints.find(b => b.id === id);
    if (bp) return { nodes: bp.nodes };
    return {};
  }),

  autoAssembleCouncil: async (intensity, task) => {
    try {
      const response = await fetch('/api/council/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intensity, task })
      });
      const data = await response.json();
      
      const newNodes: CouncilNode[] = data.agents.map((agent: any) => ({
        ...agent,
        id: Math.random().toString(36).substr(2, 9),
        position: [(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5],
        status: 'idle',
        confidence: 0
      }));
      
      set({ nodes: newNodes });
    } catch (error) {
      console.error("Auto-assembly failed", error);
    }
  },

  addToLibrary: async (item) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('library_items').insert({
      ...item,
      timestamp: Date.now(),
      user_id: user.id
    });

    if (!error) {
      get().fetchLibrary();
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
        id: s.id,
        name: s.name,
        persistMemory: s.persist_memory
      }))
    }));

    set({ 
      blueprints: bpRes.data || [], 
      libraryItems: libRes.data || [],
      projects: formattedProjects
    });
  }
}));
