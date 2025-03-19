export class SimulationClock {
  readonly #lastTick: number;
  readonly #simulationTime: number;
  readonly #lastDeltaMilliseconds: number;

  private constructor(
    lastTick: number,
    simulationTime: number,
    lastDeltaMilliseconds: number
  ) {
    this.#lastTick = lastTick;
    this.#simulationTime = simulationTime;
    this.#lastDeltaMilliseconds = lastDeltaMilliseconds;
  }

  static init(now: number): SimulationClock {
    return new SimulationClock(now, 0, 0);
  }

  // tick() 메서드는 지난 틱(Delta Time)을 계산하고 시뮬레이션 시간을 업데이트합니다.
  tick(now: number): [SimulationClock, number] {
    const delta = now - this.#lastTick;
    const deltaSeconds = delta / 1000;
    const newSimulationTime = this.#simulationTime + deltaSeconds;

    return [new SimulationClock(now, newSimulationTime, delta), deltaSeconds];
  }

  advance(to: number): SimulationClock {
    const deltaMilliseconds = to - this.#lastTick;
    const newSimulationTime = this.#simulationTime + deltaMilliseconds / 1000;

    return new SimulationClock(to, newSimulationTime, deltaMilliseconds);
  }

  currentTime(): number {
    return this.#simulationTime;
  }

  reset(): SimulationClock {
    return new SimulationClock(Date.now(), 0, 0);
  }
}
