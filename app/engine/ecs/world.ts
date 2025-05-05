import { World } from "ecsy";
import {
  Cores,
  Identity,
  LinkSpec,
  TaskQueue,
  Throughput,
  InTransitMessages,
  SourceId,
  DestinationId,
  MessageSize,
  InTransit,
  TransmittedSize,
  CreatedAt,
  Duration,
  Elapsed,
} from "./component";
import {
  Client,
  RequestResponseCycle,
  Link,
  Node,
  Server,
  ClusterEntryPoint,
  Message,
  Request,
  RequestLink,
  ResponseLink,
  Task,
  Queued,
} from "./tag";
import {
  SimulationIndicatorRelease,
  RequestTransmission,
  ResponseTransmission,
  TaskProcessing,
  TrafficGeneration,
  RequestSender,
  EnqueueTask,
  TaskTerminating,
  ResponseSender,
} from "./system";

export function createWorld(): World {
  const world = new World();

  world
    .registerComponent(RequestResponseCycle)
    .registerComponent(Node)
    .registerComponent(Client)
    .registerComponent(Server)
    .registerComponent(Link)
    .registerComponent(ClusterEntryPoint)
    .registerComponent(Message)
    .registerComponent(Request)
    .registerComponent(RequestLink)
    .registerComponent(ResponseLink)
    .registerComponent(Task)
    .registerComponent(Queued);

  world
    .registerComponent(Identity)
    .registerComponent(Cores)
    .registerComponent(TaskQueue)
    .registerComponent(LinkSpec)
    .registerComponent(Throughput)
    .registerComponent(InTransitMessages)
    .registerComponent(SourceId)
    .registerComponent(DestinationId)
    .registerComponent(MessageSize)
    .registerComponent(InTransit)
    .registerComponent(TransmittedSize)
    .registerComponent(CreatedAt)
    .registerComponent(Duration)
    .registerComponent(Elapsed);

  world
    .registerSystem(TrafficGeneration, { priority: 0 })
    .registerSystem(RequestSender, { priority: 1 })
    .registerSystem(RequestTransmission, { priority: 2 })
    .registerSystem(EnqueueTask, { priority: 3 })
    .registerSystem(TaskProcessing, { priority: 4 })
    .registerSystem(TaskTerminating, { priority: 5 })
    .registerSystem(ResponseSender, { priority: 6 })
    .registerSystem(ResponseTransmission, { priority: 7 })
    .registerSystem(SimulationIndicatorRelease, { priority: 8 });

  world
    .createEntity()
    .addComponent(Client)
    .addComponent(Identity, { id: "client-1" });

  world
    .createEntity()
    .addComponent(Server)
    .addComponent(ClusterEntryPoint)
    .addComponent(Identity, { id: "server-1" })
    .addComponent(Cores, { value: [{ taskId: null }, { taskId: null }] })
    .addComponent(TaskQueue, { tasks: [] });

  world
    .createEntity()
    .addComponent(Link)
    .addComponent(RequestLink)
    .addComponent(Identity, { id: "link-1" })
    .addComponent(Throughput, { value: 0 })
    .addComponent(InTransitMessages, { messages: [] })
    .addComponent(LinkSpec, {
      srcId: "client-1",
      dstId: "server-1",
      bandwidth: 1000,
      latency: 10,
      reliability: 0.99,
    })
    .addComponent(Throughput, { value: 0 });

  world
    .createEntity()
    .addComponent(Link)
    .addComponent(ResponseLink)
    .addComponent(Identity, { id: "link-2" })
    .addComponent(Throughput, { value: 0 })
    .addComponent(InTransitMessages, { messages: [] })
    .addComponent(LinkSpec, {
      srcId: "server-1",
      dstId: "client-1",
      bandwidth: 1000,
      latency: 10,
      reliability: 0.99,
    })
    .addComponent(Throughput, { value: 0 });
  return world;
}
