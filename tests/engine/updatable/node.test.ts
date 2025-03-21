import { expect, it, describe } from "vitest";
import { type MilliSecond } from "~/engine/term";
import { Node, Task } from "~/engine/updatable";

describe("Node.boot", () => {
  it("initializes node instance with 0 working cores", () => {
    const node = Node.boot(2);

    expect(node.workingCoreNum()).toEqual(0);
  });
});

describe("Node.registerTask", () => {
  it.concurrent.each([
    [Node.boot(2), Task.ready(3000), 1],
    [Node.boot(2).registerTask(Task.ready(3000)), Task.ready(3000), 2],
    [
      Node.boot(2)
        .registerTask(Task.ready(3000))
        .registerTask(Task.ready(3000)),
      Task.ready(3000),
      3,
    ],
  ])(
    "push a task to the task queue of the node",
    (node: Node, task: Task, expectedWorkingCoreNum: number) => {
      const updatedNode = node.registerTask(task);

      expect(updatedNode.waitingTaskNum()).toEqual(expectedWorkingCoreNum);
    }
  );
});

describe("Node.after", () => {
  it.concurrent.each([
    [Node.boot(2).registerTask(Task.ready(3000)), 1, 0, 1, [1, undefined]],
    [
      Node.boot(2)
        .registerTask(Task.ready(3000))
        .registerTask(Task.ready(3000)),
      1000,
      0,
      2,
      [1000, 1000],
    ],
    [
      Node.boot(2)
        .registerTask(Task.ready(3000))
        .registerTask(Task.ready(3000)),
      3000,
      0,
      0,
      [undefined, undefined],
    ],
    [
      Node.boot(2)
        .registerTask(Task.ready(3000))
        .registerTask(Task.ready(3000))
        .registerTask(Task.ready(3000)),
      4800,
      0,
      1,
      [1800, undefined],
    ],
  ])(
    "processes tasks correctly after advancing time by %s milliseconds",
    (
      node: Node,
      deltaTime: MilliSecond,
      expectedWaitingTaskNum: number,
      expectedWorkingCoreNum: number,
      expectedCoreElapsedTimes: Array<MilliSecond | undefined>
    ) => {
      const updatedNode = node.after(deltaTime);

      expect(updatedNode.waitingTaskNum()).toEqual(expectedWaitingTaskNum);
      expect(updatedNode.workingCoreNum()).toEqual(expectedWorkingCoreNum);
      expect(updatedNode.cores.map((core) => core?.elapsedTime())).toEqual(
        expectedCoreElapsedTimes
      );
    }
  );
});

describe("Node.reset", () => {
  it.concurrent.each([[Node.boot(2)], [Node.boot(2).after(5)]])(
    "resets the elapsed time to 0",
    (node: Node) => {
      const resetNode = node.reset();

      expect(resetNode.workingCoreNum()).toEqual(0);
    }
  );
});
