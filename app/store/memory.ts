import { create } from "zustand";
import type { LinkMetrics, NodeMetrics, SimulationStatus } from "./status";

export const useSimulationMetrics = create<SimulationStatus>((set) => ({
  isRunning: false,
  time: "0",
  totalRequest: 0,
  successRequest: 0,
  nodes: [],
  links: [],
  setTime: (time: string) => set(() => ({ time })),
  setTotalRequest: (totalRequest: number) => set(() => ({ totalRequest })),
  setSuccessRequest: (successRequest: number) =>
    set(() => ({ successRequest })),
  setNodes: (nodes: NodeMetrics[]) => set(() => ({ nodes })),
  setLinks: (links: LinkMetrics[]) => set(() => ({ links })),
}));

export const useSimulationTime = () =>
  useSimulationMetrics((state) => state.time);
export const useTotalRequest = () =>
  useSimulationMetrics((state) => state.totalRequest);
export const useSuccessRequest = () =>
  useSimulationMetrics((state) => state.successRequest);
export const useNodes = () => useSimulationMetrics((state) => state.nodes);
export const useLinks = () => useSimulationMetrics((state) => state.links);
export const useIsRunning = () =>
  useSimulationMetrics((state) => state.isRunning);
