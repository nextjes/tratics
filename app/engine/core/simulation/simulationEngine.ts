import * as term from "~/engine/term";
import { type Updatable } from "~/engine/interfaces";
import { Clock, Node } from "../updatable";
import { Message } from "../network";
import { NetworkTopology, TopologyBuilder } from "../topology";
import { Scene } from "./scene";
import {
  SimulationConfig,
  TopologyType,
  type SimulationConfigProps,
} from "./simulationConfig";

/**
 * 시뮬레이션 상태 열거형
 */
export enum SimulationState {
  Stopped = "stopped",
  Running = "running",
  Paused = "paused",
}

/**
 * 시뮬레이션 엔진 클래스
 * 시뮬레이션 실행 및 제어를 담당
 */
export class SimulationEngine {
  #intervalId: ReturnType<typeof setInterval> | null = null;
  #state: SimulationState;
  #clock: Clock;
  #config: SimulationConfig;
  #updatables: Updatable[];
  #requestsProcessed: number;
  #requestsRemaining: number;

  /**
   * 시뮬레이션 엔진 생성자
   */
  private constructor(
    config: SimulationConfig,
    updatables: Updatable[] = [],
    state: SimulationState = SimulationState.Stopped,
    clock: Clock = Clock.init(),
    requestsProcessed: number = 0,
    requestsRemaining: number = 0
  ) {
    this.#config = config;
    this.#updatables = [...updatables];
    this.#state = state;
    this.#clock = clock;
    this.#requestsProcessed = requestsProcessed;
    this.#requestsRemaining = requestsRemaining;
  }

  /**
   * 기본 설정으로 시뮬레이션 엔진 생성
   */
  public static create(config?: SimulationConfigProps): SimulationEngine {
    const defaultConfig = SimulationConfig.defaults();
    const finalConfig = config ? defaultConfig.with(config) : defaultConfig;
    return new SimulationEngine(finalConfig);
  }

  /**
   * 시뮬레이션 시작
   */
  public start(): void {
    if (this.#state === SimulationState.Running) {
      return;
    }

    // 이미 실행 중인 인터벌이 있으면 제거
    if (this.#intervalId !== null) {
      clearInterval(this.#intervalId);
      this.#intervalId = null;
    }

    // 시뮬레이션 상태 업데이트
    this.#state = SimulationState.Running;

    // 업데이트 인터벌 설정
    this.#intervalId = setInterval(() => {
      this.tick();
    }, this.#config.tickInterval().valueOf());
  }

  /**
   * 시뮬레이션 일시 중지
   */
  public pause(): void {
    if (this.#state !== SimulationState.Running) {
      return;
    }

    if (this.#intervalId !== null) {
      clearInterval(this.#intervalId);
      this.#intervalId = null;
    }

    this.#state = SimulationState.Paused;
  }

  /**
   * 시뮬레이션 중지 및 초기화
   */
  public stop(): void {
    if (this.#intervalId !== null) {
      clearInterval(this.#intervalId);
      this.#intervalId = null;
    }

    this.#state = SimulationState.Stopped;
    this.#updatables = this.#updatables.map((entity) => entity.reset());
    this.#clock = this.#clock.reset();
    this.#requestsProcessed = 0;
    this.#requestsRemaining = this.#config.requestCount();
    Scene.capture([this.#clock, ...this.#updatables]).publish();
  }

  /**
   * 시뮬레이션 설정 변경
   */
  public configure(config: SimulationConfigProps): SimulationEngine {
    const newConfig = this.#config.with(config);
    return new SimulationEngine(
      newConfig,
      this.#updatables,
      this.#state,
      this.#clock,
      this.#requestsProcessed,
      this.#requestsRemaining
    );
  }

  /**
   * 시뮬레이션 단일 틱 진행
   */
  private tick(): void {
    const deltaTime = this.#config.tickInterval();

    // 필요한 경우 새 메시지 생성 (메시지 생성률은 설정에 따라 조정)
    this.generateNewMessages();

    // 모든 엔티티 업데이트
    const updatedEntities = this.#updatables.map((entity) =>
      entity.after(deltaTime)
    );
    this.#updatables = updatedEntities;
    this.#clock = this.#clock.after(deltaTime);

    // 상태 발행
    Scene.capture([this.#clock, ...updatedEntities]).publish();

    // 종료 조건 확인
    if (
      this.#requestsRemaining <= 0 &&
      this.#requestsProcessed >= this.#config.requestCount()
    ) {
      this.pause();
    }
  }

  /**
   * 시뮬레이션에 새 메시지 생성
   */
  private generateNewMessages(): void {
    if (this.#requestsRemaining <= 0) {
      return;
    }

    // 설정과 시간에 따라 메시지 생성 확률 계산
    const messageProbability = this.calculateMessageProbability();

    // 메시지 생성 여부 결정
    if (Math.random() < messageProbability && this.#updatables.length > 1) {
      // 토폴로지 객체 찾기
      const topology = this.#updatables.find((entity) => {
        const state = entity.state();
        return state.role === term.Role.Topology;
      });

      if (topology && topology instanceof NetworkTopology) {
        // 랜덤 소스/목적지 노드 선택
        const nodes = topology.nodes();
        if (nodes.length >= 2) {
          const sourceIndex = Math.floor(Math.random() * nodes.length);
          let destIndex;
          do {
            destIndex = Math.floor(Math.random() * nodes.length);
          } while (destIndex === sourceIndex);

          const sourceNode = nodes[sourceIndex];
          const destNode = nodes[destIndex];

          // 난이도에 따른 메시지 크기 범위 설정
          const [minSize, maxSize] = this.#config.getMessageSizeRange();
          const messageSize = Math.floor(
            minSize + Math.random() * (maxSize - minSize)
          );

          // 메시지 생성
          const message = Message.written(
            sourceNode.id(),
            destNode.id(),
            messageSize
          );

          // 토폴로지에 메시지 전송
          this.#updatables = this.#updatables.map((entity) => {
            if (entity === topology) {
              return topology.sendMessage(message);
            }
            return entity;
          });

          this.#requestsRemaining--;
        }
      }
    }
  }

  /**
   * 시뮬레이션 틱당 메시지 생성 확률 계산
   */
  private calculateMessageProbability(): number {
    // 기본 확률 - 난이도에 따라 조정
    let baseProbability = 0.2; // 20%

    // 난이도에 따른 조정
    switch (this.#config.difficulty()) {
      case "easy":
        baseProbability = 0.1; // 낮은 메시지 생성률
        break;
      case "normal":
        baseProbability = 0.2;
        break;
      case "hard":
        baseProbability = 0.3;
        break;
      case "extreme":
        baseProbability = 0.4; // 높은 메시지 생성률
        break;
    }

    // 남은 요청 수에 따른 조정 (많을수록 높은 확률)
    const remainingFactor =
      this.#requestsRemaining / this.#config.requestCount();

    return baseProbability * remainingFactor;
  }

  /**
   * 시뮬레이션 상태 확인
   */
  public getState(): SimulationState {
    return this.#state;
  }

  /**
   * 설정 정보 가져오기
   */
  public getConfig(): SimulationConfig {
    return this.#config;
  }

  /**
   * 처리된 요청 수 가져오기
   */
  public getRequestsProcessed(): number {
    return this.#requestsProcessed;
  }

  /**
   * 남은 요청 수 가져오기
   */
  public getRequestsRemaining(): number {
    return this.#requestsRemaining;
  }
}
