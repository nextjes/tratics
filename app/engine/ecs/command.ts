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
