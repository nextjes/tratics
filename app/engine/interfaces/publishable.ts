import * as term from "~/engine/term";

/**
 * 발행 가능한 상태의 기본 구조
 */
export interface PublishableState {
  id: string;
  role: term.Role;
  [key: string]: any;
}

/**
 * 상태를 발행할 수 있는 객체를 위한 인터페이스
 */
export interface Publishable {
  /**
   * 현재 객체 상태를 발행 가능한 형태로 반환
   * @returns 발행 가능한 상태 객체
   */
  state(): PublishableState;
}
