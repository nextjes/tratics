import * as term from "~/engine/term";

export interface Publishable {
  role: "clock" | "node";
  contents: string;
}

export interface Temporal {
  after(deltaTime: term.MilliSecond): Temporal;
  reset(): Temporal;
  publishable(): Publishable;
}
