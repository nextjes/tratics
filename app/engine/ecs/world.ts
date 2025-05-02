import { World } from "ecsy";
import {
  Cores,
  EndPoints,
  Identity,
  LinkSpec,
  RequestQueue,
  ResponseQueue,
  TaskQueue,
  Throughput,
  InTransitMessages,
  SourceId,
  DestinationId,
  MessageSize,
  InTransit,
  TransmittedSize,
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
  CleanPreEndTimeInDelta,
  SimulationIndicatorRelease,
  RequestTransmission,
  ResponseReception,
  ResponseTransmission,
  TaskProcessing,
  TrafficGeneration,
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
    .registerComponent(RequestQueue)
    .registerComponent(ResponseQueue)
    .registerComponent(TaskQueue)
    .registerComponent(LinkSpec)
    .registerComponent(Throughput)
    .registerComponent(EndPoints)
    .registerComponent(InTransitMessages)
    .registerComponent(SourceId)
    .registerComponent(DestinationId)
    .registerComponent(MessageSize)
    .registerComponent(InTransit)
    .registerComponent(TransmittedSize);

  world
    .registerSystem(TrafficGeneration)
    .registerSystem(RequestTransmission)
    .registerSystem(TaskProcessing)
    .registerSystem(ResponseTransmission)
    .registerSystem(ResponseReception)
    .registerSystem(CleanPreEndTimeInDelta)
    .registerSystem(SimulationIndicatorRelease);

  world
    .createEntity()
    .addComponent(Client)
    .addComponent(Identity, { id: "client-1" })
    .addComponent(RequestQueue, { requests: [] })
    .addComponent(ResponseQueue, { responses: [] });

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
    .addComponent(Identity, { id: "link-1" })
    .addComponent(Throughput, { value: 0 })
    .addComponent(InTransitMessages, { messages: [] })
    .addComponent(LinkSpec, {
      srcId: "client-1",
      dstId: "server-1",
      bandwidth: 1000,
      latency: 10,
      reliability: 0.99,
    });

  world
    .createEntity()
    .addComponent(Link)
    .addComponent(Identity, { id: "link-2" })
    .addComponent(Throughput, { value: 0 })
    .addComponent(InTransitMessages, { messages: [] })
    .addComponent(LinkSpec, {
      srcId: "server-1",
      dstId: "client-1",
      bandwidth: 1000,
      latency: 10,
      reliability: 0.99,
    });
  return world;
}
