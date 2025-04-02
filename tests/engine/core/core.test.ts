import { describe, expect, it } from "vitest";
import { error } from "~/engine";
import { Core, Task } from "~/engine/core/updatable";
import { MilliSecond } from "~/engine/term";

describe("Core", () => {
  describe("idle", () => {
    it("Should create idle core", () => {
      const core = Core.idle();
      expect(core.isBusy()).toBe(false);
      expect(core.currentTask()).toBe(null);
    });
  });

  describe("assignTask", () => {
    it("Should assign task to core", () => {
      const core = Core.idle();
      const task = Task.ready(1000);
      const assigned = core.assignTask(task);

      expect(assigned.isBusy()).toBe(true);
      expect(assigned.currentTask()!.state()).toEqual(task.state());
    });

    it("Should throw error when assigning new task to a busy core", () => {
      const firstTask = Task.ready(1000);
      const busyCore = Core.idle().assignTask(firstTask);
      const newTask = Task.ready(2000);

      expect(() => {
        busyCore.assignTask(newTask);
      }).toThrow(new error.BusyCoreError("Core is busy"));
    });
  });

  describe("releaseTask", () => {
    it("Should release task from core", () => {
      const task = Task.ready(1000);
      const released = Core.idle().assignTask(task).releaseTask();

      expect(released.currentTask()).toBe(null);
    });

    it("Should throw error when releasing task from idle core", () => {
      const core = Core.idle();

      expect(() => {
        core.releaseTask();
      }).toThrow(new error.NoTaskError("No task assigned"));
    });
  });

  describe("reset", () => {
    it("Should reset core and task", () => {
      const task = Task.ready(1000);
      const core = Core.idle().assignTask(task);
      const reset = core.reset();

      expect(reset.isBusy()).toBe(true);
    });

    it("Should reset task when core is busy", () => {
      const task = Task.ready(1000);
      const core = Core.idle();
      const reset = core.reset();

      expect(reset.isBusy()).toBe(false);
    });
  });

  describe("after", () => {
    it("Should update core state after elapsed time", () => {
      const task = Task.ready(1000);
      const core = Core.idle().assignTask(task);
      const updated = core.after(new MilliSecond(1000));

      expect(updated.isBusy()).toBe(false);
      expect(updated.currentTask()).toBe(null);
    });

    it("Should not update core state when no task assigned", () => {
      const core = Core.idle();
      const updated = core.after(new MilliSecond(1000));

      expect(updated.state()).toEqual(core.state());
    });

    it("Should release task when completed", () => {
      const task = Task.ready(1000);
      const core = Core.idle().assignTask(task);
      const updated = core.after(new MilliSecond(1000));

      expect(updated.currentTask()).toEqual(null);
    });
  });
});
