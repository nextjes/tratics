import * as term from "~/engine/term";
import { type PublishableState, type Updatable } from "./temporal";
import { Task } from "./task";

export class Node implements Updatable {
  readonly #cores: Array<Task | null>;
  readonly #readyQueue: Task[];

  private constructor(cores: Array<Task | null>, taskQueue: Task[]) {
    this.#cores = cores;
    this.#readyQueue = taskQueue;
  }

  static boot(coreNum: number): Node {
    const cores = Array(coreNum).fill(null);
    return new Node(cores, []);
  }

  workingCoreNum(): number {
    return this.#cores.filter((task) => task !== null).length;
  }

  waitingTaskNum(): number {
    return this.#readyQueue.filter(
      (task) => task.status() === term.TaskStatus.Ready
    ).length;
  }

  registerTask(task: Task): Node {
    return new Node(this.#cores, this.#readyQueue.concat(task));
  }

  after(deltaTime: term.MilliSecond): Node {
    let deltas = Array(this.#cores.length).fill(deltaTime.valueOf());
    while (deltas.reduce((acc, cur) => acc + cur, 0) > 0) {
      for (let i = 0; i < this.#cores.length; i++) {
        if (this.#cores[i] === null) {
          if (this.#readyQueue.length === 0) {
            deltas[i] = 0;
          } else {
            const task = (this.#readyQueue.shift() as Task)
              .start()
              .after(deltas[i]);
            if (task.status() === term.TaskStatus.Terminated) {
              const restDelta =
                deltas[i] -
                task.estimatedProcessingDuration().toMilliSeconds().valueOf();
              deltas[i] = restDelta > 0 ? restDelta : 0;
              this.#cores[i] = null;
            } else {
              deltas[i] = 0;
              this.#cores[i] = task;
            }
          }
        } else {
          const task = this.#cores[i] as Task;
          const restProcessingTime =
            task.estimatedProcessingDuration().toMilliSeconds().valueOf() -
            task.elapsedTime().valueOf();
          const restDelta = deltas[i] - restProcessingTime;
          if (restDelta > 0) {
            deltas[i] = restDelta;
            this.#cores[i] = null;
          } else {
            deltas[i] = 0;
          }
        }
      }
    }
    return new Node(this.#cores, this.#readyQueue);
  }

  reset(): Node {
    return Node.boot(this.#cores.length);
  }

  state(): PublishableState {
    return {
      role: term.Role.Node,
      contents: `${this.workingCoreNum()}/${this.#cores.length}`,
    };
  }
}
