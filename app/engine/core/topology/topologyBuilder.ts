import { Node } from "../updatable/node";
import { NetworkLink } from "../network/link";
import { NetworkTopology } from "./networkTopology";
import { Position } from "~/engine/term";

/**
 * 토폴로지 생성을 돕는 빌더 클래스
 * 복잡한 네트워크 구조를 쉽게 생성할 수 있도록 함
 */
export class TopologyBuilder {
  private topology: NetworkTopology;
  private nodePositions: Map<string, Position>;

  constructor() {
    this.topology = NetworkTopology.init();
    this.nodePositions = new Map();
  }

  /**
   * 노드 추가
   */
  public addNode(node: Node, position?: Position): TopologyBuilder {
    this.topology = this.topology.addNode(node);

    if (position) {
      this.nodePositions.set(node.id(), position);
    }

    return this;
  }

  /**
   * 링크 추가
   */
  public addLink(link: NetworkLink): TopologyBuilder {
    this.topology = this.topology.addLink(link);
    return this;
  }

  /**
   * 두 노드를 연결하는 링크 생성 및 추가
   */
  public connectNodes(sourceId: string, targetId: string): TopologyBuilder {
    const link = NetworkLink.connect(sourceId, targetId);
    this.topology = this.topology.addLink(link);
    return this;
  }

  /**
   * 네트워크 토폴로지 결과물 반환
   */
  public build(): NetworkTopology {
    return this.topology;
  }

  /**
   * 스타 토폴로지 생성 (중앙 노드와 여러 에지 노드)
   */
  public static createStarTopology(
    centerNode: Node,
    edgeNodes: Node[]
  ): NetworkTopology {
    const builder = new TopologyBuilder();

    // 중앙 노드 추가
    builder.addNode(centerNode, new Position(0, 0));

    // 에지 노드 추가 및 중앙과 연결
    const radius = 200;
    const angleStep = (2 * Math.PI) / edgeNodes.length;

    edgeNodes.forEach((node, index) => {
      const angle = index * angleStep;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);

      builder.addNode(node, new Position(x, y));

      // 양방향 연결
      builder.connectNodes(centerNode.id(), node.id());
      builder.connectNodes(node.id(), centerNode.id());
    });

    return builder.build();
  }

  /**
   * 링 토폴로지 생성 (각 노드가 양쪽 이웃 노드와 연결)
   */
  public static createRingTopology(nodes: Node[]): NetworkTopology {
    if (nodes.length < 3) {
      throw new Error("Ring topology requires at least 3 nodes");
    }

    const builder = new TopologyBuilder();

    // 노드 배치
    const radius = 200;
    const angleStep = (2 * Math.PI) / nodes.length;

    nodes.forEach((node, index) => {
      const angle = index * angleStep;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);

      builder.addNode(node, new Position(x, y));
    });

    // 링크 생성 (양방향)
    for (let i = 0; i < nodes.length; i++) {
      const nextIndex = (i + 1) % nodes.length;
      builder.connectNodes(nodes[i].id(), nodes[nextIndex].id());
      builder.connectNodes(nodes[nextIndex].id(), nodes[i].id());
    }

    return builder.build();
  }

  /**
   * 메시 토폴로지 생성 (완전 연결 또는 부분 연결)
   */
  public static createMeshTopology(
    nodes: Node[],
    fullyConnected: boolean = false
  ): NetworkTopology {
    const builder = new TopologyBuilder();

    // 노드 배치 (원형으로)
    const radius = 200;
    const angleStep = (2 * Math.PI) / nodes.length;

    nodes.forEach((node, index) => {
      const angle = index * angleStep;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);

      builder.addNode(node, new Position(x, y));
    });

    // 링크 생성
    if (fullyConnected) {
      // 완전 메시: 모든 노드가 서로 연결
      for (let i = 0; i < nodes.length; i++) {
        for (let j = 0; j < nodes.length; j++) {
          if (i !== j) {
            builder.connectNodes(nodes[i].id(), nodes[j].id());
          }
        }
      }
    } else {
      // 부분 메시: 각 노드는 최소 2개의 다른 노드와 연결
      for (let i = 0; i < nodes.length; i++) {
        const next1 = (i + 1) % nodes.length;
        const next2 = (i + 2) % nodes.length;

        builder.connectNodes(nodes[i].id(), nodes[next1].id());
        builder.connectNodes(nodes[i].id(), nodes[next2].id());
      }
    }

    return builder.build();
  }
}
