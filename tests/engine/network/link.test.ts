import { describe, expect, it } from "vitest";
import { error } from "~/engine";
import { Message, NetworkLink } from "~/engine/core/network";
import { MilliSecond } from "~/engine/term";

describe("NetworkLink", () => {
  describe("connect", () => {
    it("Should create new network link", () => {
      const networkLink = NetworkLink.connect("src", "dst");
      expect(networkLink.srcId()).toBe("src");
      expect(networkLink.dstId()).toBe("dst");
    });
  });

  describe("transmit", () => {
    it("Should add message to in-transit list", () => {
      const networkLink = NetworkLink.connect("src", "dst");
      const message = Message.written("src", "dst", 1000);
      const updated = networkLink.transmit(message);
      expect(updated.activeMessages()).toHaveLength(1);
      expect(updated.activeMessages()[0].isInTransit()).toBe(true);
    });

    it("Should throw error if message is already in transit", () => {
      const networkLink = NetworkLink.connect("src", "dst");
      const message = Message.written("src", "dst", 1000).startTransit();
      expect(() => networkLink.transmit(message)).toThrow(
        new error.InvalidMessageStatusError(
          "only created message can be started transit"
        )
      );
    });
  });

  describe("after", () => {
    it("should return a new instance when no messages are in transit", () => {
      const link = NetworkLink.connect("node-1", "node-2");

      const updated = link.after(new MilliSecond(100));

      expect(updated.activeMessages()).toHaveLength(0);
    });

    it("should progress single message transmission over time", () => {
      const message = Message.written("node-1", "node-2", 150000); // 150KB
      const link = NetworkLink.connect("node-1", "node-2");

      const linkWithMessage = link.transmit(message);
      const updated = linkWithMessage.after(new MilliSecond(100));

      expect(updated.activeMessages()).toHaveLength(0);
    });

    it("should distribute bandwidth proportionally between multiple messages", () => {
      const message1 = Message.written("node-1", "node-2", 200000); // 200KB
      const message2 = Message.written("node-1", "node-2", 100000); // 100KB
      const link = NetworkLink.connect("node-1", "node-2");

      const linkWithMessages = link.transmit(message1).transmit(message2);

      // Act - 50ms 경과 (대역폭 3MB/s에서 약 150KB 전송 가능)
      // 메시지1: 200KB의 2/3 비율 = 100KB 전송 (50% 진행)
      // 메시지2: 100KB의 1/3 비율 = 50KB 전송 (50% 진행)
      const updated = linkWithMessages.after(new MilliSecond(50));

      expect(updated.activeMessages()).toHaveLength(2);

      // 두 메시지의 진행률이 같아야 함 (크기 비례 분배로 인해)
      // 하지만 실제 전송된 바이트 수는 크기에 비례
      expect(updated.activeMessages()[0].transmittedSize()).toBe(100000);
      expect(updated.activeMessages()[1].transmittedSize()).toBe(50000);
    });

    it("should allocate bandwidth proportionally between messages", () => {
      const smallMessage = Message.written("node-1", "node-2", 50000); // 50KB
      const largeMessage = Message.written("node-1", "node-2", 500000); // 500KB
      const link = NetworkLink.connect("node-1", "node-2");

      const linkWithMessages = link
        .transmit(smallMessage)
        .transmit(largeMessage);

      // Act - 100ms 경과 (대역폭 3MB/s에서 약 300KB 전송 가능)
      // 총 550KB 중 비율에 따라 분배:
      // 작은 메시지(50KB): ~9.1% → ~27.3KB 전송
      // 큰 메시지(500KB): ~90.9% → ~272.7KB 전송
      const updated = linkWithMessages.after(new MilliSecond(100));

      expect(updated.activeMessages()).toHaveLength(2); // 두 메시지 모두 아직 전송 중
      expect(updated.activeMessages()[0].transmittedSize()).toBeCloseTo(
        27300,
        -2
      );
      expect(updated.activeMessages()[1].transmittedSize()).toBeCloseTo(
        272700,
        -2
      );
    });

    it("should handle multiple timesteps correctly", () => {
      const message = Message.written("node-1", "node-2", 900000); // 900KB
      const link = NetworkLink.connect("node-1", "node-2");

      const linkWithMessage = link.transmit(message);

      // Act - 단계적으로 시간 진행
      // 1단계: 100ms (300KB 전송, 600KB 남음)
      const step1 = linkWithMessage.after(new MilliSecond(100));
      expect(step1.activeMessages()).toHaveLength(1);

      // 2단계: 추가 100ms (300KB 더 전송, 300KB 남음)
      const step2 = step1.after(new MilliSecond(100));
      expect(step2.activeMessages()).toHaveLength(1);

      // 3단계: 추가 100ms (300KB 더 전송, 완료)
      const step3 = step2.after(new MilliSecond(100));

      expect(step3.activeMessages()).toHaveLength(0); // 전송 완료
    });
  });
});
