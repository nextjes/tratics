import { Component, Types } from "ecsy";
import type { Core } from "./infra";

export class PreEndTimeInDelta extends Component<PreEndTimeInDelta> {
  static schema = {
    value: { type: Types.Number, default: 0 },
  };
}

export class Identity extends Component<Identity> {
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
  static schema = {
    requests: { type: Types.Array },
  };
}

export class ResponseQueue extends Component<ResponseQueue> {
  static schema = {
    responses: { type: Types.Array },
  };
}

export class TaskQueue extends Component<TaskQueue> {
  static schema = {
    tasks: { type: Types.Array },
  };
}

export class LinkSpec extends Component<LinkSpec> {
  static schema = {
    srcId: { type: Types.String },
    dstId: { type: Types.String },
    bandwidth: { type: Types.Number },
    latency: { type: Types.Number },
    reliability: { type: Types.Number },
  };
}

export class Throughput extends Component<Throughput> {
  static schema = {
    value: { type: Types.Number },
  };
}
