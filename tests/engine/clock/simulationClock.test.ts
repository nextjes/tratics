import { describe, it, expect } from "vitest";
import { SimulationClock } from "~/engine/clock";
import { MilliSecond, Second } from "~/engine/term";

describe("SimulationClock.init", () => {
  it("initializes the clock with 0 seconds", () => {
    const clock = SimulationClock.init();

    expect(clock.currentTime()).toEqual(new Second(0));
  });
});

describe("SimulationClock.advanceBy", () => {
  it.concurrent.each([
    [SimulationClock.init(), new MilliSecond(1000), new Second(1)],
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

describe("SimulationClock.reset", () => {
  it.concurrent.each([
    [SimulationClock.init(), new Second(0)],
    [SimulationClock.init().advanceBy(new MilliSecond(10000)), new Second(0)],
  ])(
    "resets the current time to 0",
    (clock: SimulationClock, expectedTime: Second) => {
      const reset = clock.reset();

      expect(reset.currentTime()).toEqual(expectedTime);
    }
  );
});

describe("SimulationClock.currentTime", () => {
  it.concurrent.each([
    [SimulationClock.init(), new Second(0)],
    [SimulationClock.init().advanceBy(new MilliSecond(10000)), new Second(10)],
  ])(
    "returns the current time",
    (clock: SimulationClock, expectedTime: Second) => {
      expect(clock.currentTime()).toEqual(expectedTime);
    }
  );
});
