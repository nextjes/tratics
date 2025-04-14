import { describe, expect, it } from "vitest";
import { Message } from "~/engine/core/network";
import { Server } from "~/engine/core/updatable";

describe("Server", () => {
  describe("receiveRequest", () => {
    it("should return a server with task", () => {
      const server = Server.boot(2);
      const request = Message.request("client", "server", 100);

      const received = server.receiveRequest(request);

      expect(received.queueLength()).toBe(1);
    });
  });
});
