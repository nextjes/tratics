import { term } from ".";
import { SimulationDifficulty, TopologyType } from "./core/simulation";
import { Router } from "./router";

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
// router는 null로 초기화
export let router: Router | null = null;

// 지연 초기화 함수
export function initializeRouter() {
  router = Router.config([
    ["client-1", "server-1"],
    ["server-1", "client-1"],
  ]);
}
