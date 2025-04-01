import { describe, expect, it } from "vitest";
import { NetworkTopology } from "~/engine/core/topology";
import { Node } from "~/engine/core/updatable";
import { NetworkLink, Message } from "~/engine/core/network";
import { MilliSecond } from "~/engine/term";

describe("NetworkTopology", () => {
  describe("init", () => {
    it("should create empty topology", () => {
      const topology = NetworkTopology.init();

      expect(topology.nodeCount()).toBe(0);
      expect(topology.linkCount()).toBe(0);
      expect(topology.messageCount()).toBe(0);
      expect(topology.nodes()).toEqual([]);
      expect(topology.links()).toEqual([]);
    });
  });

  describe("addNode", () => {
    it("should add node and return new instance", () => {
      const topology = NetworkTopology.init();
      const node = Node.boot(2);

      const updated = topology.addNode(node);

      expect(updated.nodeCount()).toBe(1);
      expect(updated.getNode(node.id())).toBeTruthy();
    });
  });

  describe("addLink", () => {
    it("should add link and return new instance", () => {
      const topology = NetworkTopology.init();
      const link = NetworkLink.connect("node-1", "node-2");

      const updated = topology.addLink(link);

      expect(updated.linkCount()).toBe(1);
      expect(updated.getLink(link.id())).toBeTruthy();
    });
  });

  describe("findDirectLink", () => {
    it("should find direct link between source and target", () => {
      const node1 = Node.boot(2);
      const node2 = Node.boot(2);
      const link = NetworkLink.connect(node1.id(), node2.id());

      let topology = NetworkTopology.init();
      topology = topology.addNode(node1).addNode(node2).addLink(link);

      const foundLink = topology.findDirectLink(node1.id(), node2.id());

      expect(foundLink).toBeTruthy();
      expect(foundLink?.srcId()).toBe(node1.id());
      expect(foundLink?.dstId()).toBe(node2.id());
    });
  });

  describe("sendMessage", () => {
    it("should queue message for sending", () => {
      const node1 = Node.boot(2);
      const node2 = Node.boot(2);
      const message = Message.written(node1.id(), node2.id(), 1000);

      let topology = NetworkTopology.init();
      topology = topology.addNode(node1).addNode(node2);

      const updated = topology.sendMessage(message);

      expect(updated.pendingMessageCount()).toBe(1);
    });
  });

  describe("after", () => {
    it("should update nodes, links and messages after time delta", () => {
      // 테스트 준비: 노드, 링크, 메시지 생성
      const node1 = Node.boot(2);
      const node2 = Node.boot(2);
      const link = NetworkLink.connect(node1.id(), node2.id());

      let topology = NetworkTopology.init();
      topology = topology.addNode(node1).addNode(node2).addLink(link);

      // 메시지 생성 및 전송
      const message = Message.written(node1.id(), node2.id(), 150000); // 150KB

      topology = topology.sendMessage(message);

      // 첫 번째 틱: 메시지가 라우팅됨
      const tick1 = topology.after(new MilliSecond(10));

      // 메시지가 전송되었을 테니 대기열은 비어있어야 함
      expect(tick1.pendingMessageCount()).toBe(0);

      // 두 번째 틱: 메시지 전송 완료 (150KB는 100ms 이내에 전송 가능)
      const tick2 = tick1.after(new MilliSecond(100));

      // 전송 완료된 메시지는 더 이상 활성 메시지가 아님
      expect(tick2.messageCount()).toBe(0);
    });
  });

  describe("reset", () => {
    it("should reset topology to initial state", () => {
      // 테스트 준비
      const node = Node.boot(2);
      const node2 = Node.boot(2);
      const link = NetworkLink.connect(node.id(), node2.id());

      let topology = NetworkTopology.init();
      topology = topology.addNode(node).addNode(node2).addLink(link);

      // 메시지 추가 및 시간 진행
      const message = Message.written(node.id(), node2.id(), 1000);

      topology = topology.sendMessage(message).after(new MilliSecond(10));

      // 리셋
      const reset = topology.reset();

      // 노드와 링크는 유지되지만 메시지는 제거됨
      expect(reset.nodeCount()).toBe(2);
      expect(reset.linkCount()).toBe(1);
      expect(reset.messageCount()).toBe(0);
      expect(reset.pendingMessageCount()).toBe(0);
    });
  });
});
