export type ModelProvider = 'nvidia' | 'ollama' | 'openrouter';

export type NodeRole = 'architect' | 'critic' | 'synthesizer' | 'maverick' | 'realist';

export interface CouncilNode {
  id: string;
  name: string;
  model: string;
  provider: ModelProvider;
  role: NodeRole;
  position: [number, number, number];
  status: 'idle' | 'thinking' | 'done' | 'error';
  lastMessage?: string;
  confidence?: number;
  toolActivity?: string | null;
}

export interface CouncilSynapse {
  id: string;
  sourceId: string;
  targetId: string;
  active: boolean; // True when data is flowing
}

export interface BrainstormMessage {
  nodeId: string;
  nodeName: string;
  role: NodeRole;
  content: string;
  timestamp: number;
}
