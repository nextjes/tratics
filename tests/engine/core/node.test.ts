import { MilliSecond, Position } from "~/engine/term";
import { Node, Task } from "~/engine/core/updatable";
import { describe, expect, it } from "vitest";

describe("Node", () => {
  describe("boot", () => {
    it("Should create node with cores", () => {
      const node = Node.boot(4);
      expect(node.coreCount()).toBe(4);
    });
  });

  describe("bootAt", () => {
    it("Should create node at specific position", () => {
      const node = Node.bootAt(4, 10, 20);
      expect(node.position().x).toBe(10);
      expect(node.position().y).toBe(20);
    });
  });

  describe("registerTask", () => {
    it("Should register task to node", () => {
      const node = Node.boot(4);
      const task = Task.ready(1000);

      const registered = node.registerTask(task);
      expect(registered.queueLength()).toBe(1);
    });

    it("Should register multiple tasks to node", () => {
      const node = Node.boot(4);
      const task1 = Task.ready(1000);
      const task2 = Task.ready(2000);

      const registered = node.registerTask(task1).registerTask(task2);
      expect(registered.queueLength()).toBe(2);
    });
  });

  describe("registerTasks", () => {
    it("Should register multiple tasks to node", () => {
      const node = Node.boot(4);
      const task1 = Task.ready(1000);
      const task2 = Task.ready(2000);

      const registered = node.registerTasks([task1, task2]);
      expect(registered.queueLength()).toBe(2);
    });
  });

  describe("move", () => {
    it("Should move node to new position", () => {
      const node = Node.boot(4);
      const newPosition = new Position(100, 200);

      const moved = node.move(newPosition);
      expect(moved.position().x).toBe(100);
      expect(moved.position().y).toBe(200);
    });
  });

  describe("reset", () => {
    it("Should reset node to initial state", () => {
      const node = Node.boot(4).registerTask(Task.ready(1000));
      const reset = node.reset();
      expect(reset.queueLength()).toBe(0);
    });

    it("Should reset cores when node is busy", () => {
      const node = Node.boot(4).registerTask(Task.ready(1000));
      const reset = node.reset();
      expect(reset.core(0).isBusy()).toBe(false);
    });
  });

  describe("after", () => {
    it("Should advance node state by elapsed time", () => {
      const node = Node.boot(4).registerTask(Task.ready(1000));
      const advanced = node.after(new MilliSecond(500));
      expect(advanced.queueLength()).toBe(0);
      expect(advanced.core(0).state().task.elapsed).toBe(500);
    });

    it("Should complete task when duration is met", () => {
      const node = Node.boot(4).registerTask(Task.ready(1000));
      const completed = node.after(new MilliSecond(1000));
      expect(completed.queueLength()).toBe(0);
    });

    it("Should not update node state when no task assigned", () => {
      const node = Node.boot(2);
      const updated = node.after(new MilliSecond(1000));
      expect(updated.state()).toEqual(node.state());
    });

    it("Should complete two tasks and partially process the next task on multiple cores", () => {
      const node = Node.boot(2).registerTasks([
        Task.ready(1000),
        Task.ready(1000),
        Task.ready(1000),
      ]);
      const updated = node.after(new MilliSecond(1500));
      expect(updated.queueLength()).toBe(0);
      expect(updated.core(0).state().task.elapsed).toBe(500);
    });
  });
});
