import type {
  Command,
  CreateRequest,
  ProceedMessage,
  PublishArrivedMessage,
} from "./command";
import type { GenerateRequestsProps } from "./props";
import type { IMessage } from "./types";

export function generateRequests({
  algorithm,
  clientIds,
  entryPointId,
  requestIdFactory,
  sizeFactory,
}: GenerateRequestsProps): CreateRequest[] {
  return clientIds
    .map((clientId) => {
      if (algorithm()) {
        return {
          type: "create",
          requestId: requestIdFactory(),
          srcId: clientId,
          dstId: entryPointId,
          size: sizeFactory(),
        };
      }
      return null;
    })
    .filter((cmd): cmd is CreateRequest => cmd !== null);
}

export function transmitMessages(
  algorithm: (
    bandwidth: number,
    messages: IMessage[],
    delta: number
  ) => {
    requestId: string;
    transmittedSize: number;
    arrivedTimeInDelta: number | null;
  }[],
  bandwidth: number,
  messages: IMessage[],
  delta: number,
  elapsedTime: number
): Command[] {
  const transmissionResults = algorithm(bandwidth, messages, delta);

  const result: Command[] = [];
  for (const {
    requestId,
    transmittedSize,
    arrivedTimeInDelta,
  } of transmissionResults) {
    if (arrivedTimeInDelta === null) {
      result.push({
        type: "update",
        requestId,
        transmittedSize,
      } as ProceedMessage);
    } else {
      result.push({
        type: "create",
        requestId,
        arrivedAt: elapsedTime + arrivedTimeInDelta,
      } as PublishArrivedMessage);
    }
  }

  return result;
}
