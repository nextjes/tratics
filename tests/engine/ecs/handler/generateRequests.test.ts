import { describe, expect, it } from "vitest";
import { generateRequests } from "~/engine/ecs/handler";

describe("generateRequests", () => {
  describe("with alwaysGenAlgorythm and 2 clients", () => {
    const alwaysGenAlgorythm = () => true;
    const clientIds = ["client1", "client2"];
    const entryPointId = "server1";
    const fakeRequestIdFactory = () => "reqId";
    const fixedSizeFactory = () => 100;

    it("should return CreateRequest commands", () => {
      const commands = generateRequests({
        algorithm: alwaysGenAlgorythm,
        clientIds: clientIds,
        entryPointId: entryPointId,
        requestIdFactory: fakeRequestIdFactory,
        sizeFactory: fixedSizeFactory,
      });

      expect(commands).toEqual([
        {
          type: "create",
          name: "CreateRequest",
          requestId: "reqId",
          srcId: "client1",
          dstId: "server1",
          size: 100,
        },
        {
          type: "create",
          name: "CreateRequest",
          requestId: "reqId",
          srcId: "client2",
          dstId: "server1",
          size: 100,
        },
      ]);
    });
  });

  describe("with neverGenAlgorythm and 2 clients", () => {
    const neverGenAlgorythm = () => false;
    const clientIds = ["client1", "client2"];
    const entryPointId = "server1";
    const fakeRequestIdFactory = () => "reqId";
    const fixedSizeFactory = () => 100;

    it("should return empty array", () => {
      const commands = generateRequests({
        algorithm: neverGenAlgorythm,
        clientIds: clientIds,
        entryPointId: entryPointId,
        requestIdFactory: fakeRequestIdFactory,
        sizeFactory: fixedSizeFactory,
      });

      expect(commands).toEqual([]);
    });
  });
});
