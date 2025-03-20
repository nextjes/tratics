import { useMemoryState } from "~/store/memory";
import type { Temporal } from "./updatable";

export class Scene {
  temporals: Temporal[];

  constructor(temporals: Temporal[]) {
    this.temporals = temporals;
  }

  publish(): void {
    const statusRegister = {
      clock: useMemoryState.getState().setClock,
      node: useMemoryState.getState().setNodeStatus,
    };
    this.temporals.forEach((temporal) => {
      statusRegister[temporal.publishable().role](
        temporal.publishable().contents
      );
    });
  }
}
