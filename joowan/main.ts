import { SimulationClock } from "./SimulationEngine/SimulationClock";
import { DummyNode } from "./SimulationEngine/DummyNode";

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
