import * as term from "~/engine/term";
import { type PublishableState, type Updatable } from "./temporal";

export class SimulationClock implements Updatable {
  readonly #simulationTime: term.MilliSecond;

  private constructor(simulationTime: term.MilliSecond) {
    this.#simulationTime = simulationTime;
  }

  static init(): SimulationClock {
    return new SimulationClock(new term.MilliSecond(0));
  }

  after(milliSeconds: term.MilliSecond): SimulationClock {
    const newSimulationTime = new term.MilliSecond(
      this.#simulationTime.valueOf() + milliSeconds.valueOf()
    );

    return new SimulationClock(newSimulationTime);
  }

  currentTime(): term.MilliSecond {
    return this.#simulationTime;
  }

  reset(): SimulationClock {
    return new SimulationClock(new term.MilliSecond(0));
  }

  state(): PublishableState {
    return {
      role: term.Role.Clock,
      contents: (this.#simulationTime.valueOf() / 1000).toFixed(4),
    };
  }
}
