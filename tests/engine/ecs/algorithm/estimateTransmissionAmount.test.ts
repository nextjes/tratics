import { describe, expect, it } from "vitest";
import { estimateTransmissionAmount } from "~/engine/ecs/algorithm";
import type { IMessage } from "~/engine/ecs/types";

describe("estimateTransmissionAmount", () => {
  it("should estimate the transmission amount by FIFO", () => {
    const bandwidth = 1000;
    const delta = 1;
    const messages: IMessage[] = [
      { requestId: "req1", size: 500, transmittedSize: 100 },
      { requestId: "req2", size: 300, transmittedSize: 0 },
      { requestId: "req3", size: 700, transmittedSize: 0 },
      { requestId: "req4", size: 200, transmittedSize: 0 },
    ];

    const result = estimateTransmissionAmount(bandwidth, messages, delta);

    expect(result).toEqual([
      { requestId: "req1", transmittedSize: 400, arrivedTimeInDelta: 0.4 },
      { requestId: "req2", transmittedSize: 300, arrivedTimeInDelta: 0.7 },
      { requestId: "req3", transmittedSize: 300, arrivedTimeInDelta: null },
      { requestId: "req4", transmittedSize: 0, arrivedTimeInDelta: null },
    ]);
  });
});
