export interface ServerTask {
  id: string;
  time: number;
}

export type Status = "stopped" | "started" | "paused";

export interface SimulationConfig {
  requests: number;
  nodes: number;
  cores: number;
  difficulty: string;
}
