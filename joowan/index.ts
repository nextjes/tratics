// SimulationClock.ts
class SimulationClock {
  private lastTick: number;
  private simulationTime: number; // 초 단위로 누적된 시뮬레이션 시간

  constructor() {
    this.lastTick = Date.now();
    this.simulationTime = 0.0;
  }

  // tick() 메서드는 지난 틱(Delta Time)을 계산하고 시뮬레이션 시간을 업데이트합니다.
  tick(): number {
    const now = Date.now();
    const delta = now - this.lastTick; // 밀리초 단위
    this.lastTick = now;
    const deltaSeconds = delta / 1000; // 초 단위 변환
    this.simulationTime += deltaSeconds;
    return deltaSeconds;
  }

  // 현재 시뮬레이션 시간 반환 (초 단위)
  currentTime(): number {
    return this.simulationTime;
  }
}

// Updatable 인터페이스: 시뮬레이션 객체가 구현해야 하는 update 메서드
interface Updatable {
  update(deltaTime: number): void;
}

// DummyNode.ts
class DummyNode implements Updatable {
  private value: number;

  constructor() {
    this.value = 0.0;
  }

  // update 메서드는 deltaTime만큼 값을 증가시키며 상태 변화를 표현합니다.
  update(deltaTime: number): void {
    this.value += deltaTime;
    console.log(`DummyNode updated: value = ${this.value.toFixed(4)}`);
  }
}

// main.ts
const tickInterval = 100; // 밀리초 단위로 100ms 간격
const clock = new SimulationClock();
const node = new DummyNode();

// setInterval을 통해 업데이트 루프를 구현합니다.
setInterval(() => {
  // 시뮬레이션 클럭으로부터 deltaTime(초 단위)을 계산
  const deltaTime = clock.tick();

  // 도메인 객체 업데이트
  node.update(deltaTime);

  // 현재 시뮬레이션 시간 출력
  console.log(`Simulation time: ${clock.currentTime().toFixed(4)} seconds`);
}, tickInterval);
