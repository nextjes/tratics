import { expect, it, describe } from "vitest";
import { MilliSecond, Second } from "~/engine/term";
import { Node } from "~/engine/updatable";

describe("Node.init", () => {
  it("initialize node instance with 0 elasped timea and idle status", () => {
    const node = Node.init(new Second(3));

    expect(node.status()).toEqual("idle");
    expect(node.elapsedTime()).toEqual(new MilliSecond(0));
  });
});

describe("Node.update", () => {
  it.concurrent.each([
    [Node.init(new Second(3)), new MilliSecond(1), new MilliSecond(1)],
    [Node.init(new Second(3)), new MilliSecond(3), new MilliSecond(3)],
    [Node.init(new Second(3)), new MilliSecond(5), new MilliSecond(3)],
  ])(
    "updates the elapsed time by %s",
    (node: Node, deltaTime: MilliSecond, expectedElapsedTime: MilliSecond) => {
      const updatedNode = node.update(deltaTime);

      expect(updatedNode.elapsedTime()).toEqual(expectedElapsedTime);
    }
  );
});

describe("Node.reset", () => {
  it.concurrent.each([
    [Node.init(new Second(3)), new MilliSecond(0)],
    [Node.init(new Second(3)).update(new MilliSecond(5)), new MilliSecond(0)],
  ])(
    "resets the elapsed time to 0",
    (node: Node, expectedElapsedTime: MilliSecond) => {
      const resetNode = node.reset();

      expect(resetNode.elapsedTime()).toEqual(expectedElapsedTime);
    }
  );
});
