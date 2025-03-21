import { Scene } from "./scene";
import { Node, SimulationClock, Task, type Updatable } from "./updatable";
import { useMemoryState } from "~/store/memory";
import * as term from "./term";

class SimulationEngine {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private tickInterval: number;
  private updatables: Updatable[];

  constructor(tickInterval: number, updatables: Updatable[]) {
    this.tickInterval = tickInterval;
    this.updatables = updatables;
  }

  start(): void {
    if (this.intervalId !== null) return;
    this.intervalId = setInterval(() => {
      const deltaTime = new term.MilliSecond(this.tickInterval);
      this.updatables = this.updatables.map((obj) => obj.after(deltaTime));
      new Scene(this.updatables).publish();
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
      this.updatables = this.updatables.map((obj) => obj.reset());
      console.log("Simulation stopped.");
    }
  }
}

const tickInterval = 100; // 밀리초 단위로 100ms 간격
const clock = SimulationClock.init();
const node = Node.boot(2).registerTask(Task.ready(new term.MilliSecond(3000)));
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
