import {
  SimulationEngine,
  TopologyType,
  SimulationDifficulty,
} from "./core/simulation";
import { initializeRouter } from "./settings";
import { term } from ".";
import { createWorld } from "./ecs/world";

// 전역 시뮬레이션 엔진 인스턴스
export let config = {
  requestCount: 1000,
  difficulty: SimulationDifficulty.Normal,
  topologyType: TopologyType.Star,
  nodeCount: 5,
  coresPerNode: 2,
  tickInterval: new term.MilliSecond(100),
  timeScale: 1.0,
};
let simulationEngine = SimulationEngine.create().configure(config);
initializeRouter();

const world = createWorld();
let intervalId: ReturnType<typeof setInterval> | null = null;

/**
 * 시뮬레이션 시작
 */
export function start(): void {
  const delta = 16.67;
  let time = 0;

  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }

  intervalId = setInterval(() => {
    world.execute(delta, time);
    time += delta;
  }, delta);
}

/**
 * 시뮬레이션 일시 중지
 */
export function pause(): void {
  world.stop();
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

export function resume(): void {
  world.play();
  const delta = 16.67;
  let time = 0;
  intervalId = setInterval(() => {
    world.execute(delta, time);
  }, delta);
}

/**
 * 시뮬레이션 중지 및 초기화
 */
export function stop(): void {
  world.stop();
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
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
