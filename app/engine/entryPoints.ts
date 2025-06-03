import { SIMULATION_DELTA } from "./constants";
import { createWorld } from "./ecs/world";
import { simulationSettings } from "./settings";

let world = createWorld();
let intervalId: ReturnType<typeof setInterval> | null = null;

/**
 * 시뮬레이션 시작
 */
export function start(): void {
  let time = 0;

  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }

  intervalId = setInterval(() => {
    const effectiveDelta = SIMULATION_DELTA * simulationSettings.simulationScale;
    world.execute(effectiveDelta, time);
    time += effectiveDelta;
  }, SIMULATION_DELTA);
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
  let time = 0;
  intervalId = setInterval(() => {
    const effectiveDelta = SIMULATION_DELTA * simulationSettings.simulationScale;
    world.execute(effectiveDelta, time);
    time += effectiveDelta;
  }, SIMULATION_DELTA);
}

/**
 * 시뮬레이션 중지 및 초기화
 */
export function stop(): void {
  world.stop();
  world = createWorld();
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

export function setSimulationSettings(
  settings: Partial<typeof simulationSettings>
): void {
  Object.assign(simulationSettings, settings);
}
