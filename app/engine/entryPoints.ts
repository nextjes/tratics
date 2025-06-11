import { simulationEngine } from "./engine";
import { simulationSettings } from "./settings";

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
  settings: Partial<typeof simulationSettings>
): void {
  simulationEngine.setSimulationSettings(settings);
}
