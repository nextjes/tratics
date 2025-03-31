# Tratics

트래픽 제어 시뮬레이션

## 프로젝트 구성 방법

```shell
yarn install
```

## 프로젝트 실행 방법

```shell
yarn dev
```

## 테스트 실행 방법

```shell
yarn test
```

# Tratics 프로젝트 아키텍처 및 구현

## 1. 시스템 아키텍처

트라틱스 프로젝트는 다음과 같은 5단계의 아키텍처로 구성되어 있습니다:

```
1. 기본 구성 요소 (Task, Node, Core)
2. 네트워크 통신 (Message, NetworkLink)
3. 시간 관리 (Clock, MilliSecond, Temporal)
4. 네트워크 토폴로지 (NetworkTopology, TopologyBuilder)
5. 시뮬레이션 엔진 (SimulationEngine, SimulationConfig, Scene)
```

## 2. 디렉토리 구조 및 역할

```
/app
  /engine                   # 시뮬레이션 엔진
    /core                   # 핵심 컴포넌트
      /network              # 네트워크 관련 클래스
      /updatable            # 시간 경과에 따라 업데이트되는 객체
      /topology             # 네트워크 토폴로지 관련 클래스
      /simulation           # 시뮬레이션 실행 엔진
    /interfaces             # 공통 인터페이스
    /term                   # 공통 도메인 타입
    entryPoints.ts          # 외부 공개 API
  /client                   # 프론트엔드 코드
/tests                      # 테스트 코드
```

## 3. 핵심 컴포넌트 역할

### 3.1 기본 구성 요소

#### Task (updatable/task.ts)

- **역할**: 노드에서 처리하는 작업 표현
- **상태**: Ready, Running, Completed, Failed
- **특징**: 시간에 따라 진행, 불변성 유지

```typescript
// 작업 생성 예시
const task = Task.ready(1000); // 1000ms 소요되는 작업
const updated = task.after(new MilliSecond(500)); // 500ms 진행
```

#### Core (updatable/node.ts)

- **역할**: CPU 코어 표현
- **특징**: 작업 할당 및 실행, 한 번에 하나의 작업만 처리

```typescript
// 코어에 작업 할당 예시
const core = Core.idle();
const busy = core.assignTask(Task.ready(1000));
```

#### Node (updatable/node.ts)

- **역할**: 여러 코어와 작업 큐를 가진 컴퓨팅 노드
- **특징**: 작업 스케줄링, 코어 관리

```typescript
// 노드 생성 예시
const node = Node.boot(4); // 4개 코어를 가진 노드
node.registerTask(Task.ready(1000)); // 작업 등록
```

### 3.2 네트워크 통신

#### Message (network/message.ts)

- **역할**: 노드 간 전송되는 메시지
- **상태**: Created, InTransit, Delivered, Failed

```typescript
// 메시지 생성 및 전송 예시
const message = Message.written("node-1", "node-2", 150000); // 150KB 메시지
const inTransit = message.startTransit();
```

#### NetworkLink (network/link.ts)

- **역할**: 두 노드 간 연결
- **특징**: 대역폭, 지연 시간, 신뢰도 관리, 대역폭 비례 분배

```typescript
// 링크 생성 및 메시지 전송 예시
const link = NetworkLink.connect("node-1", "node-2");
const withMessage = link.transmit(message);
```

### 3.3 시간 관리

#### Clock (updatable/clock.ts)

- **역할**: 시뮬레이션 시간 관리
- **특징**: 시간 진행, 시간 배율 조정

```typescript
// 시간 경과 예시
const clock = Clock.init();
const advanced = clock.after(new MilliSecond(100));
```

#### Temporal (interfaces/temporal.ts)

- **역할**: 시간 경과에 따라 상태가 변화하는 객체 인터페이스
- **메서드**: `after()`, `reset()`

### 3.4 네트워크 토폴로지

#### NetworkTopology (topology/networkTopology.ts)

- **역할**: 노드, 링크, 메시지의 상호작용 관리
- **특징**: 메시지 라우팅, 전체 네트워크 상태 업데이트

```typescript
// 토폴로지 구성 예시
const topology = NetworkTopology.init()
  .addNode(node1)
  .addNode(node2)
  .addLink(link);
```

#### TopologyBuilder (topology/topologyBuilder.ts)

- **역할**: 다양한 네트워크 토폴로지 생성
- **지원 토폴로지**: 스타, 링, 메시 구조

