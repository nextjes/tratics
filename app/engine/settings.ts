import { term } from ".";
import * as network from "./core/network";
import { SimulationDifficulty, TopologyType } from "./core/simulation";

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
export const router = network.Router.config([
  network.NetworkLink.connect("client-1", "server-1"),
  network.NetworkLink.connect("server-1", "client-1"),
]);
