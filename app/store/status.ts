import type {
  RunningStatus,
  SimulationDifficulty,
  SimulationSettings,
} from "~/engine/settings";

interface CoreStatus {
  status: "busy" | "idle";
}

export interface NodeMetrics {
  id: string;
  cores: CoreStatus[];
}

export interface LinkMetrics {
  srcId: string;
  dstId: string;
  throughput: number;
}

export interface TemporalStatus {
  time: string;
  successRequest: number;
  nodes: NodeMetrics[];
  links: LinkMetrics[];

  setTime: (time: string) => void;
  setSuccessRequest: (successRequest: number) => void;
  setNodes: (nodes: NodeMetrics[]) => void;
  setLinks: (links: LinkMetrics[]) => void;
}

export interface SimulationConfig extends SimulationSettings {
  setTotalRequest: (totalRequest: number) => void;
  setSimulationScale: (simulationScale: number) => void;
  setDifficulty: (difficulty: SimulationDifficulty) => void;
  setRunningStatus: (runningStatus: RunningStatus) => void;
  setSimulationConfig: (config: Partial<SimulationSettings>) => void;
}
