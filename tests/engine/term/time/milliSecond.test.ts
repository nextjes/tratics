import { describe, expect, it } from "vitest";
import { MilliSecond } from "~/engine/term";
import * as error from "~/engine/error";

describe("MilliSecond constructor", () => {
  it("should not be negative", () => {
    expect(() => new MilliSecond(-10)).toThrow(
      new error.InvalidTimeError("Time cannot be negative")
    );
  });
});

describe("MilliSecond.add", () => {
  it.concurrent.each([
    [new MilliSecond(100), new MilliSecond(50), 150],
    [new MilliSecond(0), new MilliSecond(0), 0],
  ])(
    "should return the sum of time and the given milli seconds",
    (time: MilliSecond, other: MilliSecond, expected: number) => {
      const added = time.add(other);

      expect(added.valueOf()).toBe(expected);
    }
  );
});

describe("MilliSecond.subtract", () => {
  it.concurrent.each([
    [new MilliSecond(100), new MilliSecond(50), 50],
    [new MilliSecond(0), new MilliSecond(0), 0],
    [new MilliSecond(100), new MilliSecond(100), 0],
  ])(
    "should return the difference of time and the given milli seconds",
    (time: MilliSecond, other: MilliSecond, expected: number) => {
      const subtracted = time.subtract(other);

      expect(subtracted.valueOf()).toBe(expected);
    }
  );
});

describe("MilliSecond comparing methods", () => {
  it("should correctly identify when a time is greater than another", () => {
    const time1 = new MilliSecond(100);
    const time2 = new MilliSecond(50);

    expect(time1.greaterThan(time2)).toBe(true);
    expect(time2.greaterThan(time1)).toBe(false);
  });

  it("should correctly identify when a time is less than another", () => {
    const time1 = new MilliSecond(100);
    const time2 = new MilliSecond(50);

    expect(time2.lessThan(time1)).toBe(true);
    expect(time1.lessThan(time2)).toBe(false);
  });

  it("should correctly identify when two times are equal", () => {
    const time1 = new MilliSecond(100);
    const time2 = new MilliSecond(100);

    expect(time1.equals(time2)).toBe(true);
    expect(time1.equals(new MilliSecond(50))).toBe(false);
  });
});
