import { describe, expect, it } from "vitest";
import { Dashboard } from "~/engine/dashboard";
import { Second } from "~/engine/term";

describe("Dashboard.draft", () => {
  it("drafts a dashboard with 0 seconds elapsed time", () => {
    const dashboard = Dashboard.draft();

    expect(dashboard.elapsedTime).toEqual(new Second(0));
  });
});
