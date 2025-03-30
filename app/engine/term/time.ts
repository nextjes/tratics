import * as error from "~/engine/error";

export class MilliSecond {
  #value: number;

  constructor(value: number = 0) {
    if (value < 0) {
      throw new error.InvalidTimeError("Time cannot be negative");
    }
    this.#value = value;
  }

  public valueOf(): number {
    return this.#value;
  }

  public add(ms: MilliSecond): MilliSecond {
    return new MilliSecond(this.#value + ms.valueOf());
  }

  public subtract(ms: MilliSecond): MilliSecond {
    const result = this.#value - ms.valueOf();
    return new MilliSecond(result);
  }

  public lessThan(ms: MilliSecond): boolean {
    return this.#value < ms.valueOf();
  }

  public greaterThan(ms: MilliSecond): boolean {
    return this.#value > ms.valueOf();
  }

  public equals(ms: MilliSecond): boolean {
    return this.#value === ms.valueOf();
  }

  public toString(): string {
    return `${this.#value}ms`;
  }
}
