export type SimulationDifficulty = "easy" | "normal" | "hard";
export type RunningStatus = "running" | "paused" | "stopped";

export interface SimulationSettings {
  runningStatus: RunningStatus;
  simulationScale: number;
  difficulty: SimulationDifficulty;
  totalRequest: number;

  setRunningStatus: (runningStatus: RunningStatus) => void;
  setSimulationScale: (simulationScale: number) => void;
  setDifficulty: (difficulty: SimulationDifficulty) => void;
  setTotalRequest: (totalRequest: number) => void;
}
