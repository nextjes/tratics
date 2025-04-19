import { Entity, System } from "ecsy";
import { useMemoryState } from "~/store/memory";
import {
  Server,
  Link,
  Client,
  RequestResponseCycle,
  ClusterEntryPoint,
} from "./tag";
import {
  Cores,
  Identity,
  LinkSpec,
  RequestQueue,
  Throughput,
} from "./component";
import type { Core } from "./infra";
import type { Message } from "./types";

export class TrafficGeneration extends System {
  static queries = {
    clients: { components: [Client] },
    clusterEntryPoints: { components: [ClusterEntryPoint, Server] },
  };
  execute(delta: number, time: number): void {
    const clients = this.queries.clients.results;
    const clusterEntryPoint = this.queries.clusterEntryPoints.results[0];
    clients.forEach((client: Entity) => {
      const requestQueue = client.getComponent(RequestQueue)!;

      if (Math.random() < 0.5) {
        const newRRC = this.world.createEntity();
        const rrcId = `rrc-${newRRC.id}`;
        newRRC
          .addComponent(RequestResponseCycle)
          .addComponent(Identity, { id: rrcId });
        const message: Message = {
          rrcId: rrcId,
          srcId: client.getComponent(Identity)!.id,
          dstId: clusterEntryPoint.getComponent(Identity)!.id,
          size: Math.floor(Math.random() * 1000),
          transmittedSize: 0,
        };
        requestQueue.requests.push(message);
      }
    });
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
    servers: { components: [Server] },
    links: { components: [Link] },
  };

  execute(delta: number, time: number): void {
    const { setClock, setNodeStatus, setLinkStatus } =
      useMemoryState.getState();

    setClock((time / 1000).toFixed(1));
    const newNodeStates = this.queries.servers.results.map(
      (server: Entity) => ({
        id: server.getComponent(Identity)!.id,
        cores: server.getComponent(Cores)!.value.length,
        busyCores: server
          .getComponent(Cores)!
          .value.filter((core: Core) => core.taskId !== null).length,
      })
    );
    setNodeStatus(newNodeStates);

    const activeLinks = this.queries.links.results.map((link: Entity) => ({
      id: link.getComponent(Identity)!.id,
      srcId: link.getComponent(LinkSpec)!.srcId,
      dstId: link.getComponent(LinkSpec)!.dstId,
      bandwidth: link.getComponent(LinkSpec)!.bandwidth,
      throughput: link.getComponent(Throughput)!.value,
    }));
    setLinkStatus(activeLinks);
  }
}
