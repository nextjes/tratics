import * as ecsy from "ecsy";
import { useMemoryState } from "~/store/memory";
import {
  Server,
  Link,
  Client,
  ClusterEntryPoint,
  Message,
  Request,
  RequestLink,
  Task,
  Queued,
  Response,
  ResponseLink,
  InTransit,
} from "./tag";
import {
  Cores,
  DestinationId,
  Identity,
  InTransitMessages,
  LinkSpec,
  MessageSize,
  SourceId,
  TaskQueue,
  Throughput,
  TransmittedSize,
  CreatedAt,
  Duration,
  Elapsed,
} from "./component";
import type { Core } from "./infra";
import type { ICore, IMessage, ITask } from "./types";
import { NotFoundError } from "../error";
import type {
  Command,
  CreateRequest,
  ProceedMessage,
  CreateTask,
  DeleteMessage,
  ProceedTask,
  RecordThroughput,
  DequeueTask,
} from "./command";
import {
  generateRequests,
  proceedTasks,
  terminateTasks,
  transmitMessages,
} from "./handler";
import { estimateTransmissionAmount } from "./algorithm";

export class TrafficGeneration extends ecsy.System {
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
        (client: ecsy.Entity) => client.getComponent(Identity)!.id
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
            .addComponent(InTransit)
            .addComponent(TransmittedSize, { value: 0 });
      }
    });
    this.commands = [];
  }
}

export class RequestSender extends ecsy.System {
  static queries = {
    messages: { components: [Message, ecsy.Not(InTransit)] },
    links: { components: [Link] },
  };

