import type { SimulationSettings } from "~/store/status";
import { simulationEngine } from "./engine";

export function start(): void {
  simulationEngine.start();
}

export function pause(): void {
  simulationEngine.pause();
}

export function resume(): void {
  simulationEngine.resume();
}

export function stop(): void {
  simulationEngine.stop();
}

export function setSimulationSettings(
  settings: Partial<SimulationSettings>
): void {
  simulationEngine.setSimulationSettings(settings);
}
