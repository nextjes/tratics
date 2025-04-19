import { Entity, System } from "ecsy";
import { useMemoryState } from "~/store/memory";
import { Server, Link } from "./tag";
import { Cores, Identity, LinkSpec, Throughput } from "./component";
import type { Core } from "./infra";

export class TrafficGeneration extends System {
  execute(delta: number, time: number): void {
    // Implement the logic for traffic generation
  }
}

export class RequestTransmission extends System {
  execute(delta: number, time: number): void {
    // Implement the logic for request transmission
  }
}

export class TaskProcessing extends System {
  execute(delta: number, time: number): void {
    // Implement the logic for task processing
  }
}

export class ResponseTransmission extends System {
  execute(delta: number, time: number): void {
    // Implement the logic for response transmission
  }
}

export class ResponseReception extends System {
  execute(delta: number, time: number): void {
    // Implement the logic for response reception
  }
}

export class CleanPreEndTimeInDelta extends System {
  execute(delta: number, time: number): void {
    // Implement the logic for cleaning remaining delta
  }
}

export class SimulationIndicatorRelease extends System {
  static queries = {
    nodes: { components: [Server] },
    links: { components: [Link] },
  };

  execute(delta: number, time: number): void {
    const { setClock, setNodeStatus, setLinkStatus } =
      useMemoryState.getState();

    setClock((time / 1000).toFixed(1));
    const newNodeStates = this.queries.nodes.results.map((entity: Entity) => ({
      id: entity.getComponent(Identity)!.id,
      cores: entity.getComponent(Cores)!.value.length,
      busyCores: entity
        .getComponent(Cores)!
        .value.filter((core: Core) => core.taskId !== null).length,
    }));
    setNodeStatus(newNodeStates);

    const activeLinks = this.queries.links.results.map((entity: Entity) => ({
      id: entity.getComponent(Identity)!.id,
      srcId: entity.getComponent(LinkSpec)!.srcId,
      dstId: entity.getComponent(LinkSpec)!.dstId,
      bandwidth: entity.getComponent(LinkSpec)!.bandwidth,
      throughput: entity.getComponent(Throughput)!.value,
    }));
    setLinkStatus(activeLinks);
  }
}
