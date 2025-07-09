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

export const SIMULATION_DIFFICULTY = {
  EASY: "easy",
  NORMAL: "normal",
  HARD: "hard",
};
export const RUNNING_STATUS = {
  RUNNING: "running",
  PAUSED: "paused",
  STOPPED: "stopped",
};

export type SimulationDifficulty =
  (typeof SIMULATION_DIFFICULTY)[keyof typeof SIMULATION_DIFFICULTY];
export type RunningStatus =
  (typeof RUNNING_STATUS)[keyof typeof RUNNING_STATUS];

export interface NodeSpec {
  id: string;
  coreCount: number;
}

export interface SimulationSettings {
  runningStatus: RunningStatus;
  simulationScale: number;
  difficulty: SimulationDifficulty;
  totalRequest: number;
  timeLimit: number;
  nodes: NodeSpec[];
}

export interface SimulationConfig extends SimulationSettings {
  setTotalRequest: (totalRequest: number) => void;
  setSimulationScale: (simulationScale: number) => void;
  setDifficulty: (difficulty: SimulationDifficulty) => void;
  setRunningStatus: (runningStatus: RunningStatus) => void;
  setSimulationConfig: (config: Partial<SimulationSettings>) => void;
}

export interface SimulationResult {
  isSuccess: boolean | undefined;
  processedRequestCount: number;
  elapsedTime: number;

  succeed: (processedRequestCount: number, elaspedTime: number) => void;
  fail: (processedRequestCount: number, elaspedTime: number) => void;
  reset: () => void;
}
