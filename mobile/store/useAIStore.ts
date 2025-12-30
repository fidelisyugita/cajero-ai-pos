import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({
  id: 'ai-storage',
});

// Zustand MMKV Storage Wrapper
const mmkvStorage = {
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name: string) => {
    storage.delete(name);
  },
};

export type AIModelType = 'llama-3.2-1b' | 'stories-110m';

export interface AIModelConfig {
  id: AIModelType;
  name: string;
  filename: string;
  downloadUrl: string;
  description: string;
  requiredRam: string;
  sizeDesc: string;
  isTiny: boolean;
}

export const AI_MODELS: Record<AIModelType, AIModelConfig> = {
  'llama-3.2-1b': {
    id: 'llama-3.2-1b',
    name: 'Llama 3.2 1B (Standard)',
    filename: 'llama3_2-1B.pte',
    downloadUrl: "https://huggingface.co/executorch-community/Llama-3.2-1B-ET/resolve/main/llama3_2-1B.pte?download=true",
    description: "Standard model. High quality, requires ~4GB RAM.",
    requiredRam: "4GB",
    sizeDesc: "~1.1 GB",
    isTiny: false,
  },
  'stories-110m': {
    id: 'stories-110m',
    name: 'Stories 110M (Tiny)',
    filename: 'stories110M.pte',
    // Using a likely stable URL for stories110M executorch model
    downloadUrl: "https://huggingface.co/executorch/stories_110m/resolve/main/stories110M.pte?download=true",
    description: "Tiny model. Low memory usage, suitable for older devices.",
    requiredRam: "< 2GB",
    sizeDesc: "~110 MB",
    isTiny: true,
  }
};

interface AIState {
  selectedModel: AIModelType;
  setSelectedModel: (model: AIModelType) => void;
}

export const useAIStore = create<AIState>()(
  persist(
    (set) => ({
      selectedModel: 'llama-3.2-1b',
      setSelectedModel: (model) => set({ selectedModel: model }),
    }),
    {
      name: 'ai-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
