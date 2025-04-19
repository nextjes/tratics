import { World } from "ecsy";
import {
  Cores,
  Identity,
  LinkSpec,
  RequestQueue,
  ResponseQueue,
  TaskQueue,
  Throughput,
} from "./component";
import { Client, RequestResponseCycle, Link, Node, Server } from "./tag";
import {
  CleanPreEndTimeInDelta,
  PerformanceIndicatorRelease,
  RequestTransmission,
  ResponseReception,
  ResponseTransmission,
  TaskProcessing,
  TrafficGeneration,
} from "./system";

function createWorld(): World {
  const world = new World();

  world
    .registerComponent(RequestResponseCycle)
    .registerComponent(Node)
    .registerComponent(Client)
    .registerComponent(Server)
    .registerComponent(Link)
    .registerComponent(Identity)
    .registerComponent(Cores)
    .registerComponent(RequestQueue)
    .registerComponent(ResponseQueue)
    .registerComponent(TaskQueue);

  world
    .registerSystem(TrafficGeneration)
    .registerSystem(RequestTransmission)
    .registerSystem(TaskProcessing)
    .registerSystem(ResponseTransmission)
    .registerSystem(ResponseReception)
    .registerSystem(CleanPreEndTimeInDelta)
    .registerSystem(PerformanceIndicatorRelease);

  world
    .createEntity()
    .addComponent(Client)
    .addComponent(Identity, { id: "client-1" })
    .addComponent(RequestQueue, { requests: [] })
    .addComponent(ResponseQueue, { responses: [] });

  world
    .createEntity()
    .addComponent(Server)
    .addComponent(Identity, { id: "server-1" })
    .addComponent(Cores, { value: [{ taskId: null }, { taskId: null }] })
    .addComponent(TaskQueue, { tasks: [] });

  world
    .createEntity()
    .addComponent(Link)
    .addComponent(Identity, { id: "link-1" })
    .addComponent(Throughput, { value: 0 })
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
    .addComponent(LinkSpec, {
      srcId: "server-1",
      dstId: "client-1",
      bandwidth: 1000,
      latency: 10,
      reliability: 0.99,
    });
  return world;
}
