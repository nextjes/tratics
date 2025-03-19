import * as term from "~/engine/term";

export class SimulationClock {
  readonly #lastTick: number;
  readonly #simulationTime: term.Second;
  readonly #lastDeltaMilliseconds: term.MilliSecond;

  private constructor(
    lastTick: number,
    simulationTime: term.Second,
    lastDeltaMilliseconds: term.MilliSecond
  ) {
    this.#lastTick = lastTick;
    this.#simulationTime = simulationTime;
    this.#lastDeltaMilliseconds = lastDeltaMilliseconds;
  }

  static init(now: number): SimulationClock {
    return new SimulationClock(
      now,
      new term.Second(0),
      new term.MilliSecond(0)
    );
  }

  // tick() 메서드는 지난 틱(Delta Time)을 계산하고 시뮬레이션 시간을 업데이트합니다.
  tick(now: number): [SimulationClock, number] {
    const delta = new term.MilliSecond(now - this.#lastTick);
    const newSimulationTime = new term.Second(
      this.#simulationTime.valueOf() + delta.toSeconds()
    );

    return [
      new SimulationClock(now, newSimulationTime, delta),
      delta.toSeconds(),
    ];
  }

  advanceBy(amount: term.MilliSecond): SimulationClock {
    const deltaMilliseconds = new term.MilliSecond(
      amount.valueOf() - this.#lastTick
    );
    const newSimulationTime = new term.Second(
      this.#simulationTime.valueOf() + deltaMilliseconds.toSeconds()
    );

    return new SimulationClock(
      amount.valueOf(),
      newSimulationTime,
      deltaMilliseconds
    );
  }

  currentTime(): term.Second {
    return this.#simulationTime;
  }

  reset(): SimulationClock {
    return new SimulationClock(
      Date.now(),
      new term.Second(0),
      new term.MilliSecond(0)
    );
  }
}
