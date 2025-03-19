import { describe, it, expect } from "vitest";
import { Second } from "~/engine/term/time";

describe("Second.toMilliSeconds", () => {
  it.concurrent.each([
    [1, 1000],
    [2, 2000],
    [3, 3000],
    [4, 4000],
    [5, 5000],
  ])("converts %is  to %ims", (seconds, expected) => {
    const second = new Second(seconds);
    expect(second.toMilliSeconds()).toEqual(expected);
  });
});
