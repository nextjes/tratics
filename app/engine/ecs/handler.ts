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
  AssignTask,
  ReleaseCore,
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
): Command[] {
  const result: Command[] = [];
  const remainingDeltaPerCore = cores.map(() => delta);

  while (remainingDeltaPerCore.some((time) => time > 0) && tasks.length > 0) {
    for (let i = 0; i < cores.length; i++) {
      const time = remainingDeltaPerCore[i];

      if (time === 0) continue;

      if (cores[i].task !== null) {
        const task = cores[i].task;
        const taskRemaingTime = task!.duration - task!.elapsed;
        remainingDeltaPerCore[i] =
          time > taskRemaingTime ? time - taskRemaingTime : 0;
        if (remainingDeltaPerCore[i] > 0) {
          cores[i].task = null;
          result.push({
            type: "update",
            name: "ReleaseCore",
            serverId: task!.dstId,
            coreIndex: i,
          } as ReleaseCore);
        }
        result.push({
          type: "update",
          name: "ProceedTask",
          requestId: task!.requestId,
          proceeded: Math.min(time, taskRemaingTime),
        } as ProceedTask);
      } else {
        if (tasks.length === 0) continue;

        const task = tasks.shift()!;
        cores[i].task = task;

        const taskRemaingTime = task.duration - task.elapsed;
        const TaskStartTimeInDelta =
          Math.max(elapsedTime, task.createdAt) - elapsedTime;
        const CoreStartTimeInDelta = delta - time;
        const remainingDeltaTime =
          delta - Math.max(TaskStartTimeInDelta, CoreStartTimeInDelta);
        remainingDeltaPerCore[i] =
          remainingDeltaTime > taskRemaingTime
            ? remainingDeltaTime - taskRemaingTime
            : 0;
        result.push({
          type: "update",
          name: "AssignTask",
          requestId: task.requestId,
          serverId: task.dstId,
          coreIndex: i,
        } as AssignTask);
        if (remainingDeltaPerCore[i] > 0) {
          cores[i].task = null;
          result.push({
            type: "update",
            name: "ReleaseCore",
            serverId: task.dstId,
            coreIndex: i,
          } as ReleaseCore);
        }

        result.push({
          type: "update",
          name: "ProceedTask",
          requestId: task.requestId,
          proceeded: Math.min(remainingDeltaTime, taskRemaingTime),
        } as ProceedTask);
      }
    }
  }

  cores.forEach((core, i) => {
    if (core.task !== null && core.task.elapsed === core.task.duration) {
      result.push({
        type: "update",
        name: "ReleaseCore",
        serverId: core.task.dstId,
        coreIndex: i,
      } as ReleaseCore);
      cores[i].task = null;
    }
  });

  return result;
}

export function terminateTasks(tasks: ITask[]): Command[] {
  const commandPairs = tasks
    .filter((task) => task.elapsed >= task.duration)
    .map((task) => [
      {
        type: "create",
        name: "CreateResponse",
        requestId: task.requestId,
        srcId: task.dstId,
        dstId: task.srcId,
        size: 40,
      } as CreateResponse,
      {
        type: "delete",
        name: "DequeueTask",
        requestId: task.requestId,
      } as DequeueTask,
    ]);
  return commandPairs.flat();
}
