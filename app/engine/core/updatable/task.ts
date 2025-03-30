import * as term from "~/engine/term";
import {
  type Temporal,
  type Publishable,
  type PublishableState,
} from "~/engine/interfaces";

/**
 * 작업 상태를 나타내는 열거형
 */
export enum TaskStatus {
  Ready = "ready", // 실행 준비됨
  Running = "running", // 현재 실행 중
  Completed = "completed", // 완료됨
  Failed = "failed", // 실패함
}

/**
 * 작업 처리 결과를 나타내는 타입
 */
export type TaskResult = {
  success: boolean;
  message?: string;
  data?: any;
};

/**
 * 노드에서 처리하는 작업을 표현하는 클래스
 * 시간에 따라 상태가 변화하는 Temporal 인터페이스 구현
 */
export class Task implements Temporal, Publishable {
  #id: term.Identifier;
  #status: TaskStatus;
  #duration: term.MilliSecond;
  #elapsed: term.MilliSecond;
  #result: TaskResult | null;

  /**
   * 작업 생성자
   * @param duration 작업 처리에 필요한 시간 (밀리초)
   */
  private constructor(
    id: term.Identifier,
    status: TaskStatus,
    duration: term.MilliSecond,
    elapsed: term.MilliSecond,
    result: TaskResult | null
  ) {
    this.#id = id;
    this.#status = status;
    this.#duration = duration;
    this.#elapsed = elapsed;
    this.#result = result;
  }

  private clone(
    update: Partial<{
      id: term.Identifier;
      status: TaskStatus;
      duration: term.MilliSecond;
      elapsed: term.MilliSecond;
      result: TaskResult | null;
    }> = {}
  ): Task {
    return new Task(
      update.id ?? this.#id,
      update.status ?? this.#status,
      update.duration ?? this.#duration,
      update.elapsed ?? this.#elapsed,
      update.result !== undefined ? update.result : this.#result
    );
  }

  /**
   * 새 작업 인스턴스 생성
   * @param durationMs 작업 처리에 필요한 시간 (밀리초)
   */
  public static ready(durationMs: number): Task {
    return new Task(
      new term.Identifier("task"),
      TaskStatus.Ready,
      new term.MilliSecond(durationMs),
      new term.MilliSecond(0),
      null
    );
  }

  /**
   * 시간 진행에 따른 작업 상태 업데이트
   * @param deltaTime 진행할 시간
   */
  public after(deltaTime: term.MilliSecond): Task {
    if (this.isCompleted() || this.isFailed()) {
      return this.clone();
    }
    const elaspsedTime = this.#elapsed.add(deltaTime);
    const isOverDuration =
      elaspsedTime.greaterThan(this.#duration) ||
      elaspsedTime.equals(this.#duration);

    if (this.isReady()) {
      return this.clone({
        status: isOverDuration ? TaskStatus.Completed : TaskStatus.Running,
        elapsed: elaspsedTime,
      });
    }

    if (this.isRunning() && isOverDuration) {
      return this.clone({
        status: TaskStatus.Completed,
        elapsed: elaspsedTime,
        result: { success: true },
      });
    }

    return this.clone({ elapsed: elaspsedTime });
  }

  /**
   * 작업을 초기 상태로 리셋
   */
  public reset(): Task {
    this.#status = TaskStatus.Ready;
    this.#elapsed = new term.MilliSecond(0);
    this.#result = null;
    return this.clone({
      status: TaskStatus.Ready,
      elapsed: new term.MilliSecond(0),
      result: null,
    });
  }

  /**
   * 작업의 현재 상태를 발행 가능한 형태로 반환
   */
  public state(): PublishableState {
    return {
      id: this.#id.toString(),
      role: term.Role.Message, // Task는 Message 역할로 간주
      status: this.#status,
      elapsed: this.#elapsed.valueOf(),
      duration: this.#duration.valueOf(),
      progress: this.calculateProgress(),
      result: this.#result,
    };
  }

  /**
   * 작업 진행률 계산 (0-100%)
   */
  private calculateProgress(): number {
    if (this.#duration.valueOf() === 0) return 100;

    const progress = (this.#elapsed.valueOf() / this.#duration.valueOf()) * 100;
    return Math.min(100, Math.max(0, progress));
  }

  /**
   * 작업 ID 가져오기
   */
  public id(): string {
    return this.#id.toString();
  }

  public duration(): number {
    return this.#duration.valueOf();
  }

  /**
   * 작업 상태 확인 메서드들
   */
  public isReady(): boolean {
    return this.#status === TaskStatus.Ready;
  }

  public isRunning(): boolean {
    return this.#status === TaskStatus.Running;
  }

  public isCompleted(): boolean {
    return this.#status === TaskStatus.Completed;
  }

  public isFailed(): boolean {
    return this.#status === TaskStatus.Failed;
  }

  /**
   * 작업 실패 처리
   * @param message 실패 원인 메시지
   */
  public fail(message: string): Task {
    return this.clone({
      status: TaskStatus.Failed,
      result: { success: false, message: message },
    });
  }
}
