import { describe, it, expect } from "vitest";
import { SimulationClock } from "~/engine/updatable";
import { type MilliSecond } from "~/engine/term";

describe("SimulationClock.init", () => {
  it("initializes the clock with 0 seconds", () => {
    const clock = SimulationClock.init();

    expect(clock.currentTime()).toEqual(0);
  });
});

describe("SimulationClock.after", () => {
  it.concurrent.each([[SimulationClock.init(), 1000, 1000]])(
    "advances the current time by %s milli seconds",
    (
      clock: SimulationClock,
      millSecondsToAdvance: MilliSecond,
      expectedSeconds: MilliSecond
    ) => {
      const advanced = clock.after(millSecondsToAdvance);

      expect(advanced.currentTime()).toEqual(expectedSeconds);
    }
  );
});

describe("SimulationClock.reset", () => {
  it.concurrent.each([
    [SimulationClock.init(), 0],
    [SimulationClock.init().after(10000), 0],
  ])(
    "resets the current time to 0",
    (clock: SimulationClock, expectedTime: MilliSecond) => {
      const reset = clock.reset();

      expect(reset.currentTime()).toEqual(expectedTime);
    }
  );
});

describe("SimulationClock.currentTime", () => {
  it.concurrent.each([
    [SimulationClock.init(), 0],
    [SimulationClock.init().after(10000), 10000],
  ])(
    "returns the current time",
    (clock: SimulationClock, expectedTime: MilliSecond) => {
      expect(clock.currentTime()).toEqual(expectedTime);
    }
  );
});
