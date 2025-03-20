import * as term from "~/engine/term";
import { type PublishableState, type Updatable } from "./temporal";

export class SimulationClock implements Updatable {
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

  state(): PublishableState {
    return {
      role: term.Role.Clock,
      contents: this.#simulationTime.valueOf().toFixed(4),
    };
  }
}
