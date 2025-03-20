import { describe, it, expect } from "vitest";
import { Second } from "~/engine/term/time";

describe("Second.toMilliSeconds", () => {
  it.concurrent.each([
    [new Second(1), 1000],
    [new Second(2), 2000],
    [new Second(3), 3000],
    [new Second(4), 4000],
    [new Second(5), 5000],
  ])("converts %is  to %ims", (seconds: Second, expected: number) => {
    expect(seconds.toMilliSeconds()).toEqual(expected);
  });
});
