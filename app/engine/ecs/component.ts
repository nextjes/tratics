import { Component, Types } from "ecsy";
import type { Core } from "./infra";
import type { IMessage, ITask } from "./types";

export class PreEndTimeInDelta extends Component<PreEndTimeInDelta> {
  value!: number;

  static schema = {
    value: { type: Types.Number, default: 0 },
  };
}

export class Identity extends Component<Identity> {
  id!: string;

  static schema = {
    id: { type: Types.String },
  };
}

export class Cores extends Component<Cores> {
  value!: Core[];

  static schema = {
    value: { type: Types.Array },
  };
}

export class RequestQueue extends Component<RequestQueue> {
  requests!: IMessage[];

  static schema = {
    requests: { type: Types.Array },
  };
}

export class ResponseQueue extends Component<ResponseQueue> {
  responses!: IMessage[];

  static schema = {
    responses: { type: Types.Array },
  };
}

export class InTransitMessages extends Component<InTransitMessages> {
  messages!: IMessage[];

  static schema = {
    messages: { type: Types.Array },
  };
}

export class TaskQueue extends Component<TaskQueue> {
  tasks!: ITask[];

  static schema = {
    tasks: { type: Types.Array },
  };

  registerTask(message: IMessage): void {
    const taskProcessDuration = message.size * 10;
    const task: ITask = {
      rrcId: message.rrcId,
      duration: taskProcessDuration,
      elapsed: 0,
    };
    this.tasks.push(task);
  }
}

export class LinkSpec extends Component<LinkSpec> {
  srcId!: string;
  dstId!: string;
  bandwidth!: number;
  latency!: number;
  reliability!: number;

  static schema = {
    srcId: { type: Types.String },
    dstId: { type: Types.String },
    bandwidth: { type: Types.Number },
    latency: { type: Types.Number },
    reliability: { type: Types.Number },
  };
}

export class Throughput extends Component<Throughput> {
  value!: number;

  static schema = {
    value: { type: Types.Number },
  };
}

export class EndPoints extends Component<EndPoints> {
  points!: string[];

  static schema = {
    points: { type: Types.Array },
  };
}
