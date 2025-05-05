import { describe, expect, it } from "vitest";
import type {
  AssignTask,
  Command,
  ProceedTask,
  ReleaseCore,
} from "~/engine/ecs/command";
import { proceedTasks } from "~/engine/ecs/handler";
import type { ICore, ITask } from "~/engine/ecs/types";

describe("proceedTasks", () => {
  it.concurrent.each([
    [
      [
        {
          requestId: "task1",
          srcId: "client-1",
          dstId: "server-1",
          duration: 100,
          elapsed: 0,
          createdAt: 0,
        } as ITask,
        {
          requestId: "task2",
          srcId: "client-1",
          dstId: "server-1",
          duration: 200,
          elapsed: 0,
          createdAt: 0,
        } as ITask,
        {
          requestId: "task3",
          srcId: "client-1",
          dstId: "server-1",
          duration: 300,
          elapsed: 0,
          createdAt: 0,
        } as ITask,
        {
          requestId: "task4",
          srcId: "client-1",
          dstId: "server-1",
          duration: 400,
          elapsed: 0,
          createdAt: 0,
        } as ITask,
      ],
      [{ task: null }, { task: null }],
      [
        {
          type: "update",
          name: "AssignTask",
          requestId: "task1",
          serverId: "server-1",
          coreIndex: 0,
        } as AssignTask,
        {
          type: "update",
          name: "ReleaseCore",
          serverId: "server-1",
          coreIndex: 0,
        } as ReleaseCore,
        {
          type: "update",
          name: "ProceedTask",
          requestId: "task1",
          proceeded: 100,
        } as ProceedTask,
        {
          type: "update",
          name: "AssignTask",
          requestId: "task2",
          serverId: "server-1",
          coreIndex: 1,
        } as AssignTask,
        {
          type: "update",
          name: "ReleaseCore",
          serverId: "server-1",
          coreIndex: 1,
        } as ReleaseCore,
        {
          type: "update",
          name: "ProceedTask",
          requestId: "task2",
          proceeded: 200,
        } as ProceedTask,
        {
          type: "update",
          name: "AssignTask",
          requestId: "task3",
          serverId: "server-1",
          coreIndex: 0,
        } as AssignTask,
        {
          type: "update",
          name: "ReleaseCore",
          serverId: "server-1",
          coreIndex: 0,
        } as ReleaseCore,
        {
          type: "update",
          name: "ProceedTask",
          requestId: "task3",
          proceeded: 300,
        } as ProceedTask,
        {
          type: "update",
          name: "AssignTask",
          requestId: "task4",
          serverId: "server-1",
          coreIndex: 1,
        } as AssignTask,
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
        {
          requestId: "task3",
          srcId: "client-1",
          dstId: "server-1",
          duration: 300,
          elapsed: 0,
          createdAt: 0,
        } as ITask,
        {
          requestId: "task4",
          srcId: "client-1",
          dstId: "server-1",
          duration: 400,
          elapsed: 0,
          createdAt: 0,
        } as ITask,
        {
          requestId: "task5",
          srcId: "client-1",
          dstId: "server-1",
          duration: 500,
          elapsed: 0,
          createdAt: 0,
        } as ITask,
      ],
      [
        {
          task: {
            requestId: "task1",
            srcId: "client-1",
            dstId: "server-1",
            duration: 100,
            elapsed: 50,
            createdAt: 0,
          },
        },
        {
          task: {
            requestId: "task2",
            srcId: "client-1",
            dstId: "server-1",
            duration: 200,
            elapsed: 100,
            createdAt: 0,
          },
        },
      ],
      [
        {
          type: "update",
          name: "ReleaseCore",
          serverId: "server-1",
          coreIndex: 0,
        } as ReleaseCore,
        {
          type: "update",
          name: "ProceedTask",
          requestId: "task1",
          proceeded: 50,
        } as ProceedTask,
        {
          type: "update",
          name: "ReleaseCore",
          serverId: "server-1",
          coreIndex: 1,
        } as ReleaseCore,
        {
          type: "update",
          name: "ProceedTask",
          requestId: "task2",
          proceeded: 100,
        } as ProceedTask,
        {
          type: "update",
          name: "AssignTask",
          requestId: "task3",
          serverId: "server-1",
          coreIndex: 0,
        } as AssignTask,
        {
          type: "update",
          name: "ReleaseCore",
          serverId: "server-1",
          coreIndex: 0,
        } as ReleaseCore,
        {
          type: "update",
          name: "ProceedTask",
          requestId: "task3",
          proceeded: 300,
        } as ProceedTask,
        {
          type: "update",
          name: "AssignTask",
          requestId: "task4",
          serverId: "server-1",
          coreIndex: 1,
        } as AssignTask,
        {
          type: "update",
          name: "ProceedTask",
          requestId: "task4",
          proceeded: 400,
        } as ProceedTask,
        {
          type: "update",
          name: "AssignTask",
          requestId: "task5",
          serverId: "server-1",
          coreIndex: 0,
        } as AssignTask,
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
        {
          requestId: "task3",
          srcId: "client-1",
          dstId: "server-1",
          duration: 300,
          elapsed: 0,
          createdAt: 0,
        } as ITask,
        {
          requestId: "task4",
          srcId: "client-1",
          dstId: "server-1",
          duration: 400,
          elapsed: 0,
          createdAt: 0,
        } as ITask,
        {
          requestId: "task5",
          srcId: "client-1",
          dstId: "server-1",
          duration: 500,
          elapsed: 0,
          createdAt: 1450,
        } as ITask,
      ],
      [
        {
          task: {
            requestId: "task1",
            srcId: "client-1",
            dstId: "server-1",
            duration: 100,
            elapsed: 50,
            createdAt: 0,
          },
        },
        {
          task: {
            requestId: "task2",
            srcId: "client-1",
            dstId: "server-1",
            duration: 200,
            elapsed: 50,
            createdAt: 0,
          },
        },
      ],
      [
        {
          type: "update",
          name: "ReleaseCore",
          serverId: "server-1",
          coreIndex: 0,
        } as ReleaseCore,
        {
          type: "update",
          name: "ProceedTask",
          requestId: "task1",
          proceeded: 50,
        } as ProceedTask,
        {
          type: "update",
          name: "ReleaseCore",
          serverId: "server-1",
          coreIndex: 1,
        } as ReleaseCore,
        {
          type: "update",
          name: "ProceedTask",
          requestId: "task2",
          proceeded: 150,
        } as ProceedTask,
        {
          type: "update",
          name: "AssignTask",
          requestId: "task3",
          serverId: "server-1",
          coreIndex: 0,
        } as AssignTask,
        {
          type: "update",
          name: "ReleaseCore",
          serverId: "server-1",
          coreIndex: 0,
        } as ReleaseCore,
        {
          type: "update",
          name: "ProceedTask",
          requestId: "task3",
          proceeded: 300,
        } as ProceedTask,
        {
          type: "update",
          name: "AssignTask",
          requestId: "task4",
          serverId: "server-1",
          coreIndex: 1,
        } as AssignTask,
        {
          type: "update",
          name: "ProceedTask",
          requestId: "task4",
          proceeded: 350,
        } as ProceedTask,
        {
          type: "update",
          name: "AssignTask",
          requestId: "task5",
          serverId: "server-1",
          coreIndex: 0,
        } as AssignTask,
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
    (tasks: ITask[], cores: ICore[], expected: Command[]) => {
      const delta = 500;
      const elapsedTime = 1000;

      const commands = proceedTasks(tasks, cores, delta, elapsedTime);

      expect(commands).toEqual(expected);
    }
  );
});
