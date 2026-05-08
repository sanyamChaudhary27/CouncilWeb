import { StateCreator } from 'zustand';

export interface CatalogSlice {
  catalog: any[];
  updateCatalogLatency: (id: string, latency: number) => void;
}

export const createCatalogSlice: StateCreator<CatalogSlice> = (set) => ({
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
    ...Array.from({ length: 15 }).map((_, i) => ({
      id: `m-${i + 11}`,
      name: `Specialized Model ${i + 11}`,
      provider: ['NVIDIA', 'Groq', 'HuggingFace'][i % 3] as any,
      latency: 0,
      status: 'inactive' as const
    }))
  ],
  updateCatalogLatency: (id, latency) => set((state) => ({
    catalog: state.catalog.map(c => c.id === id ? { ...c, latency } : c)
  })),
});
