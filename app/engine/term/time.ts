// export class MilliSecond {
//   readonly #value: number;

//   constructor(value: number) {
//     this.#value = value;
//   }

//   valueOf(): number {
//     return this.#value;
//   }

//   toString(): string {
//     return this.#value.toString();
//   }

//   toSeconds(): number {
//     return this.#value / 1000;
//   }
// }
export type MilliSecond = number;

export class Second {
  readonly #value: number;

  constructor(value: number) {
    this.#value = value;
  }

  valueOf(): number {
    return this.#value;
  }

  toString(): string {
    return this.#value.toString();
  }

  toMilliSeconds(): number {
    return this.#value * 1000;
  }
}
