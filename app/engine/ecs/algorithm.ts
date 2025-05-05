import type { ICore, IMessage, ITask } from "./types";

export function estimateTransmissionAmount(
  bandwidth: number,
  messages: IMessage[],
  delta: number
): {
  requestId: string;
  transmittedSize: number;
  arrivedTimeInDelta: number | null;
}[] {
  const transmissionAmount = bandwidth * delta;
  const result: {
    requestId: string;
    transmittedSize: number;
    arrivedTimeInDelta: number | null;
  }[] = [];

  let remainingTransmissionAmount = transmissionAmount;

  for (const message of messages) {
    const { requestId, size, transmittedSize } = message;
    const remainingSize = size - transmittedSize;

    if (remainingSize <= remainingTransmissionAmount) {
      result.push({
        requestId,
        transmittedSize: remainingSize,
        arrivedTimeInDelta:
          (result.reduce((acc, msg) => acc + msg.transmittedSize, 0) +
            remainingSize) /
          bandwidth,
      });
      remainingTransmissionAmount -= remainingSize;
    } else {
      result.push({
        requestId,
        transmittedSize: remainingTransmissionAmount,
        arrivedTimeInDelta: null,
      });
      remainingTransmissionAmount = 0;
    }
  }
  return result;
}

export function processTasks(
  tasks: ITask[],
  cores: ICore[],
  delta: number,
  elapsedTime: number
): {
  requestId: string;
  proceeded: number;
}[] {
  const result: {
    requestId: string;
    proceeded: number;
  }[] = [];
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
        }
        result.push({
          requestId: task!.requestId,
          proceeded: Math.min(time, taskRemaingTime),
        });
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
        if (remainingDeltaPerCore[i] > 0) {
          cores[i].task = null;
        }
        result.push({
          requestId: task.requestId,
          proceeded: Math.min(remainingDeltaTime, taskRemaingTime),
        });
      }
    }
  }
  return result;
}
