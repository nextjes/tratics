import * as term from "~/engine/term";
import { type Publishable } from "~/engine/interfaces";
import { useMemoryState } from "~/store/memory";

/**
 * 시뮬레이션 장면을 표현하는 클래스
 * 시뮬레이션의 전체 상태를 관리하고 상태 변경 발행
 */
export class Scene {
  readonly #id: term.Identifier;
  readonly #entities: Publishable[];
  readonly #capturedTime: number;

  private constructor(
    id: term.Identifier,
    entities: Publishable[],
    lastUpdateTime: number
  ) {
    this.#id = id;
    this.#entities = [...entities];
    this.#capturedTime = lastUpdateTime;
  }

  /**
   * 새 시뮬레이션 장면 생성
   */
  public static capture(entities: Publishable[]): Scene {
    return new Scene(new term.Identifier("scene"), entities, Date.now());
  }

  /**
   * 장면 상태 발행
   */
  public publish(): void {
    const { setClock, setNodeStatus, setLinkStatus } =
      useMemoryState.getState();

    const states = this.#entities.map((entity) => entity.state());

    const clockState = states.find((state) => state.role === term.Role.Clock);
    setClock((clockState!.currentTime / 1000).toFixed(1));

    const topologyState = states.find(
      (state) => state.role === term.Role.Topology
    );

    const nodeStates = topologyState!.nodes;
    const linkStates = topologyState!.links;
    const newNodeStates = nodeStates.map((state: any) => ({
      id: state.id,
      cores: state.cores.length,
      busyCores: state.cores.filter((core: any) => core.busy === true).length,
    }));
    setNodeStatus(newNodeStates);

    const activeLinks = linkStates.map((state: any) => ({
      id: state.id,
      srcId: state.srcId,
      dstId: state.dstId,
      bandwidth: state.bandwidth,
      throughput: state.throughput,
    }));
    setLinkStatus(activeLinks);
  }
}
