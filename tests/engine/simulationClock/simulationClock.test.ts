import { describe, it, expect } from "vitest";
import { SimulationClock } from "~/engine/SimulationClock";
import { MilliSecond, Second } from "~/engine/term";

describe("SimulationClock.advance", () => {
  it.concurrent.each([
    [
      SimulationClock.init(new Date(2025, 3, 18, 10, 0, 0).getTime()),
      new MilliSecond(1000),
      new Second(1),
    ],
  ])(
    "advances the current time by %s seconds",
    (
      clock: SimulationClock,
      millSecondsToAdvance: MilliSecond,
      expectedSeconds: Second
    ) => {
      const advanced = clock.advanceBy(millSecondsToAdvance);

      expect(advanced.currentTime()).toEqual(expectedSeconds);
    }
  );
});
