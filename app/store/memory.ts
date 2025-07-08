import { create } from "zustand";
import type {
  LinkMetrics,
  NodeMetrics,
  SimulationConfig,
  TemporalStatus,
} from "./status";
import type {
  RunningStatus,
  SimulationDifficulty,
  SimulationSettings,
} from "~/engine/settings";
import type { SimulationResult } from "~/engine/ecs/status";

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

export const useSimulationConfig = create<SimulationConfig>((set) => ({
  totalRequest: 0,
  simulationScale: 1,
  difficulty: "normal",
  runningStatus: "stopped",
  timeLimit: 30000,
  nodes: [{ id: "node1", coreCount: 4 }],
  setTotalRequest: (totalRequest: number) => set(() => ({ totalRequest })),
  setSimulationScale: (simulationScale: number) =>
    set(() => ({ simulationScale })),
  setDifficulty: (difficulty: SimulationDifficulty) =>
    set(() => ({ difficulty })),
  setRunningStatus: (runningStatus: RunningStatus) =>
    set(() => ({ runningStatus })),
  setSimulationConfig: (config: Partial<SimulationSettings>) =>
    set(() => ({ ...config })),
}));

export const useTotalRequest = () =>
  useSimulationConfig((state) => state.totalRequest);
export const useSimulationScale = () =>
  useSimulationConfig((state) => state.simulationScale);
export const useDifficulty = () =>
  useSimulationConfig((state) => state.difficulty);
export const useRunningStatus = () =>
  useSimulationConfig((state) => state.runningStatus);
export const useSetTotalRequest = () =>
  useSimulationConfig((state) => state.setTotalRequest);
export const useSetSimulationScale = () =>
  useSimulationConfig((state) => state.setSimulationScale);
export const useSetDifficulty = () =>
  useSimulationConfig((state) => state.setDifficulty);
export const useSetRunningStatus = () =>
  useSimulationConfig((state) => state.setRunningStatus);
export const useSetSimulationConfig = () =>
  useSimulationConfig((state) => state.setSimulationConfig);
export const useConfigNodes = () => useSimulationConfig((state) => state.nodes);
export const useSetConfigNodes = () =>
  useSimulationConfig(
    (state) => (nodes: { id: string; coreCount: number }[]) =>
      state.setSimulationConfig({ nodes })
  );
export const useTimeLimit = () =>
  useSimulationConfig((state) => state.timeLimit);

export const useSimulationResult = create<SimulationResult>((set) => ({
  isSuccess: undefined,
  processedRequestCount: 0,
  elapsedTime: 0,
  succeed: (processedRequestCount: number, elapsedTime: number) =>
    set(() => ({
      isSuccess: true,
      processedRequestCount,
      elapsedTime,
    })),
  fail: (processedRequestCount: number, elapsedTime: number) =>
    set(() => ({
      isSuccess: false,
      processedRequestCount,
      elapsedTime,
    })),
  reset: () =>
    set(() => ({
      isSuccess: undefined,
      processedRequestCount: 0,
      elapsedTime: 0,
    })),
}));

export const useIsSuccess = () =>
  useSimulationResult((state) => state.isSuccess);
export const useProcessedRequestCount = () =>
  useSimulationResult((state) => state.processedRequestCount);
export const useElapsedTime = () =>
  useSimulationResult((state) => state.elapsedTime);
