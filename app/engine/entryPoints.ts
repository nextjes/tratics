import { createWorld } from "./ecs/world";

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
    time += delta;
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
