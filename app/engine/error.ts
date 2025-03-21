export class TraticsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TraticsError";
  }
}

export class TaskStateError extends TraticsError {
  constructor(message: string) {
    super(message);
    this.name = "TaskStateError";
  }
}
