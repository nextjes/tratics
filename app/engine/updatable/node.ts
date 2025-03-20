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
    // 불변성을 위해 데이터 복사
    const cores = [...this.#cores];
    const readyQueue = [...this.#readyQueue];
    const remainingTimePerCore = cores.map(() => deltaTime.valueOf());

    // 모든 코어의 시간을 소비할 때까지 처리
    while (Node.hasRemainingTime(remainingTimePerCore)) {
      Node.processAllCores(cores, readyQueue, remainingTimePerCore);
    }

    return new Node(cores, readyQueue);
  }

  // todo: scheduler로 추출해서 구현
  private static hasRemainingTime(timeArray: number[]): boolean {
    return timeArray.some((time) => time > 0);
  }

  private static processAllCores(
    cores: Array<Task | null>,
    queue: Task[],
    remainingTime: number[]
  ): void {
    cores.forEach((core, index) => {
      // 남은 시간이 없으면 처리 건너뛰기
      if (remainingTime[index] <= 0) return;

      // 코어 상태에 따른 처리
      if (core === null) {
        Node.processIdleCore(index, cores, queue, remainingTime);
      } else {
        Node.processBusyCore(index, cores, remainingTime);
      }
    });
  }

  private static processIdleCore(
    index: number,
    cores: Array<Task | null>,
    queue: Task[],
    remainingTime: number[]
  ): void {
    // 대기열이 비어있으면 시간 소비하고 종료
    if (queue.length === 0) {
      remainingTime[index] = 0;
      return;
    }

    // 대기열에서 작업 가져와서 처리 시작
    const task = queue
      .shift()!
      .start()
      .after(new term.MilliSecond(remainingTime[index]));

    // 작업 상태에 따른 처리
    if (task.status() === term.TaskStatus.Terminated) {
      // 작업이 완료된 경우 남은 시간 계산
      const taskDuration = task
        .estimatedProcessingDuration()
        .toMilliSeconds()
        .valueOf();
      remainingTime[index] = Math.max(0, remainingTime[index] - taskDuration);
    } else {
      // 작업이 아직 실행 중인 경우
      cores[index] = task;
      remainingTime[index] = 0;
    }
  }

  private static processBusyCore(
    index: number,
    cores: Array<Task | null>,
    remainingTime: number[]
  ): void {
    const task = cores[index] as Task;

    // 작업 완료까지 남은 시간 계산
    const taskRemainingTime = Node.estimateTaskRemainingTime(task);

    // 작업 완료 여부에 따른 처리
    if (remainingTime[index] > taskRemainingTime) {
      // 작업이 시간 내에 완료되는 경우
      remainingTime[index] -= taskRemainingTime;
      cores[index] = null;
    } else {
      // 작업이 계속 실행되는 경우
      remainingTime[index] = 0;
    }
  }

  private static estimateTaskRemainingTime(task: Task): number {
    return (
      task.estimatedProcessingDuration().toMilliSeconds().valueOf() -
      task.elapsedTime().valueOf()
    );
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
