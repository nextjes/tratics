import { Component, Types } from "ecsy";
import type { Core } from "./infra";

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

export class InTransitMessages extends Component<InTransitMessages> {
  messages!: string[];

  static schema = {
    messages: { type: Types.Array },
  };
}

export class TaskQueue extends Component<TaskQueue> {
  tasks!: string[];

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

export class SourceId extends Component<SourceId> {
  srcId!: string;

  static schema = {
    srcId: { type: Types.String },
  };
}

export class DestinationId extends Component<DestinationId> {
  dstId!: string;

  static schema = {
    dstId: { type: Types.String },
  };
}

export class MessageSize extends Component<MessageSize> {
  size!: number;

  static schema = {
    size: { type: Types.Number },
  };
}

export class InTransit extends Component<InTransit> {
  value!: boolean;

  static schema = {
    value: { type: Types.Boolean },
  };
}

export class TransmittedSize extends Component<TransmittedSize> {
  value!: number;

  static schema = {
    value: { type: Types.Number },
  };
}

export class CreatedAt extends Component<CreatedAt> {
  value!: number;

  static schema = {
    value: { type: Types.Number },
  };
}

export class Duration extends Component<Duration> {
  value!: number;

  static schema = {
    value: { type: Types.Number },
  };
}

export class Elapsed extends Component<Elapsed> {
  value!: number;

  static schema = {
    value: { type: Types.Number },
  };
}
