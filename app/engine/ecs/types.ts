import type { MessageStatus } from "./status";

export interface IMessage {
  rrcId: string;
  srcId: string;
  dstId: string;
  size: number;
  status: MessageStatus;
  transmittedSize: number;

  transmit(bytes: number): IMessage;
}

export interface ITask {
  rrcId: string;
  duration: number;
  elapsed: number;
}
