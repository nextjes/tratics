import { useMemoryState } from "~/store/memory";
import type { Publishable } from "./updatable";
import * as term from "./term";

export class Scene {
  publishables: Publishable[];

  constructor(publishables: Publishable[]) {
    this.publishables = publishables;
  }

  publish(): void {
    const state = useMemoryState.getState();
    const handlers = {
      [term.Role.Clock]: state.setClock,
      [term.Role.Node]: state.setNodeStatus,
    };
    this.publishables.forEach((publishable) => {
      const { role, contents } = publishable.state();
      handlers[role as term.Role]?.(contents);
    });
  }
}
