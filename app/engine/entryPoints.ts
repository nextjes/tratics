// engine 폴더 만들기 위한 index.ts 파일 생성

import { SimulationClock } from "./SimulationClock";
import { DummyNode, type Updatable } from "./DummyNode";
import { useMemoryState } from "~/store/memory";

// SimulationEngine 클래스: 업데이트 루프를 관리하며 start와 pause 함수 제공
class SimulationEngine {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private tickInterval: number;
  private clock: SimulationClock;
  private updatables: Updatable[];

  constructor(
    tickInterval: number,
    clock: SimulationClock,
    updatables: Updatable[]
  ) {
    this.tickInterval = tickInterval;
    this.clock = clock;
    this.updatables = updatables;
  }

  // start() 함수: 시뮬레이션 업데이트 루프 시작
  start(): void {
    if (this.intervalId !== null) return; // 이미 실행 중이면 중복 실행하지 않음
    this.intervalId = setInterval(() => {
      // 클럭 업데이트 및 deltaTime 계산
      const deltaTime = this.clock.tick();

      // 등록된 모든 도메인 객체 업데이트
      this.updatables.forEach((obj) => obj.update(deltaTime));

      // 현재 시뮬레이션 시간 출력
      console.log(
        `Simulation time: ${this.clock.currentTime().toFixed(4)} seconds`
      );
      useMemoryState.getState().setClock(this.clock.currentTime().toFixed(4));
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
}

const tickInterval = 100; // 밀리초 단위로 100ms 간격
const clock = new SimulationClock();
const node = new DummyNode();
const engine = new SimulationEngine(tickInterval, clock, [node]);

export function start() {
  engine.start();
  useMemoryState.getState().setIsRunning(true);
}

export function pause() {
  engine.pause();
  useMemoryState.getState().setIsRunning(false);
}
