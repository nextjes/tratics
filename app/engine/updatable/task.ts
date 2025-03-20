import { type Temporal } from "./temporal";
import * as term from "~/engine/term";
import * as error from "~/engine/error";

export class Task implements Temporal {
  #estimatedProcessingDuration: term.Second;
  #elapsedTime: term.MilliSecond;
  #status: term.TaskStatus;

  private constructor(
    estimatedProcessingDuration: term.Second,
    elapsedTime: term.MilliSecond,
    status: term.TaskStatus
  ) {
    this.#estimatedProcessingDuration = estimatedProcessingDuration;
    this.#elapsedTime = elapsedTime;
    this.#status = status;
  }

  static ready(estimatedProcessingDuration: term.Second): Task {
    return new Task(
      estimatedProcessingDuration,
      new term.MilliSecond(0),
      term.TaskStatus.Ready
    );
  }

  status(): string {
    return this.#status;
  }

  elapsedTime(): term.MilliSecond {
    return this.#elapsedTime;
  }

  after(deltaTime: term.MilliSecond): Task {
    if (this.#status === term.TaskStatus.Ready) {
      return new Task(
        this.#estimatedProcessingDuration,
        this.#elapsedTime,
        this.#status
      );
    }
    if (this.#status === term.TaskStatus.Terminated) {
      throw new error.TaskStateError(
        `Unable to update task status: task is terminated`
      );
    }
    const elapsedTime = this.#elapsedTime.valueOf() + deltaTime.valueOf();
    let status: term.TaskStatus = this.#status;
    if (
      elapsedTime >=
      this.#estimatedProcessingDuration.toMilliSeconds().valueOf()
    ) {
      status = term.TaskStatus.Terminated;
    }
    return new Task(
      this.#estimatedProcessingDuration,
      new term.MilliSecond(elapsedTime),
      status
    );
  }

  start(): Task {
    if (this.#status !== term.TaskStatus.Ready) {
      throw new error.TaskStateError(
        `Unable to start task: status must be 'ready', but found '${
          this.#status
        }'`
      );
    }
    return new Task(
      this.#estimatedProcessingDuration,
      this.#elapsedTime,
      term.TaskStatus.Running
    );
  }

  terminate(): Task {
    if (this.#status !== term.TaskStatus.Running) {
      throw new error.TaskStateError(
        `Unable to terminate task: status must be 'running', but found '${
          this.#status
        }'`
      );
    }
    return new Task(
      this.#estimatedProcessingDuration,
      this.#elapsedTime,
      term.TaskStatus.Terminated
    );
  }
}
