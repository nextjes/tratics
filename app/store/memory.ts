import { create } from "zustand";
import type { LinkMetrics, NodeMetrics, TemporalStatus } from "./status";
import type {
  RunningStatus,
  SimulationDifficulty,
  SimulationSettings,
} from "./settings";
import { RUNNING_STATUS, SIMULATION_DIFFICULTY } from "./settings";

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

export const useSimulationSettings = create<SimulationSettings>((set) => ({
  runningStatus: RUNNING_STATUS.STOPPED,
  simulationScale: 1,
  difficulty: SIMULATION_DIFFICULTY.NORMAL,
  totalRequest: 0,
  setRunningStatus: (runningStatus: RunningStatus) =>
    set(() => ({ runningStatus })),
  setSimulationScale: (simulationScale: number) =>
    set(() => ({ simulationScale })),
  setDifficulty: (difficulty: SimulationDifficulty) =>
    set(() => ({ difficulty })),
  setTotalRequest: (totalRequest: number) => set(() => ({ totalRequest })),
}));

export const useRunningStatus = () =>
  useSimulationSettings((state) => state.runningStatus);
export const useSimulationScale = () =>
  useSimulationSettings((state) => state.simulationScale);
export const useDifficulty = () =>
  useSimulationSettings((state) => state.difficulty);
export const useTotalRequest = () =>
  useSimulationSettings((state) => state.totalRequest);
export const useSetTotalRequest = () =>
  useSimulationSettings((state) => state.setTotalRequest);
export const useSetScale = () =>
  useSimulationSettings((state) => state.setSimulationScale);
export const useSetDifficulty = () =>
  useSimulationSettings((state) => state.setDifficulty);
