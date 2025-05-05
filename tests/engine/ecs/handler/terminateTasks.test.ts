import { describe, expect, it } from "vitest";
import { terminateTasks } from "~/engine/ecs/handler";

describe("terminateTasks", () => {
  it("should return terminated commands for tasks", () => {
    const tasks = [
      {
        requestId: "task-1",
        srcId: "client-1",
        dstId: "server-1",
        duration: 10,
        elapsed: 10,
        createdAt: 0,
      },
      {
        requestId: "task-2",
        srcId: "client-1",
        dstId: "server-1",
        duration: 20,
        elapsed: 20,
        createdAt: 0,
      },
      {
        requestId: "task-3",
        srcId: "client-1",
        dstId: "server-1",
        duration: 20,
        elapsed: 15,
        createdAt: 0,
      },
      {
        requestId: "task-4",
        srcId: "client-1",
        dstId: "server-1",
        duration: 20,
        elapsed: 15,
        createdAt: 0,
      },
    ];

    const expected = [
      {
        type: "create",
        name: "CreateResponse",
        requestId: "task-1",
        srcId: "server-1",
        dstId: "client-1",
        size: 40,
      },
      {
        type: "delete",
        name: "DequeueTask",
        requestId: "task-1",
      },
      {
        type: "create",
        name: "CreateResponse",
        requestId: "task-2",
        srcId: "server-1",
        dstId: "client-1",
        size: 40,
      },
      {
        type: "delete",
        name: "DequeueTask",
        requestId: "task-2",
      },
    ];

    const result = terminateTasks(tasks);

    expect(result).toEqual(expected);
  });
});
