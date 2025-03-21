import { describe, expect, it } from "vitest";
import { type MilliSecond, TaskStatus } from "~/engine/term";
import { Task } from "~/engine/updatable";
import * as error from "~/engine/error";

describe("Task.ready", () => {
  it("should initialize a task with ready status and zero elapsed time", () => {
    const task = Task.ready(3000);

    expect(task.status()).toEqual(TaskStatus.Ready);
    expect(task.elapsedTime()).toEqual(0);
  });
});

describe("Task.start", () => {
  it("should change the status to running when it is ready", () => {
    const task = Task.ready(3000).start();

    expect(task.status()).toEqual(TaskStatus.Running);
  });

  it.concurrent.each([
    [Task.ready(3000).start(), TaskStatus.Running],
    [Task.ready(3000).start().terminate(), TaskStatus.Terminated],
  ])(
    "should throw task state error when it is not ready",
    (task: Task, expectedStatus: TaskStatus) => {
      expect(() => task.start()).toThrowError(
        new error.TaskStateError(
          `Unable to start task: status must be 'ready', but found '${expectedStatus}'`
        )
      );
    }
  );
});

describe("Task.terminate", () => {
  it("should change the status to terminated when it is running", () => {
    const task = Task.ready(3000).start().terminate();

    expect(task.status()).toEqual(TaskStatus.Terminated);
  });

  it.concurrent.each([
    [Task.ready(3000), TaskStatus.Ready],
    [Task.ready(3000).start().terminate(), TaskStatus.Terminated],
  ])(
    "should throw task state error when it is not running",
    (task: Task, expectedStatus: TaskStatus) => {
      expect(() => task.terminate()).toThrowError(
        new error.TaskStateError(
          `Unable to terminate task: status must be 'running', but found '${expectedStatus}'`
        )
      );
    }
  );
});

describe("Task.after", () => {
  it("should not update elapsed time when task is in Ready state", () => {
    const task = Task.ready(3000);
    const updatedTask = task.after(1000);

    expect(updatedTask.elapsedTime()).toEqual(0);
    expect(updatedTask.status()).toEqual(TaskStatus.Ready);
  });

  it("should update elapsed time when task is Running", () => {
    const task = Task.ready(3000).start();
    const updatedTask = task.after(2000);

    expect(updatedTask.elapsedTime()).toEqual(2000);
    expect(updatedTask.status()).toEqual(TaskStatus.Running);
  });

  it("should terminate task when elapsed time reaches duration", () => {
    const task = Task.ready(3000).start();
    const updatedTask = task.after(3000);

    expect(updatedTask.elapsedTime()).toEqual(3000);
    expect(updatedTask.status()).toEqual(TaskStatus.Terminated);
  });

  it("should cap elapsed time at duration when delta time exceeds duration", () => {
    const task = Task.ready(3000).start();
    const updatedTask = task.after(5000);

    expect(updatedTask.elapsedTime()).toEqual(5000);
    expect(updatedTask.status()).toEqual(TaskStatus.Terminated);
  });

  it("should throw task state error when task is terminated", () => {
    const task = Task.ready(3000).start().terminate();

    expect(() => task.after(1000)).toThrowError(
      new error.TaskStateError(
        `Unable to update task status: task is terminated`
      )
    );
  });
});
