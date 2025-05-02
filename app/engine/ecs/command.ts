export type CommandType = "create" | "delete" | "update";
export type CommandName =
  | "CreateRequest"
  | "ProceedMessage"
  | "DeleteMessage"
  | "CreateTask";

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