  execute(delta: number, time: number): void {
    const messages = this.queries.messages.results;
    const links = this.queries.links.results;

    messages.forEach((message: ecsy.Entity) => {
      const messageId = message.getComponent(Identity)!.id;
      const srcId = message.getComponent(SourceId)!.srcId;
      const dstId = message.getComponent(DestinationId)!.dstId;

      const link = links.find(
        (link: ecsy.Entity) =>
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

export class RequestTransmission extends ecsy.System {
  commands: Command[] = [];

  static queries = {
    messages: { components: [Message, Request, InTransit] },
    links: { components: [Link, RequestLink] },
  };

  execute(delta: number, time: number): void {
    const links = this.queries.links.results;
    const messages = this.queries.messages.results;

    links.forEach((link: ecsy.Entity) => {
      const msgs: IMessage[] = messages
        .filter((message: ecsy.Entity) => {
          const srcId = message.getComponent(SourceId)!.srcId;
          const dstId = message.getComponent(DestinationId)!.dstId;
          return (
            link.getComponent(LinkSpec)!.srcId === srcId &&
            link.getComponent(LinkSpec)!.dstId === dstId
          );
        })
        .map((message: ecsy.Entity) => {
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
        link.getComponent(Identity)!.id,
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
        const message =
          this.queries.messages.results.find(
            (message: ecsy.Entity) =>
              message.getComponent(Identity)!.id === cmd.requestId
          ) ?? null;
        if (message === null) {
          throw new NotFoundError("Message not found");
        }
        message.getMutableComponent(TransmittedSize)!.value +
          cmd.transmittedSize;
      } else if (command.name === "CreateTask") {
        const cmd = command as CreateTask;
        const message =
          this.queries.messages.results.find(
            (message: ecsy.Entity) =>
              message.getComponent(Identity)!.id === cmd.requestId
          ) ?? null;
        if (message === null) {
          throw new NotFoundError("Message not found");
        }
        this.world
          .createEntity()
          .addComponent(Task)
          .addComponent(Identity, { id: cmd.requestId })
          .addComponent(SourceId, {
            srcId: message.getComponent(SourceId)!.srcId,
          })
          .addComponent(DestinationId, {
            dstId: message.getComponent(DestinationId)!.dstId,
          })
          .addComponent(CreatedAt, { value: cmd.createdAt })
          .addComponent(Duration, {
            value: message.getComponent(MessageSize)!.size * 100,
          })
          .addComponent(Elapsed, { value: 0 });
      } else if (command.name === "DeleteMessage") {
        const cmd = command as DeleteMessage;
        const message =
          this.queries.messages.results.find(
            (message: ecsy.Entity) =>
              message.getComponent(Identity)!.id === cmd.requestId
          ) ?? null;
        if (message === null) {
          throw new NotFoundError("Message not found");
        }
        message.remove(true);
      } else if (command.name === "RecordThroughput") {
        const cmd = command as RecordThroughput;
        const link =
          this.queries.links.results.find(
            (link: ecsy.Entity) =>
              link.getComponent(Identity)!.id === cmd.linkId
          ) ?? null;
        if (link === null) {
          throw new NotFoundError("Link not found");
        }
        link.getMutableComponent(Throughput)!.value = cmd.throughput;
      }
    });
    this.commands = [];
  }
}

export class EnqueueTask extends ecsy.System {
  static queries = {
    servers: { components: [Server, TaskQueue] },
    tasks: { components: [Task, ecsy.Not(Queued)] },
  };

  execute(delta: number, time: number): void {
    const servers = this.queries.servers.results;
    const tasks = this.queries.tasks.results;

    tasks.forEach((task: ecsy.Entity) => {
      const taskId = task.getComponent(Identity)!.id;
      const dstId = task.getComponent(DestinationId)!.dstId;

      const server = servers.find(
        (server: ecsy.Entity) => server.getComponent(Identity)!.id === dstId
      );

      if (server === undefined) {
        throw new NotFoundError("Server not found");
      }

      const taskQueue = server.getMutableComponent(TaskQueue)!;
      task.addComponent(Queued);
      taskQueue.tasks.push(taskId);
    });
  }
}

export class TaskProcessing extends ecsy.System {
  commands: Command[] = [];

  static queries = {
    servers: { components: [Server, TaskQueue, Cores] },
    tasks: { components: [Task, Queued] },
  };

  execute(delta: number, time: number): void {
    const servers = this.queries.servers.results;
    const tasks = this.queries.tasks.results;

    servers.forEach((server: ecsy.Entity) => {
      const cores = server.getComponent(Cores)!.value.map((core: Core) => {
        const task =
          tasks.find(
            (task: ecsy.Entity) =>
              task.getComponent(Identity)!.id === core.taskId
          ) ?? null;
        return { task: task } as ICore;
      });
      const taskQueue = server
        .getComponent(TaskQueue)!
        .tasks.map((taskId: string) => {
          const task = tasks.find(
            (task: ecsy.Entity) => task.getComponent(Identity)!.id === taskId
          );
          if (task === undefined) {
            throw new NotFoundError("Task not found");
          }
          return {
            requestId: task.getComponent(Identity)!.id,
            duration: task.getComponent(Duration)!.value,
            elapsed: task.getComponent(Elapsed)!.value,
            createdAt: task.getComponent(CreatedAt)!.value,
          } as ITask;
        });
      const commands = proceedTasks(taskQueue, cores, delta, time);
      this.commands.push(...commands);
    });

    this.commit();
  }

  commit(): void {
    this.commands.forEach((command) => {
      if (command.name === "ProceedTask") {
        const cmd = command as ProceedTask;
        const task = this.queries.tasks.results.find(
          (task: ecsy.Entity) =>
            task.getComponent(Identity)!.id === cmd.requestId
        );
        if (task === undefined) {
          throw new NotFoundError("Task not found");
        }
        task.getMutableComponent(Elapsed)!.value += cmd.proceeded;
      }
    });
    this.commands = [];
  }
}

export class TaskTerminating extends ecsy.System {
  commands: Command[] = [];

  static queries = {
    servers: { components: [Server, TaskQueue] },
    tasks: { components: [Task] },
  };

  execute(delta: number, time: number): void {
    const servers = this.queries.servers.results;

    servers.forEach((server: ecsy.Entity) => {
      const taskQueue = server
        .getComponent(TaskQueue)!
        .tasks.map((taskId: string) => {
          const task = this.queries.tasks.results.find(
            (task: ecsy.Entity) => task.getComponent(Identity)!.id === taskId
          );
          if (task === undefined) {
            throw new NotFoundError("Task not found");
          }
          return {
            requestId: task.getComponent(Identity)!.id,
            srcId: task.getComponent(SourceId)!.srcId,
            dstId: task.getComponent(DestinationId)!.dstId,
            duration: task.getComponent(Duration)!.value,
            elapsed: task.getComponent(Elapsed)!.value,
            createdAt: task.getComponent(CreatedAt)!.value,
          } as ITask;
        });
      const cmds = terminateTasks(taskQueue);
      this.commands.push(...cmds);
    });

    this.commit();
  }

  commit(): void {
    this.commands.forEach((command) => {
      if (command.name === "DequeueTask") {
        const cmd = command as DequeueTask;
        const task =
          this.queries.tasks.results.find(
            (task: ecsy.Entity) =>
              task.getComponent(Identity)!.id === cmd.requestId
          ) ?? null;
        if (task === null) {
          throw new NotFoundError("Task not found");
        }
        const server =
          this.queries.servers.results.find(
            (server: ecsy.Entity) =>
              server.getComponent(Identity)!.id ===
              task.getComponent(DestinationId)!.dstId
          ) ?? null;
        if (server === null) {
          throw new NotFoundError("Server not found");
        }
        const taskQueue = server.getComponent(TaskQueue)!.tasks;
        server.getMutableComponent(TaskQueue)!.tasks = taskQueue.filter(
          (taskId: string) => taskId !== cmd.requestId
        );
        task.remove(true);
      } else if (command.name === "CreateResponse") {
        const cmd = command as CreateRequest;
        this.world
          .createEntity()
          .addComponent(Message)
          .addComponent(Response)
          .addComponent(Identity, { id: cmd.requestId })
          .addComponent(SourceId, { srcId: cmd.srcId })
          .addComponent(DestinationId, { dstId: cmd.dstId })
          .addComponent(MessageSize, { size: cmd.size })
          .addComponent(InTransit)
          .addComponent(TransmittedSize, { value: 0 });
      }
    });
    this.commands = [];
  }
}

export class ResponseSender extends ecsy.System {
  static queries = {
    messages: { components: [Message, ecsy.Not(InTransit)] },
    links: { components: [Link] },
  };

  execute(delta: number, time: number): void {
    const messages = this.queries.messages.results;
    const links = this.queries.links.results;

    messages.forEach((message: ecsy.Entity) => {
      const messageId = message.getComponent(Identity)!.id;
      const srcId = message.getComponent(SourceId)!.srcId;
      const dstId = message.getComponent(DestinationId)!.dstId;

      const link = links.find(
        (link: ecsy.Entity) =>
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

export class ResponseTransmission extends ecsy.System {
  commands: Command[] = [];

  static queries = {
    messages: { components: [Message, Response, InTransit] },
    links: { components: [Link, ResponseLink] },
  };

  execute(delta: number, time: number): void {
    const links = this.queries.links.results;
    const messages = this.queries.messages.results;

    links.forEach((link: ecsy.Entity) => {
      const msgs: IMessage[] = messages
        .filter((message: ecsy.Entity) => {
          const srcId = message.getComponent(SourceId)!.srcId;
          const dstId = message.getComponent(DestinationId)!.dstId;
          return (
            link.getComponent(LinkSpec)!.srcId === srcId &&
            link.getComponent(LinkSpec)!.dstId === dstId
          );
        })
        .map((message: ecsy.Entity) => {
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
        link.getComponent(Identity)!.id,
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
          (message: ecsy.Entity) =>
            message.getComponent(Identity)!.id === cmd.requestId
        );
        if (message === undefined) {
          throw new NotFoundError("Message not found");
        }
        message.getMutableComponent(TransmittedSize)!.value +
          cmd.transmittedSize;
      } else if (command.name === "DeleteMessage") {
        const cmd = command as DeleteMessage;
        const message = this.queries.messages.results.find(
          (message: ecsy.Entity) =>
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

export class SimulationIndicatorRelease extends ecsy.System {
  static queries = {
    servers: { components: [Server] },
    links: { components: [Link] },
  };

  execute(delta: number, time: number): void {
    const { setClock, setNodeStatus, setLinkStatus } =
      useMemoryState.getState();

    setClock((time / 1000).toFixed(1));
    const newNodeStates = this.queries.servers.results.map(
      (server: ecsy.Entity) => ({
        id: server.getComponent(Identity)!.id,
        cores: server.getComponent(Cores)!.value.length,
        busyCores: server
          .getComponent(Cores)!
          .value.filter((core: Core) => core.taskId !== null).length,
      })
    );
    setNodeStatus(newNodeStates);

    const activeLinks = this.queries.links.results.map((link: ecsy.Entity) => ({
      id: link.getComponent(Identity)!.id,
      srcId: link.getComponent(LinkSpec)!.srcId,
      dstId: link.getComponent(LinkSpec)!.dstId,
      bandwidth: link.getComponent(LinkSpec)!.bandwidth,
      throughput: link.getComponent(Throughput)!.value,
    }));
    setLinkStatus(activeLinks);
  }
}
