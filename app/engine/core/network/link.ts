import * as term from "~/engine/term";
import { type PublishableState, type Updatable } from "~/engine/interfaces";
import { Message } from "./message";
import { error } from "~/engine";

/**
 * 네트워크 링크를 표현하는 클래스
 * 불변성을 유지하기 위해 상태 변경 시 새 객체 반환
 */
export class NetworkLink implements Updatable {
  readonly #id: term.Identifier;
  readonly #srcId: string;
  readonly #dstId: string;
  readonly #bandwidth: number;
  readonly #latency: term.MilliSecond;
  readonly #reliability: number;
  readonly #inTransitMessages: Message[];
  readonly #throughput: number;

  /**
   * 네트워크 링크 생성자
   */
  private constructor(
    id: term.Identifier,
    srcId: string,
    dstId: string,
    bandwidth: number,
    latency: term.MilliSecond,
    reliability: number,
    inTransitMessages: Message[],
    throughput: number
  ) {
    this.#id = id;
    this.#srcId = srcId;
    this.#dstId = dstId;
    this.#bandwidth = bandwidth;
    this.#latency = latency;
    this.#reliability = reliability;
    this.#inTransitMessages = [...inTransitMessages];
    this.#throughput = throughput;
  }

  private clone(
    update: Partial<{
      id: term.Identifier;
      srcId: string;
      dstId: string;
      bandwidth: number;
      latency: term.MilliSecond;
      reliability: number;
      inTransitMessages: Message[];
      throughput: number;
    }> = {}
  ): NetworkLink {
    return new NetworkLink(
      update.id ?? this.#id,
      update.srcId ?? this.#srcId,
      update.dstId ?? this.#dstId,
      update.bandwidth ?? this.#bandwidth,
      update.latency ?? this.#latency,
      update.reliability ?? this.#reliability,
      update.inTransitMessages ?? this.#inTransitMessages,
      update.throughput ?? this.#throughput
    );
  }

  /**
   * 새 네트워크 링크 생성
   */
  public static connect(srcId: string, dstId: string): NetworkLink {
    return new NetworkLink(
      new term.Identifier("link"),
      srcId,
      dstId,
      3000000,
      new term.MilliSecond(100),
      1.0,
      [],
      0
    );
  }

  /**
   * 시간 경과에 따른 링크 상태 업데이트
   * 불변성 유지를 위해 새 객체 반환
   */
  public after(deltaTime: term.MilliSecond): NetworkLink {
    if (this.#inTransitMessages.length === 0) {
      return this.clone({ throughput: 0 });
    }

    // 이 시간 간격 동안 전송할 수 있는 총 바이트 계산
    const bytesPerMilli = this.#bandwidth / 1000; // 밀리초당 바이트
    const totalBytesTransmittable = bytesPerMilli * deltaTime.valueOf();

    // 여러 메시지가 있는 경우, 메시지 크기에 비례하여 대역폭 분배
    const totalSize = this.#inTransitMessages.reduce(
      (sum, msg) => sum + msg.size(),
      0
    );

    const bytesForMessages = this.#inTransitMessages.map((msg) => {
      const share = totalSize > 0 ? msg.size() / totalSize : 0;
      return Math.floor(totalBytesTransmittable * share);
    });

    const updatedMessages = this.#inTransitMessages.map((msg, index) => {
      return msg.transmit(bytesForMessages[index]);
    });

    // 아직 전송 중인 메시지 필터링
    const stillActiveMessages = updatedMessages.filter((msg) =>
      msg.isInTransit()
    );

    return this.clone({
      inTransitMessages: stillActiveMessages,
      throughput:
        bytesForMessages.reduce((acc, bytes) => acc + bytes, 0) *
        (1000 / deltaTime.valueOf()),
    });
  }

  /**
   * 링크를 초기 상태로 리셋
   */
  public reset(): NetworkLink {
    return this.clone();
  }

  public transmit(message: Message): NetworkLink {
    if (!message.isCreated()) {
      throw new error.InvalidMessageStatusError(
        "only created message can be started transit"
      );
    }

    return new NetworkLink(
      this.#id,
      this.#srcId,
      this.#dstId,
      this.#bandwidth,
      this.#latency,
      this.#reliability,
      [...this.#inTransitMessages, message.startTransit()],
      0
    );
  }

  /**
   * 링크의 현재 상태를 발행 가능한 형태로 반환
   */
  public state(): PublishableState {
    return {
      id: this.#id.toString(),
      role: term.Role.Link,
      srcId: this.#srcId,
      dstId: this.#dstId,
      bandwidth: this.#bandwidth,
      latency: this.#latency.valueOf(),
      reliability: this.#reliability,
      activeMessages: this.#inTransitMessages.map((msg) => msg.id()),
      messageCount: this.#inTransitMessages.length,
      throughput: this.#throughput,
    };
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

  public bandwidth(): number {
    return this.#bandwidth;
  }

  public latency(): term.MilliSecond {
    return this.#latency;
  }

  public reliability(): number {
    return this.#reliability;
  }

  public activeMessages(): Message[] {
    return [...this.#inTransitMessages];
  }
}
