import { describe, expect, it } from "vitest";
import { error } from "~/engine";
import { Message, NetworkLink } from "~/engine/core/network";
import { Router } from "~/engine/router";

describe("Router", () => {
  describe("config", () => {
    it("should create a Router instance with the provided links", () => {
      const links: [string, string][] = [
        ["node1", "node2"],
        ["node2", "node3"],
        ["node3", "node4"],
      ];
      const router = Router.config(links);

      expect(router.links).toEqual(
        new Map([
          ["node1-node2", NetworkLink.connect("node1", "node2")],
          ["node2-node3", NetworkLink.connect("node2", "node3")],
          ["node3-node4", NetworkLink.connect("node3", "node4")],
        ])
      );
    });
  });

  describe("route", () => {
    it("should create a Router instance with the provided links", () => {
      const links: [string, string][] = [["node1", "node2"]];
      const router = Router.config(links);
      const message = Message.request("node1", "node2", 40);

      router.route(message);

      expect(router.links).toEqual(
        new Map([["node1-node2", NetworkLink.connect("node1", "node2")]])
      );
    });

    it("should throw an error if no link is found for the message", () => {
      const links: [string, string][] = [
        ["node1", "node2"],
        ["node2", "node3"],
      ];
      const router = Router.config(links);
      const message = Message.request("node3", "node4", 40);

      expect(() => router.route(message)).toThrowError(
        new error.NotFoundError("No link found for node3 to node4")
      );
    });
  });
});
