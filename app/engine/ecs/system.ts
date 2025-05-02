import { Entity, Not, System } from "ecsy";
import { useMemoryState } from "~/store/memory";
import {
  Server,
  Link,
  Client,
  RequestResponseCycle,
  ClusterEntryPoint,
  Message,
  Request,
  RequestLink,
  Task,
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
  TransmittedSize,
} from "./component";
import type { Core } from "./infra";
import type { IMessage } from "./types";
import { NotFoundError } from "../error";
import type {
  Command,
  CreateRequest,
  ProceedMessage,
  CreateTask,
  DeleteMessage,
} from "./command";
import { generateRequests, transmitMessages } from "./handler";
import { estimateTransmissionAmount } from "./algorithm";

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
      algorithm: () => Math.random() > 0.5,
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
            .addComponent(Request)
            .addComponent(Identity, { id: command.requestId })
            .addComponent(SourceId, { srcId: command.srcId })
            .addComponent(DestinationId, { dstId: command.dstId })
            .addComponent(MessageSize, { size: command.size })
            .addComponent(InTransit, { value: false })
            .addComponent(TransmittedSize, { value: 0 });
      }
    });
    this.commands = [];
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
  commands: Command[] = [];

  static queries = {
    messages: { components: [Message, Request, InTransit] },
    links: { components: [Link, RequestLink] },
  };

  execute(delta: number, time: number): void {
    const links = this.queries.links.results;
    const messages = this.queries.messages.results;

    links.forEach((link: Entity) => {
      const msgs: IMessage[] = messages
        .filter((message: Entity) => {
          const srcId = message.getComponent(SourceId)!.srcId;
          const dstId = message.getComponent(DestinationId)!.dstId;
          return (
            link.getComponent(LinkSpec)!.srcId === srcId &&
            link.getComponent(LinkSpec)!.dstId === dstId
          );
        })
        .map((message: Entity) => {
          const requestId = message.getComponent(Identity)!.id;
          const size = message.getComponent(MessageSize)!.size;
          const transmittedSize = message.getComponent(TransmittedSize)!.value;

          return {
            requestId,
            size,
            transmittedSize,
          };
        });

      const commands = transmitMessages(
        estimateTransmissionAmount,
        link.getComponent(LinkSpec)!.bandwidth,
        msgs,
        delta,
        time
      );
      this.commands.push(...commands);
    });

    this.commit();
  }

  commit(): void {
    this.commands.forEach((command) => {
      if (command.name === "ProceedMessage") {
        const cmd = command as ProceedMessage;
        const message = this.queries.messages.results.find(
          (message: Entity) =>
            message.getComponent(Identity)!.id === cmd.requestId
        );
        if (message === undefined) {
          throw new NotFoundError("Message not found");
        }
        message.getMutableComponent(TransmittedSize)!.value +
          cmd.transmittedSize;
      } else if (command.name === "CreateTask") {
        const cmd = command as CreateTask;
        this.world
          .createEntity()
          .addComponent(Task)
          .addComponent(Identity, { id: cmd.requestId });
      } else if (command.name === "DeleteMessage") {
        const cmd = command as DeleteMessage;
        const message = this.queries.messages.results.find(
          (message: Entity) =>
            message.getComponent(Identity)!.id === cmd.requestId
        );
        if (message === undefined) {
          throw new NotFoundError("Message not found");
        }
        message.remove(true);
      }
    });
    this.commands = [];
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
