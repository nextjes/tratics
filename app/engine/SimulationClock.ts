import * as term from "~/engine/term";

export class SimulationClock {
  readonly #simulationTime: term.Second;

  private constructor(simulationTime: term.Second) {
    this.#simulationTime = simulationTime;
  }

  static init(): SimulationClock {
    return new SimulationClock(new term.Second(0));
  }

  advanceBy(milliSeconds: term.MilliSecond): SimulationClock {
    const newSimulationTime = new term.Second(
      this.#simulationTime.valueOf() + milliSeconds.toSeconds()
    );

    return new SimulationClock(newSimulationTime);
  }

  currentTime(): term.Second {
    return this.#simulationTime;
  }

  reset(): SimulationClock {
    return new SimulationClock(new term.Second(0));
  }
}
