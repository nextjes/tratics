/**
 * ID 생성을 위한 전략 인터페이스
 * 다양한 식별자 생성 알고리즘을 지원하기 위한 전략 패턴 적용
 */
export interface IdGenerator {
  /**
   * 지정된 접두어를 사용하여 고유 ID를 생성
   * @param prefix ID 접두어 (예: 'node', 'link')
   * @returns 생성된 고유 ID 문자열
   */
  generate(prefix: string): string;

  /**
   * 생성기의 상태를 초기화
   * 주로 테스트 목적으로 사용됨
   */
  reset(): void;
}

/**
 * 순차적 번호를 사용하는 ID 생성기
 * '{prefix}-{순차번호}' 형식의 ID를 생성
 */
export class SequentialIdGenerator implements IdGenerator {
  #counters = new Map<string, number>();

  generate(prefix: string): string {
    const count = (this.#counters.get(prefix) || 0) + 1;
    this.#counters.set(prefix, count);
    return `${prefix}-${count}`;
  }

  reset(): void {
    this.#counters.clear();
  }
}

/**
 * 고유 식별자 클래스
 * 다양한 ID 생성 전략을 지원하는 유연한 설계
 */
export class Identifier {
  #id: string;
  static #generator: IdGenerator = new SequentialIdGenerator();

  /**
   * 주어진 접두어로 고유 식별자 생성
   * @param prefix 식별자 접두어 (예: 'node', 'link')
   */
  constructor(prefix: string) {
    this.#id = Identifier.#generator.generate(prefix);
  }

  /**
   * 식별자 문자열 반환
   */
  public toString(): string {
    return this.#id;
  }

  /**
   * 두 식별자 비교
   */
  public equals(other: Identifier): boolean {
    return this.#id === other.toString();
  }

  /**
   * ID 생성기 설정
   * ID 생성 전략을 변경할 때 사용
   */
  public static setGenerator(generator: IdGenerator): void {
    this.#generator = generator;
  }

  /**
   * 기본 생성기로 설정하고 초기화
   * 주로 테스트용으로 사용
   */
  public static resetGenerator(): void {
    this.#generator = new SequentialIdGenerator();
    this.#generator.reset();
  }
}
