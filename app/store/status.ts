interface CoreStatus {
  status: "busy" | "idle";
}

export interface NodeMetrics {
  id: string;
  cores: CoreStatus[];
}

export interface LinkMetrics {
  srcId: string;
  dstId: string;
  throughput: number;
}

export interface SimulationStatus {
  isRunning: boolean;
  time: string;
  totalRequest: number;
  successRequest: number;
  nodes: NodeMetrics[];
  links: LinkMetrics[];

  setTime: (time: string) => void;
  setTotalRequest: (totalRequest: number) => void;
  setSuccessRequest: (successRequest: number) => void;
  setNodes: (nodes: NodeMetrics[]) => void;
  setLinks: (links: LinkMetrics[]) => void;
}
