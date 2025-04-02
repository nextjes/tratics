import { MilliSecond } from "~/engine/term";
import { Task, TaskStatus } from "~/engine/core/updatable/task";
import { describe, expect, it } from "vitest";

describe("Task", () => {
  it("Should create task in ready state", () => {
    const task = Task.ready(1000);
    expect(task.isReady()).toBe(true);
    expect(task.isRunning()).toBe(false);
    expect(task.isCompleted()).toBe(false);

    const state = task.state();
    expect(state.status).toBe(TaskStatus.Ready);
    expect(state.duration).toBe(1000);
    expect(state.elapsed).toBe(0);
    expect(state.progress).toBe(0);
  });

  it("Should transition to running when core is assigned and time passes", () => {
    const task = Task.ready(1000);
    const started = task.after(new MilliSecond(0));

    expect(started.isReady()).toBe(false);
    expect(started.isRunning()).toBe(true);

    const state = started.state();
    expect(state.status).toBe(TaskStatus.Running);
  });

  it("Should progress over time and complete when duration is met", () => {
    const task = Task.ready(1000);
    const started = task.after(new MilliSecond(0));

    const inProgress = started.after(new MilliSecond(500));
    expect(inProgress.isRunning()).toBe(true);
    expect(inProgress.state().progress).toBe(50);

    const completed = inProgress.after(new MilliSecond(500));
    expect(completed.isRunning()).toBe(false);
    expect(completed.isCompleted()).toBe(true);
    expect(completed.state().progress).toBe(100);
  });

  it("Should not progress after completion", () => {
    const task = Task.ready(1000);
    const started = task.after(new MilliSecond(0));
    const inProgress = started.after(new MilliSecond(1000));

    const inProgressState = inProgress.state();

    const completed = inProgress.after(new MilliSecond(500));

    const finalState = completed.state();
    expect(finalState.status).toBe(inProgressState.status);
    expect(finalState.elapsed).toBe(inProgressState.elapsed);
  });

  it("Should reset to initial state", () => {
    const task = Task.ready(1000);
    const started = task.after(new MilliSecond(0));
    const inProgress = started.after(new MilliSecond(500));

    const reset = inProgress.reset();

    expect(reset.isReady()).toBe(true);
    expect(reset.state().elapsed).toBe(0);
  });
});
