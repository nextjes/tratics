import type { MessageStatus } from "./status";

export interface IMessage {
  requestId: string;
  size: number;
  transmittedSize: number;
}

export interface ITask {
  rrcId: string;
  duration: number;
  elapsed: number;
}
