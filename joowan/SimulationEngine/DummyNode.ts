interface Updatable {
  update(deltaTime: number): void;
}

export class DummyNode implements Updatable {
  private value: number;

  constructor() {
    this.value = 0.0;
  }

  // update 메서드는 deltaTime만큼 값을 증가시키며 상태 변화를 표현합니다.
  update(deltaTime: number): void {
    this.value += deltaTime;
    console.log(`DummyNode updated: value = ${this.value.toFixed(4)}`);
  }
}
