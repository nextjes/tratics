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

    const nodeStates = states.filter((state) => state.role === term.Role.Node);
    if (nodeStates.length > 0) {
      const newNodeStates = nodeStates.map((state) => ({
        id: state.id,
        cores: `${state.reduce(
          (acc: number, core: any) => acc + (core.isBusy() ? 1 : 0),
          0
        )}/${state.coreCount()}`,
      }));
      setNodeStatus(newNodeStates);
    }

    const linkStates = states.filter((state) => state.role === term.Role.Link);
    if (linkStates.length > 0) {
      const activeLinks = linkStates.map((state) => ({
        id: state.id,
        srcId: state.srcId,
        dstId: state.dstId,
        bandwidth: state.bandwidth,
        throughput: state.throughput,
      }));
      setLinkStatus(activeLinks.toString());
    }
  }
}
