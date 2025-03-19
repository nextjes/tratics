import { describe, it, expect } from "vitest";
import { SimulationClock } from "../../../app/engine/SimulationClock";

describe("SimulationClock.advance", () => {
  it("advances the current time", () => {
    const startDate = new Date(2025, 3, 18, 10, 0, 0);
    const advancedDate = new Date(2025, 3, 18, 10, 0, 1);
    let clock = SimulationClock.init(startDate.getTime());
    const advancedTime = advancedDate.getTime();

    const advanced = clock.advance(advancedTime);

    expect(advanced.currentTime()).toEqual(1);
  });
});
