import * as term from "~/engine/term";
import { type PublishableState, type Updatable } from "~/engine/interfaces";

/**
 * 시뮬레이션 시간을 관리하는 클래스
 * 실제 시간과 시뮬레이션 시간을 추적
 */
export class Clock implements Updatable {
  #id: term.Identifier;
  #currentTime: term.MilliSecond;
  #startRealTime: number;
  #timeScale: number;

  private constructor(
    id: term.Identifier,
    currentTime: term.MilliSecond,
    startRealTime: number,
    timeScale: number
  ) {
    this.#id = id;
    this.#currentTime = currentTime;
    this.#startRealTime = startRealTime;
    this.#timeScale = timeScale;
  }

  private clone(
    update: Partial<{
      id: term.Identifier;
      currentTime: term.MilliSecond;
      startRealTime: number;
      timeScale: number;
    }> = {}
  ): Clock {
    return new Clock(
      update.id ?? this.#id,
      update.currentTime ?? this.#currentTime,
      update.startRealTime ?? this.#startRealTime,
      update.timeScale ?? this.#timeScale
    );
  }

  /**
   * 새 시뮬레이션 시계 인스턴스 생성
   */
  public static init(): Clock {
    return new Clock(
      new term.Identifier("clock"),
      new term.MilliSecond(0),
      Date.now(),
      1.0
    );
  }

  /**
   * 시간 진행에 따른 시계 상태 업데이트
   * @param deltaTime 진행할 시간
   */
  public after(deltaTime: term.MilliSecond): Clock {
    const scaledTime = new term.MilliSecond(
      Math.floor(deltaTime.valueOf() * this.#timeScale)
    );
    return this.clone({ currentTime: this.#currentTime.add(scaledTime) });
  }

  /**
   * 시계를 초기 상태로 리셋
   */
  public reset(): Clock {
    return this.clone({
      currentTime: new term.MilliSecond(0),
      startRealTime: Date.now(),
    });
  }

  /**
   * 시간 배율 설정
   * @param scale 시간 배율 (1.0이 실시간)
   */
  public setTimeScale(scale: number): Clock {
    if (scale <= 0) {
      throw new Error("Time scale must be greater than 0");
    }
    return this.clone({ timeScale: scale });
  }

  /**
   * 현재 시뮬레이션 시간 가져오기
   */
  public currentTime(): term.MilliSecond {
    return this.#currentTime;
  }

  /**
   * 시뮬레이션 시작 이후 경과한 실제 시간 가져오기
   */
  public elapsedRealTime(): term.MilliSecond {
    const now = Date.now();
    return new term.MilliSecond(now - this.#startRealTime);
  }

  /**
   * 시계의 현재 상태를 발행 가능한 형태로 반환
   */
  public state(): PublishableState {
    return {
      id: this.#id.toString(),
      role: term.Role.Clock,
      currentTime: this.#currentTime.valueOf(),
      elapsedRealTime: this.elapsedRealTime().valueOf(),
      timeScale: this.#timeScale,
    };
  }
}
