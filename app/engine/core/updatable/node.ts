import * as term from "~/engine/term";
import { type Updatable, type PublishableState } from "~/engine/interfaces";
import { Task } from "./task";
import { error } from "~/engine";

/**
 * 노드 내 CPU 코어를 표현하는 클래스
 */
export class Core implements Updatable {
  #id: term.Identifier;
  #currentTask: Task | null;

  private constructor(id: term.Identifier, currentTask: Task | null) {
    this.#id = id;
    this.#currentTask = currentTask;
  }

  private clone(
    update: Partial<{
      id: term.Identifier;
      currentTask: Task | null;
    }> = {}
  ): Core {
    return new Core(
      update.id ?? this.#id,
      update.currentTask !== undefined ? update.currentTask : this.#currentTask
    );
  }

  public static idle(): Core {
    return new Core(new term.Identifier("core"), null);
  }

  /**
   * 코어에 작업 할당
   * @param task 할당할 작업
   */
  public assignTask(task: Task): Core {
    if (this.isBusy()) throw new error.BusyCoreError("Core is busy");

    return this.clone({ currentTask: task });
  }

  /**
   * 코어에서 작업 해제
   */
  public releaseTask(): Core {
    if (!this.isBusy()) throw new error.NoTaskError("No task assigned");

    return this.clone({ currentTask: null });
  }

  /**
   * 코어 상태 업데이트
   * @param deltaTime 경과 시간
   */
  public after(deltaTime: term.MilliSecond): Core {
    if (!this.#currentTask) return this.clone();

    const updatedTask = this.#currentTask.after(deltaTime);

    if (updatedTask.isCompleted()) {
      return this.releaseTask();
    }
    return this.clone({ currentTask: updatedTask });
  }

  /**
   * 코어 초기화
   */
  public reset(): Core {
    if (this.#currentTask) {
      return this.clone({ currentTask: this.#currentTask.reset() });
    }
    return this.clone({ currentTask: null });
  }

  /**
   * 코어 ID 가져오기
   */
  public id(): string {
    return this.#id.toString();
  }

  /**
   * 코어 사용 중 여부 확인
   */
  public isBusy(): boolean {
    return this.currentTask() !== null;
  }

  /**
   * 코어의 현재 작업 가져오기
   */
  public currentTask(): Task | null {
    return this.#currentTask;
  }

  /**
   * 코어 상태 객체 반환
   */
  public state(): any {
    return {
      id: this.id(),
      busy: this.isBusy(),
      task: this.#currentTask ? this.#currentTask.state() : null,
    };
  }
}

/**
 * 다중 코어를 가진 노드를 표현하는 클래스
 */
export class Node implements Updatable {
  #id: term.Identifier;
  #cores: Core[];
  #taskQueue: Task[];
  #position: term.Position;

  /**
   * 노드 생성자
   * @param coreCount 코어 개수
   * @param position 노드 위치
   */
  private constructor(
    id: term.Identifier,
    cores: Core[],
    taskQueue: Task[],
    position: term.Position
  ) {
    this.#id = id;
    this.#cores = cores;
    this.#taskQueue = taskQueue;
    this.#position = position;
  }

  private clone(
    update: Partial<{
      id: term.Identifier;
      cores: Core[];
      taskQueue: Task[];
      position: term.Position;
    }> = {}
  ): Node {
    return new Node(
      update.id ?? this.#id,
      update.cores ?? this.#cores,
      update.taskQueue ?? this.#taskQueue,
      update.position ?? this.#position
    );
  }

  /**
   * 새 노드 인스턴스 생성
   * @param coreCount 코어 개수
   */
  public static boot(coreCount: number): Node {
    return new Node(
      new term.Identifier("node"),
      Array.from({ length: coreCount }, () => Core.idle()),
      [],
      new term.Position(0, 0)
    );
  }

  /**
   * 노드를 초기 상태로 리셋
   */
  public reset(): Node {
    return this.clone({
      cores: this.#cores.map((core: Core) => core.reset()),
      taskQueue: [],
    });
  }

  /**
   * 작업 대기열에 작업 등록
   * @param task 등록할 작업
   */
  public registerTask(task: Task): Node {
    return this.clone({ taskQueue: [...this.#taskQueue, task] });
  }

  /**
   * 시간 진행에 따른 노드 상태 업데이트
   * @param deltaTime 진행할 시간
   */
  public after(deltaTime: term.MilliSecond): Node {
    const cores = [...this.#cores];
    const taskQueue = [...this.#taskQueue];
    const remainingTimePerCore = this.#cores.map(() => deltaTime);

    while (
      remainingTimePerCore.some((time) => time.valueOf() > 0) &&
      taskQueue.length > 0
    ) {
      for (let i = 0; i < cores.length; i++) {
        const core = cores[i];
        const time = remainingTimePerCore[i];

        if (time.valueOf() === 0) continue;

        if (core.isBusy()) {
          const taskRemaingTime = core.state().task.elapsed;
          remainingTimePerCore[i] =
            time.valueOf() > taskRemaingTime
              ? remainingTimePerCore[i].subtract(
                  new term.MilliSecond(taskRemaingTime)
                )
              : new term.MilliSecond(0);
          cores[i] = core.after(time);
        } else {
          if (taskQueue.length === 0) continue;

          const task = taskQueue.shift()!;
          cores[i] = core.assignTask(task).after(time);
          remainingTimePerCore[i] = new term.MilliSecond(
            Math.max(0, time.valueOf() - task.duration())
          );
        }
      }
    }
    return this.clone({
      cores: cores,
      taskQueue: taskQueue,
    });
  }

  /**
   * 노드의 현재 상태를 발행 가능한 형태로 반환
   */
  public state(): PublishableState {
    return {
      id: this.#id.toString(),
      role: term.Role.Node,
      position: {
        x: this.#position.x,
        y: this.#position.y,
      },
      cores: this.#cores.map((core) => core.state()),
      queueLength: this.#taskQueue.length,
    };
  }

  /**
   * 노드 ID 가져오기
   */
  public id(): string {
    return this.#id.toString();
  }

  /**
   * 특정 코어 가져오기
   * @param index 코어 인덱스
   */
  public core(index: number): Core {
    return this.#cores[index];
  }

  /**
   * 노드 위치 가져오기
   */
  public position(): term.Position {
    return this.#position;
  }

  /**
   * 코어 개수 가져오기
   */
  public coreCount(): number {
    return this.#cores.length;
  }

  /**
   * 대기 중인 작업 수 가져오기
   */
  public queueLength(): number {
    return this.#taskQueue.length;
  }
}
