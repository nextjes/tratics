import * as term from "~/engine/term";

/**
 * 시뮬레이션 토폴로지 유형
 */
export enum TopologyType {
  Star = "star",
  Ring = "ring",
  Mesh = "mesh",
  Custom = "custom",
}

/**
 * 시뮬레이션 난이도 설정
 */
export enum SimulationDifficulty {
  Easy = "easy",
  Normal = "normal",
  Hard = "hard",
  Extreme = "extreme",
}

/**
 * 시뮬레이션 설정 인터페이스
 */
export interface SimulationConfigProps {
  tickInterval?: term.MilliSecond;
  timeScale?: number;
  nodeCount?: number;
  coresPerNode?: number;
  topologyType?: TopologyType;
  requestCount?: number;
  difficulty?: SimulationDifficulty;
  randomSeed?: number;
}

/**
 * 시뮬레이션 설정을 관리하는 클래스
 */
export class SimulationConfig {
  readonly #tickInterval: term.MilliSecond;
  readonly #timeScale: number;
  readonly #nodeCount: number;
  readonly #coresPerNode: number;
  readonly #topologyType: TopologyType;
  readonly #requestCount: number;
  readonly #difficulty: SimulationDifficulty;
  readonly #randomSeed: number;

  /**
   * 시뮬레이션 설정 생성자
   */
  private constructor(
    tickInterval: term.MilliSecond,
    timeScale: number,
    nodeCount: number,
    coresPerNode: number,
    topologyType: TopologyType,
    requestCount: number,
    difficulty: SimulationDifficulty,
    randomSeed: number
  ) {
    this.#tickInterval = tickInterval;
    this.#timeScale = timeScale;
    this.#nodeCount = nodeCount;
    this.#coresPerNode = coresPerNode;
    this.#topologyType = topologyType;
    this.#requestCount = requestCount;
    this.#difficulty = difficulty;
    this.#randomSeed = randomSeed;
  }

  /**
   * 기본 설정으로 시뮬레이션 설정 생성
   */
  public static defaults(): SimulationConfig {
    return new SimulationConfig(
      new term.MilliSecond(100), // 100ms 틱 간격
      1.0, // 실시간 진행
      5, // 기본 5개 노드
      2, // 노드당 2개 코어
      TopologyType.Star, // 기본 스타 토폴로지
      1000, // 1000개 요청
      SimulationDifficulty.Normal, // 보통 난이도
      Date.now() // 현재 시간을 랜덤 시드로 사용
    );
  }

  /**
   * 설정 커스터마이징
   */
  public with(props: SimulationConfigProps): SimulationConfig {
    return new SimulationConfig(
      props.tickInterval ?? this.#tickInterval,
      props.timeScale ?? this.#timeScale,
      props.nodeCount ?? this.#nodeCount,
      props.coresPerNode ?? this.#coresPerNode,
      props.topologyType ?? this.#topologyType,
      props.requestCount ?? this.#requestCount,
      props.difficulty ?? this.#difficulty,
      props.randomSeed ?? this.#randomSeed
    );
  }

  // 접근자 메서드들
  public tickInterval(): term.MilliSecond {
    return this.#tickInterval;
  }

  public timeScale(): number {
    return this.#timeScale;
  }

  public nodeCount(): number {
    return this.#nodeCount;
  }

  public coresPerNode(): number {
    return this.#coresPerNode;
  }

  public topologyType(): TopologyType {
    return this.#topologyType;
  }

  public requestCount(): number {
    return this.#requestCount;
  }

  public difficulty(): SimulationDifficulty {
    return this.#difficulty;
  }

  public randomSeed(): number {
    return this.#randomSeed;
  }

  /**
   * 난이도에 따른 링크 대역폭 설정
   */
  public getLinkBandwidth(): number {
    switch (this.#difficulty) {
      case SimulationDifficulty.Easy:
        return 5000000; // 5MB/s
      case SimulationDifficulty.Normal:
        return 3000000; // 3MB/s
      case SimulationDifficulty.Hard:
        return 1000000; // 1MB/s
      case SimulationDifficulty.Extreme:
        return 500000; // 500KB/s
      default:
        return 3000000; // 기본 3MB/s
    }
  }

  /**
   * 난이도에 따른 링크 지연 시간 설정
   */
  public getLinkLatency(): term.MilliSecond {
    switch (this.#difficulty) {
      case SimulationDifficulty.Easy:
        return new term.MilliSecond(50);
      case SimulationDifficulty.Normal:
        return new term.MilliSecond(100);
      case SimulationDifficulty.Hard:
        return new term.MilliSecond(200);
      case SimulationDifficulty.Extreme:
        return new term.MilliSecond(300);
      default:
        return new term.MilliSecond(100);
    }
  }

  /**
   * 난이도에 따른 링크 신뢰도 설정
   */
  public getLinkReliability(): number {
    switch (this.#difficulty) {
      case SimulationDifficulty.Easy:
        return 1.0; // 100% 신뢰도
      case SimulationDifficulty.Normal:
        return 0.99; // 99% 신뢰도
      case SimulationDifficulty.Hard:
        return 0.95; // 95% 신뢰도
      case SimulationDifficulty.Extreme:
        return 0.9; // 90% 신뢰도
      default:
        return 0.99;
    }
  }

  /**
   * 난이도에 따른 메시지 크기 범위 설정
   */
  public getMessageSizeRange(): [number, number] {
    switch (this.#difficulty) {
      case SimulationDifficulty.Easy:
        return [10000, 50000]; // 10KB ~ 50KB
      case SimulationDifficulty.Normal:
        return [50000, 150000]; // 50KB ~ 150KB
      case SimulationDifficulty.Hard:
        return [100000, 300000]; // 100KB ~ 300KB
      case SimulationDifficulty.Extreme:
        return [200000, 500000]; // 200KB ~ 500KB
      default:
        return [50000, 150000];
    }
  }
}
