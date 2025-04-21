export type RequestResponseCyclePhase =
  | "RequestQueueing"
  | "RequestTransmitting"
  | "TaskProcessing"
  | "ResponseTransmitting"
  | "ResponseReceived";

export type MessageStatus = "Created" | "InTransit" | "Delivered";
