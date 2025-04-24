export interface Command {}

export interface CreateRequest extends Command {
  requestId: string;
  srcId: string;
  dstId: string;
  size: number;
}
