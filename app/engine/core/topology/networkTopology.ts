import * as term from "~/engine/term";
import { type PublishableState, type Updatable } from "~/engine/interfaces";
import { Node } from "../updatable/node";
import { Message } from "../network/message";
import { NetworkLink } from "../network/link";
import { error } from "~/engine";

/**
 * 네트워크 토폴로지를 표현하는 클래스
 * 노드, 링크, 메시지의 상호작용을 관리
 */
export class NetworkTopology implements Updatable {
  readonly #id: term.Identifier;
  readonly #nodes: Map<string, Node>;
  readonly #links: Map<string, NetworkLink>;
  readonly #messages: Map<string, Message>;
  readonly #pendingMessages: Message[];

  /**
   * 네트워크 토폴로지 생성자
   */
  private constructor(
    id: term.Identifier,
    nodes: Map<string, Node>,
    links: Map<string, NetworkLink>,
    messages: Map<string, Message>,
    pendingMessages: Message[]
  ) {
    this.#id = id;
    this.#nodes = new Map(nodes);
    this.#links = new Map(links);
    this.#messages = new Map(messages);
    this.#pendingMessages = [...pendingMessages];
  }

  private clone(
    update: Partial<{
      id: term.Identifier;
      nodes: Map<string, Node>;
      links: Map<string, NetworkLink>;
      messages: Map<string, Message>;
      pendingMessages: Message[];
    }> = {}
  ): NetworkTopology {
    return new NetworkTopology(
      update.id ?? this.#id,
      update.nodes ?? this.#nodes,
      update.links ?? this.#links,
      update.messages ?? this.#messages,
      update.pendingMessages ?? this.#pendingMessages
    );
  }

  /**
   * 빈 네트워크 토폴로지 생성
   */
  public static init(): NetworkTopology {
    return new NetworkTopology(
      new term.Identifier("topology"),
      new Map(),
      new Map(),
      new Map(),
      []
    );
  }

  /**
   * 시간 경과에 따른 토폴로지 상태 업데이트
   * 노드, 링크, 메시지의 상태를 업데이트하고 메시지 라우팅 처리
   */
  public after(deltaTime: term.MilliSecond): NetworkTopology {
    // 1. 모든 노드 업데이트
    const updatedNodes = new Map<string, Node>();
    for (const [id, node] of this.#nodes.entries()) {
      updatedNodes.set(id, node.after(deltaTime));
    }

    // 2. 모든 링크 업데이트
    const updatedLinks = new Map<string, NetworkLink>();
    for (const [id, link] of this.#links.entries()) {
      updatedLinks.set(id, link.after(deltaTime));
    }

    // 3. 모든 활성 메시지 상태 추적
    const updatedMessages = new Map<string, Message>();
    const newPendingMessages: Message[] = [];

    // 대기 중인 메시지 처리 (새 링크로 전송)
    for (const pendingMessage of this.#pendingMessages) {
      const result = this.routeMessage(pendingMessage, updatedLinks);

      if (result.routed) {
        // 라우팅 성공한 메시지는 활성 메시지에 추가
        updatedMessages.set(result.message.id(), result.message);
      } else {
        // 라우팅 실패한 메시지는 다음 틱까지 대기
        newPendingMessages.push(pendingMessage);
      }
    }

    return this.clone({
      nodes: updatedNodes,
      links: updatedLinks,
      messages: updatedMessages,
      pendingMessages: newPendingMessages,
    });
  }

  /**
   * 토폴로지를 초기 상태로 리셋
   */
  public reset(): NetworkTopology {
    const resetNodes = new Map<string, Node>();
    for (const [id, node] of this.#nodes.entries()) {
      resetNodes.set(id, node.reset());
    }

    const resetLinks = new Map<string, NetworkLink>();
    for (const [id, link] of this.#links.entries()) {
      resetLinks.set(id, link.reset());
    }

    return this.clone({
      nodes: resetNodes,
      links: resetLinks,
      messages: new Map(),
      pendingMessages: [],
    });
  }

