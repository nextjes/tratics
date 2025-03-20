import { describe, expect, it } from "vitest";
import { Scene } from "~/engine/scene";
import { Second } from "~/engine/term";

describe("Scene.first", () => {
  it("returns a first scene with 0 seconds elapsed time", () => {
    const dashboard = Scene.first();

    expect(dashboard.elapsedTime).toEqual(new Second(0));
  });
});
