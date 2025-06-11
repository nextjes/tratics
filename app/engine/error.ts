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

export class BusyCoreError extends TraticsError {
  constructor(message: string) {
    super(message);
    this.name = "BusyCoreError";
  }
}

export class NoTaskError extends TraticsError {
  constructor(message: string) {
    super(message);
    this.name = "NoTaskError";
  }
}

export class InvalidMessageStatusError extends TraticsError {
  constructor(message: string) {
    super(message);
    this.name = "InvalidMessageStatusError";
  }
}

export class NotFoundError extends TraticsError {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class InvalidSimulationStatusError extends TraticsError {
  constructor(message: string) {
    super(message);
    this.name = "InvalidSimulationStatusError";
  }
}