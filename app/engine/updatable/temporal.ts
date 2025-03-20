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
}

export interface Resetable {
  reset(): Resetable;
}

export interface Updatable extends Temporal, Publishable, Resetable {
  after(deltaTime: term.MilliSecond): Updatable;
  reset(): Updatable;
}
