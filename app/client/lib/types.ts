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
  speed: Speed;
}

export const SPPED = {
  "2X": "2x",
  "4X": "4x",
  "8X": "8x",
};

export type Speed = (typeof SPPED)[keyof typeof SPPED];
