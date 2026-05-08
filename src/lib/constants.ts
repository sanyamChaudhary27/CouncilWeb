export const AVAILABLE_MODELS = {
  NIM: {
    MISTRAL_LARGE: 'mistralai/mistral-large-3-675b-instruct-2512',
    KIMI: 'moonshotai/kimi-k2.6',
    DEEPSEEK_V4: 'deepseek-ai/deepseek-v4-pro',
  },
  OLLAMA: {
    LLAMA3: 'llama3',
    MISTRAL: 'mistral',
    PHI3: 'phi3',
  }
};

export const PROVIDERS = [
  { id: 'nvidia', name: 'NVIDIA NIM' },
  { id: 'ollama', name: 'Ollama (Local/Cloud)' },
  { id: 'openrouter', name: 'OpenRouter' }
];

export const ROLES = [
  { id: 'architect', name: 'The Architect' },
  { id: 'critic', name: 'The Critic' },
  { id: 'maverick', name: 'The Maverick' },
  { id: 'realist', name: 'The Realist' },
  { id: 'synthesizer', name: 'The Synthesizer' }
];
