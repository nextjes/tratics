import { InvalidMessageStatusError } from "../error";
import type { MessageStatus } from "./status";
import type { IMessage } from "./types";

export class Message implements IMessage {
  rrcId: string;
  srcId: string;
  dstId: string;
  size: number;
  status: MessageStatus;
  transmittedSize: number;

  constructor({
    rrcId,
    srcId,
    dstId,
    size,
    status,
    transmittedSize,
  }: {
    rrcId: string;
    srcId: string;
    dstId: string;
    size: number;
    status: MessageStatus;
    transmittedSize: number;
  }) {
    this.rrcId = rrcId;
    this.srcId = srcId;
    this.dstId = dstId;
    this.size = size;
    this.status = status;
    this.transmittedSize = transmittedSize;
  }

  private clone(
    update: Partial<{
      rrcId: string;
      srcId: string;
      dstId: string;
      size: number;
      status: MessageStatus;
      transmittedSize: number;
    }>
  ): Message {
    return new Message({
      rrcId: update.rrcId ?? this.rrcId,
      srcId: update.srcId ?? this.srcId,
      dstId: update.dstId ?? this.dstId,
      size: update.size ?? this.size,
      status: update.status ?? this.status,
      transmittedSize: update.transmittedSize ?? this.transmittedSize,
    });
  }

  transmit(bytes: number): IMessage {
    if (this.status !== "InTransit") {
      throw new InvalidMessageStatusError(
        "only in-transit message can be arrived"
      );
    }
    const transmitted = this.transmittedSize + bytes;
    if (transmitted < this.size) {
      return this.clone({ transmittedSize: transmitted });
    }
    return this.clone({
      status: "Delivered",
      transmittedSize: transmitted,
    });
  }
}
