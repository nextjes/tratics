export type RequestResponseCyclePhase =
  | "RequestQueueing"
  | "RequestTransmitting"
  | "TaskProcessing"
  | "ResponseTransmitting"
  | "ResponseReceived";

export type MessageStatus = "Created" | "InTransit" | "Delivered";

export interface SimulationResult {
  isSuccess: boolean | undefined;
  processedRequestCount: number;
  elapsedTime: number;

  succeed: (processedRequestCount: number, elaspedTime: number) => void;
  fail: (processedRequestCount: number, elaspedTime: number) => void;
  reset: () => void;
}
