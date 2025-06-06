export interface IMessage {
  requestId: string;
  size: number;
  transmittedSize: number;
}

export interface ITask {
  requestId: string;
  srcId: string;
  dstId: string;
  duration: number;
  elapsed: number;
  createdAt: number;
}

export interface ICore {
  task: ITask | null;
}
