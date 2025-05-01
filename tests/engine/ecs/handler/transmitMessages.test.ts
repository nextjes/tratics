import { describe, expect, it } from "vitest";
import { transmitMessages } from "~/engine/ecs/handler";
import type { IMessage } from "~/engine/ecs/types";

describe("transmitMessages", () => {
  it("should return comamnds", () => {
    const algorithm = (
      bandwidth: number,
      messages: IMessage[],
      delta: number
    ) => {
      return [
        {
          requestId: "req1",
          transmittedSize: 200,
          arrivedTimeInDelta: 0.2,
        },
        {
          requestId: "req2",
          transmittedSize: 100,
          arrivedTimeInDelta: null,
        },
      ];
    };
    const bandwidth = 1000;
    const messages: IMessage[] = [
      { requestId: "req1", size: 200, transmittedSize: 0 },
      { requestId: "req2", size: 300, transmittedSize: 0 },
    ];
    const delta = 1;
    const elapsedTime = 3;
    const commands = transmitMessages(
      algorithm,
      bandwidth,
      messages,
      delta,
      elapsedTime
    );

    expect(commands).toEqual([
      {
        type: "create",
        requestId: "req1",
        arrivedAt: 3.2,
      },
      {
        type: "update",
        requestId: "req2",
        transmittedSize: 100,
      },
    ]);
  });
});
