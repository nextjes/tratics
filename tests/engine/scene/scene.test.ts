import { describe, expect, it } from "vitest";
import { Scene } from "~/engine/scene";
import { Second } from "~/engine/term";

describe("Scene.draft", () => {
  it("drafts a dashboard with 0 seconds elapsed time", () => {
    const dashboard = Scene.draft();

    expect(dashboard.elapsedTime).toEqual(new Second(0));
  });
});
