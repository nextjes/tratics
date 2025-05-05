import { describe, expect, it } from "vitest";
import type { ProceedTask } from "~/engine/ecs/command";
import { proceedTasks } from "~/engine/ecs/handler";
import type { ICore, ITask } from "~/engine/ecs/types";

describe("proceedTasks", () => {
  it.concurrent.each([
    [
      [
        { requestId: "task1", duration: 100, elapsed: 0, createdAt: 0 },
        { requestId: "task2", duration: 200, elapsed: 0, createdAt: 0 },
        { requestId: "task3", duration: 300, elapsed: 0, createdAt: 0 },
        { requestId: "task4", duration: 400, elapsed: 0, createdAt: 0 },
      ],
      [{ task: null }, { task: null }],
      [
        {
          type: "update",
          name: "ProceedTask",
          requestId: "task1",
          proceeded: 100,
        } as ProceedTask,
        {
          type: "update",
          name: "ProceedTask",
          requestId: "task2",
          proceeded: 200,
        } as ProceedTask,
        {
          type: "update",
          name: "ProceedTask",
          requestId: "task3",
          proceeded: 300,
        } as ProceedTask,
        {
          type: "update",
          name: "ProceedTask",
          requestId: "task4",
          proceeded: 300,
        } as ProceedTask,
      ],
    ],
    [
      [
        { requestId: "task3", duration: 300, elapsed: 0, createdAt: 0 },
        { requestId: "task4", duration: 400, elapsed: 0, createdAt: 0 },
        { requestId: "task5", duration: 500, elapsed: 0, createdAt: 0 },
      ],
      [
        {
          task: {
            requestId: "task1",
            duration: 100,
            elapsed: 50,
            createdAt: 0,
          },
        },
        {
          task: {
            requestId: "task2",
            duration: 200,
            elapsed: 100,
            createdAt: 0,
          },
        },
      ],
      [
        {
          type: "update",
          name: "ProceedTask",
          requestId: "task1",
          proceeded: 50,
        } as ProceedTask,
        {
          type: "update",
          name: "ProceedTask",
          requestId: "task2",
          proceeded: 100,
        } as ProceedTask,
        {
          type: "update",
          name: "ProceedTask",
          requestId: "task3",
          proceeded: 300,
        } as ProceedTask,
        {
          type: "update",
          name: "ProceedTask",
          requestId: "task4",
          proceeded: 400,
        } as ProceedTask,
        {
          type: "update",
          name: "ProceedTask",
          requestId: "task5",
          proceeded: 150,
        } as ProceedTask,
      ],
    ],
    [
      [
        { requestId: "task3", duration: 300, elapsed: 0, createdAt: 0 },
        { requestId: "task4", duration: 400, elapsed: 0, createdAt: 0 },
        { requestId: "task5", duration: 500, elapsed: 0, createdAt: 1450 },
      ],
      [
        {
          task: {
            requestId: "task1",
            duration: 100,
            elapsed: 50,
            createdAt: 0,
          },
        },
        {
          task: {
            requestId: "task2",
            duration: 200,
            elapsed: 50,
            createdAt: 0,
          },
        },
      ],
      [
        {
          type: "update",
          name: "ProceedTask",
          requestId: "task1",
          proceeded: 50,
        } as ProceedTask,
        {
          type: "update",
          name: "ProceedTask",
          requestId: "task2",
          proceeded: 150,
        } as ProceedTask,
        {
          type: "update",
          name: "ProceedTask",
          requestId: "task3",
          proceeded: 300,
        } as ProceedTask,
        {
          type: "update",
          name: "ProceedTask",
          requestId: "task4",
          proceeded: 350,
        } as ProceedTask,
        {
          type: "update",
          name: "ProceedTask",
          requestId: "task5",
          proceeded: 50,
        } as ProceedTask,
      ],
    ],
  ])(
    "should return ProceedTask commands",
    (tasks: ITask[], cores: ICore[], expected: ProceedTask[]) => {
      const delta = 500;
      const elapsedTime = 1000;

      const commands = proceedTasks(tasks, cores, delta, elapsedTime);

      expect(commands).toEqual(expected);
    }
  );
});
