import { beforeEach, describe, expect, it } from "vitest";
import { Identifier, type IdGenerator } from "~/engine/term";

describe("Identifier", () => {
  beforeEach(() => {
    Identifier.resetGenerator();
  });

  it("creating and incrementing identifiers", () => {
    const id1 = new Identifier("node");
    const id2 = new Identifier("node");
    const id3 = new Identifier("link");

    expect(id1.toString()).toBe("node-1");
    expect(id2.toString()).toBe("node-2");
    expect(id3.toString()).toBe("link-1");
  });

  it("comparing identifiers", () => {
    const id1 = new Identifier("node");
    const id2 = new Identifier("node");
    const id1Copy = new Identifier("node");

    expect(id1.equals(id1)).toBe(true);
    expect(id1.equals(id2)).toBe(false);
    expect(id1.equals(id1Copy)).toBe(false);
  });

  it("replacing the ID generator", () => {
    class itIdGenerator implements IdGenerator {
      #prefix = "it";
      generate(prefix: string): string {
        return `${this.#prefix}-${prefix}`;
      }
      reset(): void {}
    }

    const id1 = new Identifier("node");
    expect(id1.toString()).toBe("node-1");

    Identifier.setGenerator(new itIdGenerator());

    const id2 = new Identifier("node");
    expect(id2.toString()).toBe("it-node");

    Identifier.resetGenerator();
    const id3 = new Identifier("node");
    expect(id3.toString()).toBe("node-1");
  });
});
