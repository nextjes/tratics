import * as term from "~/engine/term";

export interface PublishableState {
  role: term.Role;
  contents: string;
}

export interface Publishable {
  state(): PublishableState;
}

export interface Temporal {
  after(deltaTime: term.MilliSecond): Temporal;
  reset(): Temporal;
}
