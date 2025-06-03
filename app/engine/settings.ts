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

export interface SimulationSettings {
  runningStatus: RunningStatus;
  simulationScale: number;
  difficulty: SimulationDifficulty;
  totalRequest: number;
}

export const simulationSettings: SimulationSettings = {
  runningStatus: RUNNING_STATUS.STOPPED,
  simulationScale: 1,
  difficulty: SIMULATION_DIFFICULTY.NORMAL,
  totalRequest: 0,
}
