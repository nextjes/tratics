import * as term from "~/engine/term";
import { type Publishable } from "./publishable";

/**
 * 시간 경과에 따라 상태가 변화하는 객체를 위한 인터페이스
 */
export interface Temporal {
  /**
   * 지정된 시간만큼 객체의 상태를 진행
   * @param deltaTime 진행할 시간
   * @returns 자기 자신(메서드 체이닝 지원)
   */
  after(deltaTime: term.MilliSecond): Temporal;

  /**
   * 초기 상태로 리셋
   * @returns 자기 자신(메서드 체이닝 지원)
   */
  reset(): Temporal;
}

/**
 * 시간에 따라 상태가 변화하며 발행 가능한 객체
 * 시뮬레이션의 핵심 구성 요소가 구현해야 하는 인터페이스
 */
export interface Updatable extends Temporal, Publishable {}
