import * as term from "~/engine/term";
import { type Updatable, type PublishableState } from "~/engine/interfaces";
import { Task } from "./task";
import { Core } from "./core";
import * as network from "~/engine/core/network";

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
  constructor(
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
  public registerTask<T extends Node>(task: Task): T {
    return this.clone({ taskQueue: [...this.#taskQueue, task] }) as T;
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

export class Server extends Node {
  public static boot(coreCount: number): Server {
    return new Server(
      new term.Identifier("server"),
      Array.from({ length: coreCount }, () => Core.idle()),
      [],
      new term.Position(0, 0)
    );
  }

  public receiveRequest(req: network.Message): Server {
    const taskProcessDuration = req.size() * 10;
    const task = Task.ready(taskProcessDuration);
    return this.registerTask(task);
  }
}
