/**
 * 2D 위치 좌표를 표현하는 불변 클래스
 * 네트워크 토폴로지에서 노드 위치 표현에 사용
 */
export class Position {
  #x: number;
  #y: number;

  constructor(x: number, y: number) {
    this.#x = x;
    this.#y = y;
  }

  /**
   * X 좌표 반환
   */
  public get x(): number {
    return this.#x;
  }

  /**
   * Y 좌표 반환
   */
  public get y(): number {
    return this.#y;
  }

  /**
   * 두 위치 간의 유클리드 거리 계산
   */
  public distanceTo(other: Position): number {
    const dx = this.#x - other.x;
    const dy = this.#y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 문자열 표현
   */
  public toString(): string {
    return `(${this.#x}, ${this.#y})`;
  }
}
