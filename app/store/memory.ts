// store.ts
import { create } from "zustand";

interface MemoryState {
  isRunning: boolean;
  clock: string;
  dummyNodeValue: string;
  setClock: (clock: string) => void;
  setDummyNodeValue: (dummyNodeValue: string) => void;
  setIsRunning: (isRunning: boolean) => void;
}

export const useMemoryState = create<MemoryState>((set) => ({
  isRunning: false,
  clock: "0.0",
  dummyNodeValue: "0.0",
  setClock: (clock: string) => set(() => ({ clock })),
  setDummyNodeValue: (dummyNodeValue: string) =>
    set(() => ({ dummyNodeValue })),
  setIsRunning: (isRunning: boolean) => set(() => ({ isRunning })),
}));

export const useMemoryClock = () => useMemoryState((state) => state.clock);
export const useDummyNodeValue = () =>
  useMemoryState((state) => state.dummyNodeValue);
export const useIsRunning = () => useMemoryState((state) => state.isRunning);
