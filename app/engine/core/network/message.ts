import { error } from "~/engine";
import * as term from "~/engine/term";

/**
 * 메시지의 상태를 추적하기 위한 열거형
 */
export enum MessageStatus {
  Created = "created",
  InTransit = "inTransit",
  Delivered = "delivered",
}

/**
 * 네트워크 메시지를 표현하는 클래스
 * 불변성을 유지하기 위해 상태 변경 시 새 객체 반환
 */
export class Message {
  readonly #id: term.Identifier;
  readonly #srcId: string;
  readonly #dstId: string;
  readonly #size: number;
  readonly #status: MessageStatus;
  readonly #transmittedSize: number;

  /**
   * 메시지 생성자
   */
  private constructor(
    id: term.Identifier,
    srcId: string,
    dstId: string,
    size: number,
    status: MessageStatus,
    transmittedSize: number
  ) {
    this.#id = id;
    this.#srcId = srcId;
    this.#dstId = dstId;
    this.#size = size;
    this.#status = status;
    this.#transmittedSize = transmittedSize;
  }

  private clone(
    update: Partial<{
      id: term.Identifier;
      srcId: string;
      dstId: string;
      size: number;
      status: MessageStatus;
      transmittedSize: number;
    }>
  ): Message {
    return new Message(
      update.id ?? this.#id,
      update.srcId ?? this.#srcId,
      update.dstId ?? this.#dstId,
      update.size ?? this.#size,
      update.status ?? this.#status,
      update.transmittedSize ?? this.#transmittedSize
    );
  }

  public static written(srcId: string, dstId: string, size: number): Message {
    return new Message(
      new term.Identifier("message"),
      srcId,
      dstId,
      size,
      MessageStatus.Created,
      0
    );
  }

  public static request(srcId: string, dstId: string, size: number): Message {
    return Message.written(srcId, dstId, size);
  }

  public static response(srcId: string, dstId: string, size: number): Message {
    return Message.written(srcId, dstId, size);
  }

  public startTransit(): Message {
    if (!this.isCreated()) {
      throw new error.InvalidMessageStatusError(
        "only created message can be started transit"
      );
    }
    return this.clone({ status: MessageStatus.InTransit });
  }

  public transmit(size: number): Message {
    if (!this.isInTransit()) {
      throw new error.InvalidMessageStatusError(
        "only in-transit message can be arrived"
      );
    }
    const transmitted = this.#transmittedSize + size;
    if (transmitted < this.#size) {
      return this.clone({ transmittedSize: transmitted });
    }
    return this.clone({
      status: MessageStatus.Delivered,
      transmittedSize: Math.min(this.#size, transmitted),
    });
  }

  public id(): string {
    return this.#id.toString();
  }

  public srcId(): string {
    return this.#srcId;
  }

  public dstId(): string {
    return this.#dstId;
  }

  public size(): number {
    return this.#size;
  }

  public transmittedSize(): number {
    return this.#transmittedSize;
  }

  public isCreated(): boolean {
    return this.#status === MessageStatus.Created;
  }

  public isInTransit(): boolean {
    return this.#status === MessageStatus.InTransit;
  }

  public isDelivered(): boolean {
    return this.#status === MessageStatus.Delivered;
  }
}
