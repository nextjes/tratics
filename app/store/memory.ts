// store.ts
import { create } from "zustand";

interface MemoryState {
  isRunning: boolean;
  clock: string;
  nodeStatus: any;
  linkStatus: any; // This property is missing in the interface
  setClock: (clock: string) => void;
  setNodeStatus: (nodeStatus: any) => void;
  setLinkStatus: (linkStatus: any) => void;
  setIsRunning: (isRunning: boolean) => void;
}

export const useMemoryState = create<MemoryState>((set) => ({
  isRunning: false,
  clock: "0.0",
  nodeStatus: null,
  linkStatus: null,
  setClock: (clock: string) => set(() => ({ clock })),
  setNodeStatus: (nodeStatus: any) => set(() => ({ nodeStatus: nodeStatus })),
  setLinkStatus: (linkStatus: any) => set(() => ({ linkStatus: linkStatus })),
  setIsRunning: (isRunning: boolean) => set(() => ({ isRunning })),
}));

export const useMemoryClock = () => useMemoryState((state) => state.clock);
export const useNodeStatus = () => useMemoryState((state) => state.nodeStatus);
export const useLinkStatus = () => useMemoryState((state) => state.linkStatus);
export const useIsRunning = () => useMemoryState((state) => state.isRunning);
