import * as term from "~/engine/term";
import type { Updatable } from "~/engine/interfaces";
import type { Task } from "./task";
import * as error from "~/engine/error";

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
