export class SimulationClock {
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
