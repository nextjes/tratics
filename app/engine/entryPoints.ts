import { Simulation } from "./simulation";
import { Node, SimulationClock, type Temporal } from "./updatable";
import { useMemoryState } from "~/store/memory";
import * as term from "./term";

// SimulationEngine 클래스: 업데이트 루프를 관리하며 start와 pause 함수 제공
class SimulationEngine {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private tickInterval: number;
  private clock: SimulationClock;
  private updatables: Temporal[];
  private dashboard: Simulation;

  constructor(
    tickInterval: number,
    clock: SimulationClock,
    updatables: Temporal[],
    dashboard: Simulation
  ) {
    this.tickInterval = tickInterval;
    this.clock = clock;
    this.updatables = updatables;
    this.dashboard = dashboard;
  }

  // start() 함수: 시뮬레이션 업데이트 루프 시작
  start(): void {
    if (this.intervalId !== null) return; // 이미 실행 중이면 중복 실행하지 않음
    this.intervalId = setInterval(() => {
      // 클럭 업데이트 및 deltaTime 계산
      const deltaTime = new term.MilliSecond(this.tickInterval);

      // 등록된 모든 도메인 객체 업데이트
      this.clock = this.clock.after(deltaTime);
      this.updatables.forEach((obj) => {
        obj = obj.after(deltaTime);
      });
      this.dashboard.elapsedTime = this.clock.currentTime();
      this.dashboard.publish();
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
      this.clock = this.clock.reset();
      this.updatables.forEach((obj) => obj.reset());
      console.log("Simulation stopped.");
    }
  }
}

const tickInterval = 100; // 밀리초 단위로 100ms 간격
const clock = SimulationClock.init();
const node = Node.init(new term.Second(3));
const engine = new SimulationEngine(
  tickInterval,
  clock,
  [node],
  Simulation.draft()
);

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
