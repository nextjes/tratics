import * as term from "~/engine/term";
import { type PublishableState, type Updatable } from "./temporal";

export class Node implements Updatable {
  readonly #estimatedProcessingDuration: term.Second;
  readonly #elapsedTime: term.MilliSecond;
  readonly #status: string;

  private constructor(
    estimatedProcessingDuration: term.Second,
    elapsedTime: term.MilliSecond,
    status: string
  ) {
    this.#estimatedProcessingDuration = estimatedProcessingDuration;
    this.#elapsedTime = elapsedTime;
    this.#status = status;
  }

  static init(estimatedProcessingDuration: term.Second): Node {
    return new Node(
      estimatedProcessingDuration,
      new term.MilliSecond(0),
      "idle"
    );
  }

  status(): string {
    return this.#status;
  }

  elapsedTime(): term.MilliSecond {
    return this.#elapsedTime;
  }

  after(deltaTime: term.MilliSecond): Node {
    return new Node(
      this.#estimatedProcessingDuration,
      new term.MilliSecond(this.#elapsedTime.valueOf() + deltaTime.valueOf()),
      this.#status
    );
  }

  reset(): Node {
    return new Node(
      this.#estimatedProcessingDuration,
      new term.MilliSecond(0),
      "idle"
    );
  }

  state(): PublishableState {
    return {
      role: term.Role.Node,
      contents: this.#status,
    };
  }
}
