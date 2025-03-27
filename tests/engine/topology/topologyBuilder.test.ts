import { describe, expect, it } from "vitest";
import { TopologyBuilder } from "~/engine/core/topology";
import { Node } from "~/engine/core/updatable";
import { Position } from "~/engine/term";

describe("TopologyBuilder", () => {
  describe("addNode", () => {
    it("should build topology with manually added components", () => {
      const builder = new TopologyBuilder();
      const node1 = Node.boot(2);
      const node2 = Node.boot(2);

      builder
        .addNode(node1, new Position(0, 0))
        .addNode(node2, new Position(100, 100))
        .connectNodes(node1.id(), node2.id());

      const topology = builder.build();

      expect(topology.nodeCount()).toBe(2);
      expect(topology.linkCount()).toBe(1);
      expect(topology.getNode(node1.id())).toBeTruthy();
      expect(topology.getNode(node2.id())).toBeTruthy();
    });
  });

  describe("createStarTopology", () => {
    it("should create star topology", () => {
      const centerNode = Node.boot(4);
      const edgeNodes = [
        Node.boot(2),
        Node.boot(2),
        Node.boot(2),
        Node.boot(2),
      ];

      const topology = TopologyBuilder.createStarTopology(
        centerNode,
        edgeNodes
      );

      // 중앙 노드 + 에지 노드
      expect(topology.nodeCount()).toBe(5);

      // 각 에지 노드에서 중앙 노드로, 중앙 노드에서 각 에지 노드로 연결 (양방향 링크)
      expect(topology.linkCount()).toBe(8);
    });
  });

  describe("createRingTopology", () => {
    it("should create ring topology", () => {
      const nodes = [Node.boot(2), Node.boot(2), Node.boot(2), Node.boot(2)];

      const topology = TopologyBuilder.createRingTopology(nodes);

      expect(topology.nodeCount()).toBe(4);

      // 각 노드는 이전/다음 노드와 양방향으로 연결, 총 8개 링크
      expect(topology.linkCount()).toBe(8);
    });

    it("should throw error when creating ring with too few nodes", () => {
      const nodes = [Node.boot(2), Node.boot(2)]; // 2개 노드로는 링 불가

      expect(() => {
        TopologyBuilder.createRingTopology(nodes);
      }).toThrow();
    });
  });

  describe("createMeshTopology", () => {
    it("should create fully connected mesh topology", () => {
      const nodes = [Node.boot(2), Node.boot(2), Node.boot(2), Node.boot(2)];

      const topology = TopologyBuilder.createMeshTopology(nodes, true);

      expect(topology.nodeCount()).toBe(4);

      // n*(n-1) 링크 = 4*3 = 12개 링크 (양방향)
      expect(topology.linkCount()).toBe(12);
    });

    it("should create partially connected mesh topology", () => {
      const nodes = [Node.boot(2), Node.boot(2), Node.boot(2), Node.boot(2)];

      const topology = TopologyBuilder.createMeshTopology(nodes, false);

      expect(topology.nodeCount()).toBe(4);

      // 각 노드마다 2개의 다른 노드와 연결, 총 8개 링크
      expect(topology.linkCount()).toBe(8);
    });
  });
});
