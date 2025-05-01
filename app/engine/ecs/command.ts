export type CommandType = "create" | "delete" | "update";

export interface Command {
  type: CommandType;
}

export interface CreateRequest extends Command {
  requestId: string;
  srcId: string;
  dstId: string;
  size: number;
}

export interface ProceedMessage extends Command {
  requestId: string;
  transmittedSize: number;
}

export interface PublishArrivedMessage extends Command {
  requestId: string;
  arrivedAt: number;
}
