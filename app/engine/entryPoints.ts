import {
  SimulationEngine,
  SimulationState,
  TopologyType,
  SimulationDifficulty,
} from "./core/simulation";
import { useMemoryState } from "~/store/memory";
import { config, initializeRouter } from "./settings";

let simulationEngine = SimulationEngine.create().configure(config);
initializeRouter();

/**
 * 시뮬레이션 시작
 */
export function start(): void {
  // 현재 엔진이 실행 중이면 중지
  if (simulationEngine.getState() === SimulationState.Running) {
    simulationEngine.stop();
  }

  // 시뮬레이션 시작
  simulationEngine.start();

  // UI 상태 업데이트
  useMemoryState.getState().setIsRunning(true);
}

/**
 * 시뮬레이션 일시 중지
 */
export function pause(): void {
  simulationEngine.pause();
  useMemoryState.getState().setIsRunning(false);
}

/**
 * 시뮬레이션 중지 및 초기화
 */
export function stop(): void {
  simulationEngine.stop();
  simulationEngine = simulationEngine.configure(config);
  useMemoryState.getState().setIsRunning(false);
}

/**
 * 시뮬레이션 난이도 변경
 */
export function setDifficulty(difficulty: string): void {
  let difficultyEnum = SimulationDifficulty.Normal;
  switch (difficulty.toLowerCase()) {
    case "easy":
      difficultyEnum = SimulationDifficulty.Easy;
      break;
    case "normal":
      difficultyEnum = SimulationDifficulty.Normal;
      break;
    case "hard":
      difficultyEnum = SimulationDifficulty.Hard;
      break;
    case "extreme":
      difficultyEnum = SimulationDifficulty.Extreme;
      break;
  }

  simulationEngine = simulationEngine.configure({
    difficulty: difficultyEnum,
  });
}

/**
 * 시뮬레이션 토폴로지 변경
 */
export function setTopologyType(topology: string): void {
  let topologyEnum = TopologyType.Star;
  switch (topology.toLowerCase()) {
    case "star":
      topologyEnum = TopologyType.Star;
      break;
    case "ring":
      topologyEnum = TopologyType.Ring;
      break;
    case "mesh":
      topologyEnum = TopologyType.Mesh;
      break;
    case "custom":
      topologyEnum = TopologyType.Custom;
      break;
  }

  simulationEngine = simulationEngine.configure({
    topologyType: topologyEnum,
  });
}

/**
 * 시뮬레이션 스케일 변경
 */
export function setTimeScale(scale: number): void {
  if (scale <= 0) {
    console.error("Time scale must be greater than 0");
    return;
  }

  simulationEngine = simulationEngine.configure({
    timeScale: scale,
  });
}

// 디버깅용 엔진 인스턴스 노출
export function getEngine(): SimulationEngine {
  return simulationEngine;
}
