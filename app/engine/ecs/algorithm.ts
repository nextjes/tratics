import type { IMessage } from "./types";

export function estimateTransmissionAmount(
  bandwidth: number,
  messages: IMessage[],
  delta: number
): {
  requestId: string;
  transmittedSize: number;
  arrivedTimeInDelta: number | null;
}[] {
  const transmissionAmount = bandwidth * delta;
  const result: {
    requestId: string;
    transmittedSize: number;
    arrivedTimeInDelta: number | null;
  }[] = [];

  let remainingTransmissionAmount = transmissionAmount;

  for (const message of messages) {
    const { requestId, size, transmittedSize } = message;
    const remainingSize = size - transmittedSize;

    if (remainingSize <= remainingTransmissionAmount) {
      result.push({
        requestId,
        transmittedSize: remainingSize,
        arrivedTimeInDelta:
          (result.reduce((acc, msg) => acc + msg.transmittedSize, 0) +
            remainingSize) /
          bandwidth,
      });
      remainingTransmissionAmount -= remainingSize;
    } else {
      result.push({
        requestId,
        transmittedSize: remainingTransmissionAmount,
        arrivedTimeInDelta: null,
      });
      remainingTransmissionAmount = 0;
    }
  }
  return result;
}
