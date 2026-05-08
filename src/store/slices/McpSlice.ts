import { StateCreator } from 'zustand';

export interface McpSlice {
  mcpTools: { id: string, name: string, active: boolean, description: string }[];
  toggleMcpTool: (id: string) => void;
}

export const createMcpSlice: StateCreator<McpSlice> = (set) => ({
  mcpTools: [
    { id: 't1', name: 'Search Engine', active: true, description: 'Web search capabilities' },
    { id: 't2', name: 'Code Sandbox', active: false, description: 'Python execution environment' },
    { id: 't3', name: 'File System', active: true, description: 'Local file read/write' }
  ],
  toggleMcpTool: (id) => set((state) => ({
    mcpTools: state.mcpTools.map(t => t.id === id ? { ...t, active: !t.active } : t)
  })),
});
