export interface Message {
  rrcId: string;
  srcId: string;
  dstId: string;
  size: number;
  transmittedSize: number;
}

export interface Task {
  rrcId: string;
  duration: number;
  elapsed: number;
}
