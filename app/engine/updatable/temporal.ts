import * as term from "~/engine/term";

export interface Temporal {
  after(deltaTime: term.MilliSecond): Temporal;
  reset(): Temporal;
}
