import { request } from "http";
import { describe, expect, it } from "vitest";
import { processTasks } from "~/engine/ecs/algorithm";
import type { ICore, ITask } from "~/engine/ecs/types";

describe("processTasks", () => {
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
        { requestId: "task1", proceeded: 100 },
        { requestId: "task2", proceeded: 200 },
        { requestId: "task3", proceeded: 300 },
        { requestId: "task4", proceeded: 300 },
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
        { requestId: "task1", proceeded: 50 },
        { requestId: "task2", proceeded: 100 },
        { requestId: "task3", proceeded: 300 },
        { requestId: "task4", proceeded: 400 },
        { requestId: "task5", proceeded: 150 },
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
        { requestId: "task1", proceeded: 50 },
        { requestId: "task2", proceeded: 150 },
        { requestId: "task3", proceeded: 300 },
        { requestId: "task4", proceeded: 350 },
        { requestId: "task5", proceeded: 50 },
      ],
    ],
  ])(
    "should process tasks by FIFO during the delta time",
    (
      tasks: ITask[],
      cores: ICore[],
      expected: {
        requestId: string;
        proceeded: number;
      }[]
    ) => {
      const delta = 500;
      const elapsedTime = 1000;

      const commands = processTasks(tasks, cores, delta, elapsedTime);

      expect(commands).toEqual(expected);
    }
  );
});
