export class TraticsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TraticsError";
  }
}

export class InvalidTimeError extends TraticsError {
  constructor(message: string) {
    super(message);
    this.name = "InvalidTimeError";
  }
}
