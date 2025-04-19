import { Component, Types } from "ecsy";
import type { Core } from "./infra";

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

export class Message extends Component<Message> {
  rrcId!: string;
  srcId!: string;
  dstId!: string;
  size!: number;
  transmittedSize!: number;

  static schema = {
    rrcId: { type: Types.String },
    srcId: { type: Types.String },
    dstId: { type: Types.String },
    size: { type: Types.Number },
    transmittedSize: { type: Types.Number },
  };
}

export class RequestQueue extends Component<RequestQueue> {
  requests!: Message[];

  static schema = {
    requests: { type: Types.Array },
  };
}

export class ResponseQueue extends Component<ResponseQueue> {
  responses!: Message[];

  static schema = {
    responses: { type: Types.Array },
  };
}

export class TaskQueue extends Component<TaskQueue> {
  tasks!: Message[];

  static schema = {
    tasks: { type: Types.Array },
  };
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

export class Task extends Component<Task> {
  rrcId!: string;
  duration!: number;
  elapsed!: number;

  static schema = {
    rrcId: { type: Types.String },
    duration: { type: Types.Number },
    elapsed: { type: Types.Number },
  };
}
