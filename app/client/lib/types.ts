export interface ServerTask {
  id: string;
  time: number;
}

export const STATUS = {
  STOPPED: "stopped",
  STARTED: "started",
  PAUSED: "paused",
};

export type Status = (typeof STATUS)[keyof typeof STATUS];
export interface SimulationConfig {
  requests: number;
  nodes: number;
  cores: number;
  difficulty: string;
  speed: Speed;
}

export const SPPED = {
  "1x": 1,
  "2x": 2,
  "4x": 4,
  "8x": 8,
};

export type Speed = (typeof SPPED)[keyof typeof SPPED];
