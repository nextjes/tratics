import { useMemoryState } from "~/store/memory";
import type { Temporal } from "./updatable";

export class Scene {
  temporals: Temporal[];

  constructor(temporals: Temporal[]) {
    this.temporals = temporals;
  }

  publish(): void {
    const state = useMemoryState.getState();
    const handlers = {
      clock: state.setClock,
      node: state.setNodeStatus,
    };
    this.temporals.reduce((_, temporal) => {
      const { role, contents } = temporal.publishable();
      handlers[role]?.(contents);
      return null;
    }, null);
  }
}
