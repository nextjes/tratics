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
    const linkId = "link1";
    const bandwidth = 1000;
    const messages: IMessage[] = [
      { requestId: "req1", size: 200, transmittedSize: 0 },
      { requestId: "req2", size: 300, transmittedSize: 0 },
    ];
    const delta = 1;
    const elapsedTime = 3;
    const commands = transmitMessages(
      algorithm,
      linkId,
      bandwidth,
      messages,
      delta,
      elapsedTime
    );

    expect(commands).toEqual([
      {
        type: "create",
        name: "CreateTask",
        requestId: "req1",
        createdAt: 3.2,
      },
      {
        type: "delete",
        name: "DeleteMessage",
        requestId: "req1",
      },
      {
        type: "update",
        name: "ProceedMessage",
        requestId: "req2",
        transmittedSize: 100,
      },
      {
        type: "update",
        name: "RecordThroughput",
        linkId: "link1",
        throughput: 300000,
      },
    ]);
  });
});
