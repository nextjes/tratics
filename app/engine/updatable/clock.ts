import * as term from "~/engine/term";
import { type Temporal } from "./temporal";

export class SimulationClock implements Temporal {
  readonly #simulationTime: term.Second;

  private constructor(simulationTime: term.Second) {
    this.#simulationTime = simulationTime;
  }

  static init(): SimulationClock {
    return new SimulationClock(new term.Second(0));
  }

  after(milliSeconds: term.MilliSecond): SimulationClock {
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
