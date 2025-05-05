export type CommandType = "create" | "delete" | "update";
export type CommandName =
  | "CreateRequest"
  | "ProceedMessage"
  | "DeleteMessage"
  | "CreateTask"
  | "ProceedTask";

export interface Command {
  type: CommandType;
  name: CommandName;
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

export interface DeleteMessage extends Command {
  requestId: string;
}

export interface CreateTask extends Command {
  requestId: string;
  createdAt: number;
}

export interface ProceedTask extends Command {
  requestId: string;
  proceeded: number;
}