```typescript
// 스타 토폴로지 생성 예시
const topology = TopologyBuilder.buildStarTopology(nodes);
```

### 3.5 시뮬레이션 엔진

#### SimulationEngine (simulation/simulationEngine.ts)

- **역할**: 시뮬레이션 실행 및 제어
- **특징**: 타이머 기반 틱 처리, 메시지 생성, 설정 관리

```typescript
// 시뮬레이션 실행 예시
const engine = SimulationEngine.create();
engine.start();
```

#### SimulationConfig (simulation/simulationConfig.ts)

- **역할**: 시뮬레이션 설정 관리
- **특징**: 노드 수, 코어 수, 토폴로지 유형, 난이도 설정

```typescript
// 설정 변경 예시
const config = SimulationConfig.defaults().with({
  nodeCount: 10,
  difficulty: SimulationDifficulty.Hard,
});
```

#### Scene (simulation/scene.ts)

- **역할**: 시뮬레이션 상태 캡처 및 발행
- **특징**: UI와의 연동, 상태 발행

```typescript
// 상태 발행 예시
const scene = Scene.capture([clock, topology]);
scene.publish();
```

## 4. 설계 원칙 및 패턴

### 4.1 함수형 불변 객체 패턴

모든 컴포넌트가 상태 변경 시 새 객체를 반환하는 불변성 패턴을 따릅니다.

```typescript
// 불변성 패턴 예시
const node = Node.boot(2);
const updatedNode = node.registerTask(task); // 원본은 변경되지 않음
```

### 4.2 팩토리 메서드 패턴

직접적인 생성자 사용 대신 의미 있는 정적 팩토리 메서드를 제공합니다.

```typescript
// 팩토리 메서드 패턴 예시
const node = Node.boot(4); // 'new Node()' 대신
const link = NetworkLink.connect("src", "dst");
```

### 4.3 빌더 패턴

복잡한 객체 생성을 단계별로 처리하는 빌더 패턴을 사용합니다.

```typescript
// 빌더 패턴 예시
const builder = new TopologyBuilder();
builder.addNode(node1).addNode(node2).connectNodes(node1.id(), node2.id());
const topology = builder.build();
```

### 4.4 전략 패턴

알고리즘을 캡슐화하여 교체 가능하도록 설계했습니다.

```typescript
// 전략 패턴 예시 (ID 생성)
Identifier.setGenerator(new CustomIdGenerator());
```

## 5. 테스트 코드 컨벤션

### 5.1 테스트 구조

- `describe`/`it` 패턴을 사용한 계층적 테스트 구조
- 클래스별로 분리된 테스트 파일
- 메서드별로 그룹화된 테스트 케이스

```typescript
describe("NetworkLink", () => {
  describe("connect", () => {
    it("Should create new network link", () => {
      // 테스트 코드
    });
  });

  describe("transmit", () => {
    // 메서드별 테스트
  });
});
```

### 5.2 테스트 패턴

- **초기화 테스트**: 객체 생성 검증
- **상태 변경 테스트**: 메서드 호출 후 상태 변화 검증
- **시간 경과 테스트**: `after()` 호출 결과 검증
- **에러 발생 테스트**: 예외 상황 처리 검증

```typescript
// 예외 테스트 예시
it("Should throw error when creating ring with too few nodes", () => {
  const nodes = [Node.boot(2), Node.boot(2)];

  expect(() => {
    TopologyBuilder.buildRingTopology(nodes);
  }).toThrow();
});
```

### 5.3 파라미터화된 테스트

동일한 로직에 다양한 입력값을 테스트하는 패턴을 사용합니다.

```typescript
// 파라미터화된 테스트 예시
it.concurrent.each([
  [1.0, 100, 100],
  [2.0, 100, 200],
  [0.5, 100, 50],
])(
  "시간 배율 %f에 경과 시간 %i ms에서 %i ms가 됨",
  (scale, elapsed, expected) => {
    // 테스트 코드
  }
);
```

## 6. 상호작용 흐름

1. `SimulationEngine`이 특정 간격으로 `tick()` 메서드 호출
2. 메시지 생성 및 `NetworkTopology`에 전달
3. `NetworkTopology`가 `Node`와 `NetworkLink` 업데이트
4. `NetworkLink`가 메시지 전송 처리 및 상태 업데이트
5. `Node`가 작업 처리 및 상태 업데이트
6. `Scene`이 현재 상태 캡처 및 UI에 발행
7. UI가 상태 변화 반영
