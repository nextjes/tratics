import * as ecsy from "ecsy";
import type { Core } from "./infra";

export class Identity extends ecsy.Component<Identity> {
  id!: string;

  static schema = {
    id: { type: ecsy.Types.String },
  };
}

export class Cores extends ecsy.Component<Cores> {
  value!: Core[];

  static schema = {
    value: { type: ecsy.Types.Array },
  };
}

export class InTransitMessages extends ecsy.Component<InTransitMessages> {
  messages!: string[];

  static schema = {
    messages: { type: ecsy.Types.Array },
  };
}

export class TaskQueue extends ecsy.Component<TaskQueue> {
  tasks!: string[];

  static schema = {
    tasks: { type: ecsy.Types.Array },
  };
}

export class LinkSpec extends ecsy.Component<LinkSpec> {
  srcId!: string;
  dstId!: string;
  bandwidth!: number;
  latency!: number;
  reliability!: number;

  static schema = {
    srcId: { type: ecsy.Types.String },
    dstId: { type: ecsy.Types.String },
    bandwidth: { type: ecsy.Types.Number },
    latency: { type: ecsy.Types.Number },
    reliability: { type: ecsy.Types.Number },
  };
}

export class Throughput extends ecsy.Component<Throughput> {
  value!: number;

  static schema = {
    value: { type: ecsy.Types.Number },
  };
}

export class SourceId extends ecsy.Component<SourceId> {
  srcId!: string;

  static schema = {
    srcId: { type: ecsy.Types.String },
  };
}

export class DestinationId extends ecsy.Component<DestinationId> {
  dstId!: string;

  static schema = {
    dstId: { type: ecsy.Types.String },
  };
}

export class MessageSize extends ecsy.Component<MessageSize> {
  size!: number;

  static schema = {
    size: { type: ecsy.Types.Number },
  };
}

export class TransmittedSize extends ecsy.Component<TransmittedSize> {
  value!: number;

  static schema = {
    value: { type: ecsy.Types.Number },
  };
}

export class CreatedAt extends ecsy.Component<CreatedAt> {
  value!: number;

  static schema = {
    value: { type: ecsy.Types.Number },
  };
}

export class Duration extends ecsy.Component<Duration> {
  value!: number;

  static schema = {
    value: { type: ecsy.Types.Number },
  };
}

export class Elapsed extends ecsy.Component<Elapsed> {
  value!: number;

  static schema = {
    value: { type: ecsy.Types.Number },
  };
}
