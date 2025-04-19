export type RequestResponseCyclePhase =
  | "RequestQueueing"
  | "RequestTransmitting"
  | "TaskProcessing"
  | "ResponseTransmitting"
  | "ResponseReceived";
