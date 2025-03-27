import { describe, expect, it } from "vitest";
import { error } from "~/engine";
import { Message, MessageStatus } from "~/engine/core/network";

describe("Message", () => {
  describe("written", () => {
    it("Should create message with source and destination", () => {
      const message = Message.written("src", "dst", 1000);
      expect(message.srcId()).toBe("src");
      expect(message.dstId()).toBe("dst");
    });
  });

  describe("startTransit", () => {
    it("Should set message status to InTransit", () => {
      const message = Message.written("src", "dst", 1000);
      const transit = message.startTransit();
      expect(transit.isInTransit()).toBe(true);
    });

    it("Should throw error if message is already in transit", () => {
      const message = Message.written("src", "dst", 1000).startTransit();
      expect(() => message.startTransit()).toThrow(
        new error.InvalidMessageStatusError(
          "only created message can be started transit"
        )
      );
    });

    it("Should throw error if message is already delivered", () => {
      const message = Message.written("src", "dst", 1000)
        .startTransit()
        .transmit(1000);
      expect(() => message.startTransit()).toThrow(
        new error.InvalidMessageStatusError(
          "only created message can be started transit"
        )
      );
    });
  });

  describe("transmit", () => {
    it.concurrent.each([1000, 2000, 3000])(
      "Should set message status to delivered",
      (transmittedSize: number) => {
        const message = Message.written("src", "dst", 1000).startTransit();
        const arrived = message.transmit(transmittedSize);
        expect(arrived.isDelivered()).toBe(true);
      }
    );

    it("Should throw error if message is not in transit", () => {
      const message = Message.written("src", "dst", 1000);
      expect(() => message.transmit(50)).toThrow(
        new error.InvalidMessageStatusError(
          "only in-transit message can be arrived"
        )
      );
    });

    it("Should throw error if message is already delivered", () => {
      const message = Message.written("src", "dst", 1000)
        .startTransit()
        .transmit(1000);
      expect(() => message.transmit(10)).toThrow(
        new error.InvalidMessageStatusError(
          "only in-transit message can be arrived"
        )
      );
    });
  });
});
