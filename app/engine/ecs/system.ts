import { Entity, Not, System } from "ecsy";
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
  EndPoints,
  Identity,
  InTransitMessages,
  LinkSpec,
  PreEndTimeInDelta,
  RequestQueue,
  TaskQueue,
  Throughput,
} from "./component";
import type { Core } from "./infra";
import type { IMessage } from "./types";
import { NotFoundError } from "../error";
import { Message } from "./data";

export class TrafficGeneration extends System {
  static queries = {
    clients: { components: [Client] },
    clusterEntryPoints: { components: [ClusterEntryPoint, Server] },
  };
  execute(delta: number, time: number): void {
    const clients = this.queries.clients.results;
    const clusterEntryPoint = this.queries.clusterEntryPoints.results[0];
    clients.forEach((client: Entity) => {
      const requestQueue = client.getMutableComponent(RequestQueue)!;

      if (Math.random() < 0.5) {
        // todo: Random 요소 별도 알고리즘으로 구현
        const newRRC = this.world.createEntity();
        const rrcId = `rrc-${newRRC.id}`;
        const srdId = client.getComponent(Identity)!.id;
        const dstId = clusterEntryPoint.getComponent(Identity)!.id;
        newRRC
          .addComponent(RequestResponseCycle)
          .addComponent(Identity, { id: rrcId })
          .addComponent(EndPoints, { points: [srdId, dstId] })
          .addComponent(PreEndTimeInDelta, { value: 0 });
        const message = new Message({
          rrcId: rrcId,
          srcId: srdId,
          dstId: dstId,
          status: "Created",
          size: Math.floor(Math.random() * 1000), // todo: Random size 요소 제거
          transmittedSize: 0,
        });
        requestQueue.requests.push(message);
      }
    });
  }
}

export class RequestTransmission extends System {
  static queries = {
    cycles: { components: [RequestResponseCycle] },
    clients: { components: [Client, RequestQueue], listen: { added: true } },
    ClusterEntryPoints: { components: [ClusterEntryPoint, Server] },
    links: { components: [Link] },
  };

  execute(delta: number, time: number): void {
    const clients = this.queries.clients.results;
    const links = this.queries.links.results;

    clients.forEach((client: Entity) => {
      const requestQueue = client.getComponent(RequestQueue)!;

      requestQueue.requests.forEach((message: IMessage) => {
        const link = links.find(
          (link: Entity) =>
            link.getComponent(LinkSpec)!.srcId === message.srcId &&
            link.getComponent(LinkSpec)!.dstId === message.dstId
        );

        if (link === undefined) {
          throw new NotFoundError("Link not found");
        }

        const clientId = client.getComponent(Identity)!.id;
        const linkId = link.getComponent(Identity)!.id;
        const bandwidth = link.getComponent(LinkSpec)!.bandwidth;

        this.transmitMessages(clientId, linkId, bandwidth, delta);
      });
    });
  }

  transmitMessages(
    clientId: string,
    linkId: string,
    bandwidth: number,
    delta: number
  ): void {
    const clusterEntryPoint = this.queries.clusterEntryPoints.results[0];
    const client = this.queries.clients.results.find(
      (client: Entity) => client.getComponent(Identity)!.id === clientId
    );
    const link = this.queries.links.results.find(
      (link: Entity) => link.getComponent(Identity)!.id === linkId
    );
    const inTransitMessages = client!.getMutableComponent(InTransitMessages)!;
    const throughput = link!.getMutableComponent(Throughput)!;
    if (inTransitMessages.messages.length === 0) {
      throughput.value = 0;
    }

    // 이 시간 간격 동안 전송할 수 있는 총 바이트 계산
    const bytesPerMilli = bandwidth / 1000; // 밀리초당 바이트
    const totalBytesTransmittable = bytesPerMilli * delta;

    // 여러 메시지가 있는 경우, 메시지 크기에 비례하여 대역폭 분배
    const totalSize = inTransitMessages.messages.reduce(
      (sum, msg) => sum + msg.size,
      0
    );

    const bytesForMessages = inTransitMessages.messages.map((msg) => {
      const share = totalSize > 0 ? msg.size / totalSize : 0;
      return Math.floor(totalBytesTransmittable * share);
    });

    const updatedMessages = inTransitMessages.messages.map((msg, index) => {
      return msg.transmit(bytesForMessages[index]);
    });

    // task 등록
    const deliveredMessages = updatedMessages.filter(
      (msg) => msg.status === "Delivered"
    );

    const taskQueue = clusterEntryPoint.getMutableComponent(TaskQueue)!;
    deliveredMessages.forEach((msg) => {
      taskQueue.registerTask(msg);
      const end =
        (msg.transmittedSize - msg.size) /
        (msg.size / totalSize) /
        bytesPerMilli;
      const cycle = this.queries.cycles.results.find(
        (cycle: Entity) => cycle.getComponent(Identity)!.id === msg.rrcId
      );
      cycle!.getMutableComponent(PreEndTimeInDelta)!.value = end;
    });

    // 아직 전송 중인 메시지 필터링
    const stillActiveMessages = updatedMessages.filter(
      (msg) => msg.status === "InTransit"
    );

    inTransitMessages.messages = stillActiveMessages;
    throughput.value =
      bytesForMessages.reduce((acc, bytes) => acc + bytes, 0) * (1000 / delta);
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