  /**
   * 토폴로지의 현재 상태를 발행 가능한 형태로 반환
   */
  public state(): PublishableState {
    const nodeStates = Array.from(this.#nodes.values()).map((node) =>
      node.state()
    );
    const linkStates = Array.from(this.#links.values()).map((link) =>
      link.state()
    );

    return {
      id: this.#id.toString(),
      role: term.Role.Topology,
      nodeCount: this.#nodes.size,
      linkCount: this.#links.size,
      messageCount: this.#messages.size,
      pendingMessageCount: this.#pendingMessages.length,
      nodes: nodeStates,
      links: linkStates,
    };
  }

  /**
   * 노드 추가
   */
  public addNode(node: Node): NetworkTopology {
    const newNodes = new Map(this.#nodes);
    newNodes.set(node.id(), node);

    return this.clone({ nodes: newNodes });
  }

  /**
   * 링크 추가
   */
  public addLink(link: NetworkLink): NetworkTopology {
    const newLinks = new Map(this.#links);
    newLinks.set(link.id(), link);

    return this.clone({ links: newLinks });
  }

  /**
   * 메시지 전송 요청
   * 출발지에서 목적지로 메시지 전송 시작
   */
  public sendMessage(message: Message): NetworkTopology {
    // 이미 전송 중이거나 완료된 메시지는 무시
    if (!message.isCreated()) {
      return this;
    }

    // 출발지와 목적지 노드가 있는지 확인
    if (
      !this.#nodes.has(message.srcId()) ||
      !this.#nodes.has(message.dstId())
    ) {
      return this;
    }

    // 메시지를 대기 목록에 추가
    const newPendingMessages = [...this.#pendingMessages, message];

    return this.clone({ pendingMessages: newPendingMessages });
  }

  /**
   * 출발지에서 목적지로 직접 연결된 링크 찾기
   */
  public findDirectLink(
    sourceId: string,
    targetId: string
  ): NetworkLink | null {
    for (const link of this.#links.values()) {
      if (link.srcId() === sourceId && link.dstId() === targetId) {
        return link;
      }
    }
    return null;
  }

  /**
   * 메시지를 적절한 링크로 라우팅
   * @returns 라우팅 결과 객체 {routed: boolean, message: Message}
   */
  private routeMessage(
    message: Message,
    links: Map<string, NetworkLink>
  ): { routed: boolean; message: Message } {
    // 메시지가 이미 전송 중이면 그대로 반환
    if (!message.isCreated()) {
      return { routed: false, message };
    }

    // 링크 찾기 - 현재는 직접 연결만 지원
    const link = this.findDirectLink(message.srcId(), message.dstId());

    if (!link) {
      // 링크가 없으면 실패 (더 복잡한 라우팅 알고리즘은 구현하지 않음)
      return { routed: false, message };
    }

    // 링크를 통해 메시지 전송 시작
    try {
      const updatedLink = link.transmit(message);

      // 링크 맵 업데이트
      links.set(link.id(), updatedLink);

      // 링크에서 활성화된 메시지 가져옴
      const activeMessages = updatedLink.activeMessages();
      const routedMessage = activeMessages.find(
        (msg) => msg.id() === message.id()
      );

      if (routedMessage) {
        return { routed: true, message: routedMessage };
      }
    } catch (e) {
      // 전송 실패 처리
      if (e instanceof error.InvalidMessageStatusError) {
        console.error("Message transmission failed:", e.message);
      }
    }

    return { routed: false, message };
  }

  // 접근 메서드들
  public id(): string {
    return this.#id.toString();
  }

  public getNode(id: string): Node | null {
    return this.#nodes.get(id) || null;
  }

  public getLink(id: string): NetworkLink | null {
    return this.#links.get(id) || null;
  }

  public nodes(): Node[] {
    return Array.from(this.#nodes.values());
  }

  public links(): NetworkLink[] {
    return Array.from(this.#links.values());
  }

  public nodeCount(): number {
    return this.#nodes.size;
  }

  public linkCount(): number {
    return this.#links.size;
  }

  public messageCount(): number {
    return this.#messages.size;
  }

  public pendingMessageCount(): number {
    return this.#pendingMessages.length;
  }
}
