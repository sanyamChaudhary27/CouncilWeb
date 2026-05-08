import { StateCreator } from 'zustand';
import { CouncilNode, CouncilSynapse, BrainstormMessage } from '@/types';
import { AVAILABLE_MODELS } from '@/lib/constants';

export interface CouncilSlice {
  nodes: CouncilNode[];
  edges: CouncilSynapse[];
  selectedNodeId: string | null;
  messages: BrainstormMessage[];
  isDeliberating: boolean;
  objective: string;
  consensusScore: number | null;
  
  addNode: () => void;
  updateNode: (id: string, updates: Partial<CouncilNode>) => void;
  removeNode: (id: string) => void;
  selectNode: (id: string | null) => void;
  setObjective: (objective: string) => void;
  startDeliberation: () => void;
  stopDeliberation: () => void;
  addMessage: (message: BrainstormMessage) => void;
  appendTokenToMessage: (nodeId: string, token: string) => void;
  setConsensusScore: (score: number | null) => void;
  clearMessages: () => void;
  autoAssembleCouncil: (intensity: 'low' | 'medium' | 'high' | 'xhigh' | 'max', task: string) => Promise<void>;
}

export const createCouncilSlice: StateCreator<CouncilSlice> = (set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  messages: [],
  isDeliberating: false,
  objective: '',
  consensusScore: null,

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

  updateNode: (id, updates) => set((state) => ({
    nodes: state.nodes.map(node => node.id === id ? { ...node, ...updates } : node)
  })),

  removeNode: (id) => set((state) => ({
    nodes: state.nodes.filter(node => node.id !== id),
    edges: state.edges.filter(edge => edge.sourceId !== id && edge.targetId !== id),
    selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId
  })),

  selectNode: (id) => set({ selectedNodeId: id }),
  setObjective: (objective) => set({ objective }),
  startDeliberation: () => set({ isDeliberating: true }),
  stopDeliberation: () => set({ isDeliberating: false }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  
  appendTokenToMessage: (nodeId, token) => {
    set((state) => {
      const lastMessageIndex = state.messages.findLastIndex(m => m.nodeId === nodeId);
      if (lastMessageIndex === -1) {
        const node = state.nodes.find(n => n.id === nodeId);
        return {
          messages: [...state.messages, {
            nodeId,
            nodeName: node?.name || 'Unknown',
            role: node?.role || 'architect',
            content: token,
            timestamp: Date.now()
          }]
        };
      }
      const newMessages = [...state.messages];
      newMessages[lastMessageIndex] = {
        ...newMessages[lastMessageIndex],
        content: newMessages[lastMessageIndex].content + token
      };
      return { messages: newMessages };
    });
  },

  setConsensusScore: (score) => set({ consensusScore: score }),
  clearMessages: () => set({ messages: [] }),
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
});
