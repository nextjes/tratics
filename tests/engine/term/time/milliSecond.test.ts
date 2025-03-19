import { describe, it, expect } from "vitest";
import { MilliSecond } from "~/engine/term/time";

describe("MilliSecond.toSeconds", () => {
  it.concurrent.each([
    [1, 0.001],
    [2, 0.002],
    [3, 0.003],
    [4, 0.004],
    [5, 0.005],
  ])("converts %ims to %is", (milliSeconds, expected) => {
    const milliSecond = new MilliSecond(milliSeconds);
    expect(milliSecond.toSeconds()).toEqual(expected);
  });
});
