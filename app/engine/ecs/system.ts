import { Entity, Not, System } from "ecsy";
import { useMemoryState } from "~/store/memory";
import {
  Server,
  Link,
  Client,
  RequestResponseCycle,
  ClusterEntryPoint,
  Message,
} from "./tag";
import {
  Cores,
  DestinationId,
  EndPoints,
  Identity,
  InTransitMessages,
  LinkSpec,
  MessageSize,
  PreEndTimeInDelta,
  RequestQueue,
  SourceId,
  TaskQueue,
  Throughput,
  InTransit,
} from "./component";
import type { Core } from "./infra";
import type { IMessage } from "./types";
import { NotFoundError } from "../error";
import type { CreateRequest } from "./command";
import { generateRequests } from "./handler";

export class TrafficGeneration extends System {
  commands: CreateRequest[] = [];

  static queries = {
    clients: { components: [Client] },
    clusterEntryPoints: { components: [ClusterEntryPoint, Server] },
  };
  execute(delta: number, time: number): void {
    const clients = this.queries.clients.results;
    const clusterEntryPoint = this.queries.clusterEntryPoints.results[0];

    const commands = generateRequests({
      algorhythm: () => Math.random() > 0.5,
      clientIds: clients.map(
        (client: Entity) => client.getComponent(Identity)!.id
      ),
      entryPointId: clusterEntryPoint.getComponent(Identity)!.id,
      requestIdFactory: () => Math.random().toString(36).substring(2, 15),
      sizeFactory: () => 400,
    });
    this.commands.push(...commands);
    this.commit();
  }

  commit(): void {
    this.commands.forEach((command) => {
      switch (command.type) {
        case "create":
          this.world
            .createEntity()
            .addComponent(Message)
            .addComponent(Identity, { id: command.requestId })
            .addComponent(SourceId, { srcId: command.srcId })
            .addComponent(DestinationId, { dstId: command.dstId })
            .addComponent(MessageSize, { size: command.size })
            .addComponent(InTransit, { value: false });
          break;
        case "delete":
          // Handle delete command
          break;
        case "update":
          // Handle update command
          break;
      }
    });
  }
}

export class RequestSender extends System {
  static queries = {
    messages: { components: [Message, Not(InTransit)] },
    links: { components: [Link] },
  };

  execute(delta: number, time: number): void {
    const messages = this.queries.messages.results;
    const links = this.queries.links.results;

    messages.forEach((message: Entity) => {
      const messageId = message.getComponent(Identity)!.id;
      const srcId = message.getComponent(SourceId)!.srcId;
      const dstId = message.getComponent(DestinationId)!.dstId;

      const link = links.find(
        (link: Entity) =>
          link.getComponent(LinkSpec)!.srcId === srcId &&
          link.getComponent(LinkSpec)!.dstId === dstId
      );

      if (link === undefined) {
        throw new NotFoundError("Link not found");
      }

      const inTransitMessages = link.getMutableComponent(InTransitMessages)!;
      inTransitMessages.messages.push(messageId);
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
