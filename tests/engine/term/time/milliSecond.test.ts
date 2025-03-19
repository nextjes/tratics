import { describe, it, expect } from "vitest";
import { MilliSecond } from "~/engine/term/time";

describe("MilliSecond.toSeconds", () => {
  it.concurrent.each([
    [new MilliSecond(1), 0.001],
    [new MilliSecond(2), 0.002],
    [new MilliSecond(3), 0.003],
    [new MilliSecond(4), 0.004],
    [new MilliSecond(5), 0.005],
  ])("converts %ims to %is", (milliSeconds: MilliSecond, expected: number) => {
    expect(milliSeconds.toSeconds()).toEqual(expected);
  });
});
