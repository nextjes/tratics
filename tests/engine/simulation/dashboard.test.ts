import { describe, expect, it } from "vitest";
import { Simulation } from "~/engine/simulation";
import { Second } from "~/engine/term";

describe("Simulation.draft", () => {
  it("drafts a dashboard with 0 seconds elapsed time", () => {
    const dashboard = Simulation.draft();

    expect(dashboard.elapsedTime).toEqual(new Second(0));
  });
});
