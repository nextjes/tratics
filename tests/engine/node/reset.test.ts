import { expect, test, describe } from "vitest";
import { Node } from "../../../app/engine/node";

describe("", () => {
  test("is reset", () => {
    let node = new Node(3);

    node.reset();

    expect(node).toEqual(new Node(3));
  });
});
