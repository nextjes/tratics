import { describe, expect, it } from "vitest";
import { Position } from "~/engine/term";

describe("Position", () => {
  it("position creation and property access", () => {
    const pos = new Position(10, 20);

    expect(pos.x).toBe(10);
    expect(pos.y).toBe(20);
    expect(pos.toString()).toBe("(10, 20)");
  });

  it("distance calculation", () => {
    const pos1 = new Position(0, 0);
    const pos2 = new Position(3, 4);

    expect(pos1.distanceTo(pos2)).toBe(5);
  });
});
