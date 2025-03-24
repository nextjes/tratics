/**
 * 시뮬레이션 요소의 역할을 나타내는 열거형
 */
export enum Role {
  Node = "node",
  Link = "link",
  Message = "message",
  Clock = "clock",
}

/**
 * 메시지의 상태를 추적하기 위한 열거형
 */
export enum MessageStatus {
  Created = "created",
  InTransit = "in-transit",
  Delivered = "delivered",
  Failed = "failed",
}
