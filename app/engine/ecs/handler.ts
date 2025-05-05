import { processTasks } from "./algorithm";
import type {
  Command,
  CreateRequest,
  ProceedMessage,
  CreateTask,
  DeleteMessage,
  ProceedTask,
  DequeueTask,
  CreateResponse,
  RecordThroughput,
} from "./command";
import type { GenerateRequestsProps } from "./props";
import type { ICore, IMessage, ITask } from "./types";

export function generateRequests({
  algorithm,
  clientIds,
  entryPointId,
  requestIdFactory,
  sizeFactory,
}: GenerateRequestsProps): CreateRequest[] {
  return clientIds
    .map((clientId) => {
      if (algorithm()) {
        return {
          type: "create",
          name: "CreateRequest",
          requestId: requestIdFactory(),
          srcId: clientId,
          dstId: entryPointId,
          size: sizeFactory(),
        };
      }
      return null;
    })
    .filter((cmd): cmd is CreateRequest => cmd !== null);
}

export function transmitMessages(
  algorithm: (
    bandwidth: number,
    messages: IMessage[],
    delta: number
  ) => {
    requestId: string;
    transmittedSize: number;
    arrivedTimeInDelta: number | null;
  }[],
  linkId: string,
  bandwidth: number,
  messages: IMessage[],
  delta: number,
  elapsedTime: number
): Command[] {
  const transmissionResults = algorithm(bandwidth, messages, delta);

  const result: Command[] = [];
  for (const {
    requestId,
    transmittedSize,
    arrivedTimeInDelta,
  } of transmissionResults) {
    if (arrivedTimeInDelta === null) {
      result.push({
        type: "update",
        name: "ProceedMessage",
        requestId,
        transmittedSize,
      } as ProceedMessage);
    } else {
      result.push({
        type: "create",
        name: "CreateTask",
        requestId,
        createdAt: elapsedTime + arrivedTimeInDelta,
      } as CreateTask);
      result.push({
        type: "delete",
        name: "DeleteMessage",
        requestId,
      } as DeleteMessage);
    }
  }
  const throughput = transmissionResults.reduce(
    (acc, { transmittedSize }) => acc + transmittedSize,
    0
  );
  result.push({
    type: "update",
    name: "RecordThroughput",
    linkId: linkId,
    throughput: throughput / (delta / 1000),
  } as RecordThroughput);
  return result;
}

export function proceedTasks(
  tasks: ITask[],
  cores: ICore[],
  delta: number,
  elapsedTime: number
): ProceedTask[] {
  return processTasks(tasks, cores, delta, elapsedTime).map(
    ({ requestId, proceeded }) =>
      ({
        type: "update",
        name: "ProceedTask",
        requestId,
        proceeded,
      } as ProceedTask)
  );
}

export function terminateTasks(tasks: ITask[]): Command[] {
  const commandPairs = tasks
    .filter((task) => task.elapsed >= task.duration)
    .map((task) => [
      {
        type: "delete",
        name: "DequeueTask",
        requestId: task.requestId,
      } as DequeueTask,
      {
        type: "create",
        name: "CreateResponse",
        requestId: task.requestId,
        srcId: task.dstId,
        dstId: task.srcId,
        size: 40,
      } as CreateResponse,
    ]);
  return commandPairs.flat();
}
