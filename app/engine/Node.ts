import { useMemoryState } from "~/store/memory";

export interface Updatable {
  estimatedProcessingDuration: number;

  update(deltaTime: number): void;
  reset(): void;
}

export class Node implements Updatable {
  estimatedProcessingDuration: number;
  private elapsedTime: number;
  private status: string;

  constructor(estimatedProcessingDuration: number) {
    this.estimatedProcessingDuration = estimatedProcessingDuration;
    this.elapsedTime = 0.0;
    this.status = "idle";
  }

  update(deltaTime: number): void {
    this.elapsedTime += deltaTime;
    console.log(`Node updated: value = ${this.elapsedTime.toFixed(4)}`);
    useMemoryState.getState().setNodeStatus(this.status);
  }

  reset(): void {
    this.elapsedTime = 0.0;
    this.status = "idle";
  }
}
