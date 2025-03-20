import { describe, expect, it } from "vitest";
import { MilliSecond, Second, TaskStatus } from "~/engine/term";
import { Task } from "~/engine/updatable";
import * as error from "~/engine/error";

describe("Task.ready", () => {
  it("should initialize a task with ready status and zero elapsed time", () => {
    const task = Task.ready(new Second(3));

    expect(task.status()).toEqual(TaskStatus.Ready);
    expect(task.elapsedTime()).toEqual(new MilliSecond(0));
  });
});

describe("Task.start", () => {
  it("should change the status to running when it is ready", () => {
    const task = Task.ready(new Second(3)).start();

    expect(task.status()).toEqual(TaskStatus.Running);
  });

  it.concurrent.each([
    [Task.ready(new Second(3)).start(), TaskStatus.Running],
    [Task.ready(new Second(3)).start().terminate(), TaskStatus.Terminated],
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
    const task = Task.ready(new Second(3)).start().terminate();

    expect(task.status()).toEqual(TaskStatus.Terminated);
  });

  it.concurrent.each([
    [Task.ready(new Second(3)), TaskStatus.Ready],
    [Task.ready(new Second(3)).start().terminate(), TaskStatus.Terminated],
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
    const task = Task.ready(new Second(3));
    const updatedTask = task.after(new MilliSecond(1000));

    expect(updatedTask.elapsedTime()).toEqual(new MilliSecond(0));
    expect(updatedTask.status()).toEqual(TaskStatus.Ready);
  });

  it("should update elapsed time when task is Running", () => {
    const task = Task.ready(new Second(3)).start();
    const updatedTask = task.after(new MilliSecond(2000));

    expect(updatedTask.elapsedTime()).toEqual(new MilliSecond(2000));
    expect(updatedTask.status()).toEqual(TaskStatus.Running);
  });

  it("should terminate task when elapsed time reaches duration", () => {
    const task = Task.ready(new Second(3)).start();
    const updatedTask = task.after(new MilliSecond(3000));

    expect(updatedTask.elapsedTime()).toEqual(new MilliSecond(3000));
    expect(updatedTask.status()).toEqual(TaskStatus.Terminated);
  });

  it("should cap elapsed time at duration when delta time exceeds duration", () => {
    const task = Task.ready(new Second(3)).start();
    const updatedTask = task.after(new MilliSecond(5000));

    expect(updatedTask.elapsedTime()).toEqual(new MilliSecond(5000));
    expect(updatedTask.status()).toEqual(TaskStatus.Terminated);
  });

  it("should throw task state error when task is terminated", () => {
    const task = Task.ready(new Second(3)).start().terminate();

    expect(() => task.after(new MilliSecond(1000))).toThrowError(
      new error.TaskStateError(
        `Unable to update task status: task is terminated`
      )
    );
  });
});
