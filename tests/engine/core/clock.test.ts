import { MilliSecond } from "~/engine/term";
import { Clock } from "~/engine/core/updatable";
import { describe, expect, it } from "vitest";

describe("Clock", () => {
  describe("initialization", () => {
    it("should start with zero time", () => {
      const clock = Clock.init();
      expect(clock.currentTime().valueOf()).toBe(0);
    });
  });

  describe("time management", () => {
    it("should handle time increments as immutable operations", () => {
      const initialClock = Clock.init();

      const clockAfter100 = initialClock.after(new MilliSecond(100));
      const clockAfter150 = clockAfter100.after(new MilliSecond(50));

      expect(clockAfter100.currentTime().valueOf()).toBe(100);
      expect(clockAfter150.currentTime().valueOf()).toBe(150);
    });

    it.concurrent.each([
      [1.0, 100, 100],
      [2.0, 100, 200],
      [0.5, 100, 50],
    ])(
      "applies time scale %f to elapsed time %i ms resulting in %i ms",
      (scale, elapsed, expected) => {
        const clock = Clock.init();
        const scaledClock = clock.setTimeScale(scale);

        const resultClock = scaledClock.after(new MilliSecond(elapsed));

        expect(resultClock.currentTime().valueOf()).toBe(expected);
      }
    );

    it("should reset time back to zero", () => {
      const clock = Clock.init();
      const advancedClock = clock.after(new MilliSecond(500));

      const resetClock = advancedClock.reset();

      expect(resetClock.currentTime().valueOf()).toBe(0);
    });
  });

  describe("real time tracking", () => {
    it("should measure actual elapsed time", async () => {
      // Arrange
      const clock = Clock.init();

      // Act
      await new Promise<void>((resolve) => setTimeout(resolve, 50));
      const elapsedReal = clock.elapsedRealTime();

      // Assert
      expect(elapsedReal.valueOf()).toBeGreaterThan(0);
    });
  });

  describe("validation", () => {
    it.concurrent.each([[0], [-1]])(
      "should throw error when setting invalid time scale: %i",
      (invalidScale) => {
        const clock = Clock.init();

        expect(() => clock.setTimeScale(invalidScale)).toThrow();
      }
    );
  });

  describe("state publishing", () => {
    it("should return current state with time and scale information", () => {
      const clock = Clock.init();
      const scaledClock = clock.setTimeScale(1.5);
      const advancedClock = scaledClock.after(new MilliSecond(200));

      const state = advancedClock.state();

      expect(state.role).toBe("clock");
      expect(state.currentTime).toBe(300);
      expect(state.timeScale).toBe(1.5);
    });
  });
});
