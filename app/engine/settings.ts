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

export const simulationSettings: SimulationSettings = {
  runningStatus: RUNNING_STATUS.STOPPED,
  simulationScale: 1,
  difficulty: SIMULATION_DIFFICULTY.NORMAL,
  totalRequest: 100,
  timeLimit: 30000, // 30 seconds
  nodes: [{ id: "node1", coreCount: 4 }],
};
