// store.ts
import { create } from "zustand";

interface MemoryState {
  isRunning: boolean;
  clock: string;
  nodeStatus: string;
  setClock: (clock: string) => void;
  setNodeStatus: (nodeStatus: string) => void;
  setIsRunning: (isRunning: boolean) => void;
}

export const useMemoryState = create<MemoryState>((set) => ({
  isRunning: false,
  clock: "0.0",
  nodeStatus: "0.0",
  setClock: (clock: string) => set(() => ({ clock })),
  setNodeStatus: (nodeStatus: string) =>
    set(() => ({ nodeStatus: nodeStatus })),
  setIsRunning: (isRunning: boolean) => set(() => ({ isRunning })),
}));

export const useMemoryClock = () => useMemoryState((state) => state.clock);
export const useDummyNodeValue = () =>
  useMemoryState((state) => state.nodeStatus);
export const useIsRunning = () => useMemoryState((state) => state.isRunning);
