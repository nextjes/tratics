import { create } from "zustand";
import type { LinkMetrics, NodeMetrics, TemporalStatus } from "./status";

export const useSimulationMetrics = create<TemporalStatus>((set) => ({
  time: "0",
  successRequest: 0,
  nodes: [],
  links: [],
  setTime: (time: string) => set(() => ({ time })),
  setSuccessRequest: (successRequest: number) =>
    set(() => ({ successRequest })),
  setNodes: (nodes: NodeMetrics[]) => set(() => ({ nodes })),
  setLinks: (links: LinkMetrics[]) => set(() => ({ links })),
}));

export const useSimulationTime = () =>
  useSimulationMetrics((state) => state.time);
export const useSuccessRequest = () =>
  useSimulationMetrics((state) => state.successRequest);
export const useNodes = () => useSimulationMetrics((state) => state.nodes);
export const useLinks = () => useSimulationMetrics((state) => state.links);
