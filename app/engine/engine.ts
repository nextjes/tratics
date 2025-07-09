import * as ecsy from "ecsy";
import { createWorld } from "./ecs/world";
import { InvalidSimulationStatusError } from "./error";
import { RUNNING_STATUS, type SimulationSettings } from "~/store/status";
import { useSimulationConfig } from "~/store/memory";

export class SimulationEngine {
  world: ecsy.World;
  config: SimulationSettings;
  elapsedTime: number;
  lastTimestamp: number | null = null;
  #rafId: number | null = null;

  constructor(
    world: ecsy.World,
    settings: SimulationSettings,
    elapsedTime: number
  ) {
    this.world = world;
    this.config = settings;
    this.elapsedTime = elapsedTime;
    this.step = this.step.bind(this);
  }

  static init(): SimulationEngine {
    const config = useSimulationConfig.getState();
    const world = createWorld(
      Array.from({ length: config.nodes[0].coreCount }, () => ({
        taskId: null,
      }))
    );
    world.stop();
    return new SimulationEngine(world, config, 0);
  }

  reset(): void {
    this.world = createWorld(
      Array.from({ length: this.config.nodes[0].coreCount }, () => ({
        taskId: null,
      }))
    );
    this.config = useSimulationConfig.getState();
    this.elapsedTime = 0;
    this.lastTimestamp = null;
    if (this.#rafId !== null) {
      cancelAnimationFrame(this.#rafId);
      this.#rafId = null;
    }
  }

  step(timestamp: number): void {
    if (this.lastTimestamp === null) {
      this.lastTimestamp = timestamp;
    }
    const delta = timestamp - this.lastTimestamp;
    const effectiveDelta = delta * this.config.simulationScale;
    this.elapsedTime += effectiveDelta;
    this.lastTimestamp = timestamp;
    this.world.execute(effectiveDelta, this.elapsedTime);

    this.#rafId = requestAnimationFrame(this.step);
  }

  start(): void {
    if (this.world.enabled) {
      throw new InvalidSimulationStatusError("Simulation is already running.");
    }

    this.world.play();
    const { setRunningStatus } = useSimulationConfig.getState();
    setRunningStatus(RUNNING_STATUS.RUNNING);
    this.config = useSimulationConfig.getState();
    this.#rafId = requestAnimationFrame(this.step);
  }

  pause(): void {
    if (!this.world.enabled) {
      throw new InvalidSimulationStatusError("Simulation is not running.");
    }

    if (this.#rafId !== null) {
      cancelAnimationFrame(this.#rafId);
      this.#rafId = null;
    }
    this.world.stop();
    const { setRunningStatus } = useSimulationConfig.getState();
    setRunningStatus(RUNNING_STATUS.PAUSED);
    this.config = useSimulationConfig.getState();
  }

  resume(): void {
    if (this.world.enabled) {
      throw new InvalidSimulationStatusError("Simulation is already running.");
    }

    this.world.play();
    const { setRunningStatus } = useSimulationConfig.getState();
    setRunningStatus(RUNNING_STATUS.RUNNING);
    this.config = useSimulationConfig.getState();
    this.#rafId = requestAnimationFrame(this.step);
  }

  stop(): void {
    if (this.#rafId !== null) {
      cancelAnimationFrame(this.#rafId);
      this.#rafId = null;
    }
    this.reset();
    this.world.stop();
    const { setRunningStatus } = useSimulationConfig.getState();
    setRunningStatus(RUNNING_STATUS.STOPPED);
    this.config = useSimulationConfig.getState();
  }

  setSimulationSettings(settings: Partial<SimulationSettings>): void {
    const { setSimulationConfig } = useSimulationConfig.getState();
    setSimulationConfig(settings);
    this.config = useSimulationConfig.getState();
  }
}

export const simulationEngine = SimulationEngine.init();
