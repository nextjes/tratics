import * as term from "~/engine/term";
import { type PublishableState, type Updatable } from "./temporal";

export class SimulationClock implements Updatable {
  readonly #simulationTime: term.MilliSecond;

  private constructor(simulationTime: term.MilliSecond) {
    this.#simulationTime = simulationTime;
  }

  static init(): SimulationClock {
    return new SimulationClock(0);
  }

  after(milliSeconds: term.MilliSecond): SimulationClock {
    const newSimulationTime = this.#simulationTime + milliSeconds;

    return new SimulationClock(newSimulationTime);
  }

  currentTime(): term.MilliSecond {
    return this.#simulationTime;
  }

  reset(): SimulationClock {
    return new SimulationClock(0);
  }

  state(): PublishableState {
    return {
      role: term.Role.Clock,
      contents: (this.#simulationTime / 1000).toFixed(4),
    };
  }
}
