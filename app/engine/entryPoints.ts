import { Scene } from "./scene";
import { Node, SimulationClock, type Temporal } from "./updatable";
import { useMemoryState } from "~/store/memory";
import * as term from "./term";

// SimulationEngine 클래스: 업데이트 루프를 관리하며 start와 pause 함수 제공
class SimulationEngine {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private tickInterval: number;
  private temporals: Temporal[];

  constructor(tickInterval: number, temporals: Temporal[]) {
    this.tickInterval = tickInterval;
    this.temporals = temporals;
  }

  // start() 함수: 시뮬레이션 업데이트 루프 시작
  start(): void {
    if (this.intervalId !== null) return; // 이미 실행 중이면 중복 실행하지 않음
    this.intervalId = setInterval(() => {
      // 클럭 업데이트 및 deltaTime 계산
      const deltaTime = new term.MilliSecond(this.tickInterval);

      // 등록된 모든 도메인 객체 업데이트
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
