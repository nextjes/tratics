import { Scene } from "./scene";
import { Node, SimulationClock, type Temporal } from "./updatable";
import { useMemoryState } from "~/store/memory";
import * as term from "./term";

class SimulationEngine {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private tickInterval: number;
  private temporals: Temporal[];

  constructor(tickInterval: number, temporals: Temporal[]) {
    this.tickInterval = tickInterval;
    this.temporals = temporals;
  }

  start(): void {
    if (this.intervalId !== null) return;
    this.intervalId = setInterval(() => {
      const deltaTime = new term.MilliSecond(this.tickInterval);
      this.temporals = this.temporals.map((obj) => obj.after(deltaTime));
      new Scene(this.temporals).publish();
    }, this.tickInterval);
  }

  // pause() 함수: 시뮬레이션 업데이트 루프 중단
  pause(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("Simulation paused.");
    }
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.temporals = this.temporals.map((obj) => obj.reset());
      console.log("Simulation stopped.");
    }
  }
}

const tickInterval = 100; // 밀리초 단위로 100ms 간격
const clock = SimulationClock.init();
const node = Node.init(new term.Second(3));
const engine = new SimulationEngine(tickInterval, [clock, node]);

export function start() {
  engine.start();
  useMemoryState.getState().setIsRunning(true);
}

export function pause() {
  engine.pause();
  useMemoryState.getState().setIsRunning(false);
}

export function stop() {
  engine.stop();
  useMemoryState.getState().setIsRunning(false);
}
