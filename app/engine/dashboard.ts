import { useMemoryState } from "~/store/memory";
import * as term from "./term";

export class Dashboard {
  elapsedTime: term.Second;

  private constructor(elapsedTime: term.Second) {
    this.elapsedTime = elapsedTime;
  }

  static draft(): Dashboard {
    return new Dashboard(new term.Second(0));
  }

  publish(): void {
    useMemoryState.getState().setClock(this.elapsedTime.valueOf().toFixed(4));
  }
}
