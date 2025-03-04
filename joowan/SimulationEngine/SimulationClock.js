"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimulationClock = void 0;
var SimulationClock = /** @class */ (function () {
    function SimulationClock() {
        this.lastTick = Date.now();
        this.simulationTime = 0.0;
    }
    // tick() 메서드는 지난 틱(Delta Time)을 계산하고 시뮬레이션 시간을 업데이트합니다.
    SimulationClock.prototype.tick = function () {
        var now = Date.now();
        var delta = now - this.lastTick; // 밀리초 단위
        this.lastTick = now;
        var deltaSeconds = delta / 1000; // 초 단위 변환
        this.simulationTime += deltaSeconds;
        return deltaSeconds;
    };
    // 현재 시뮬레이션 시간 반환 (초 단위)
    SimulationClock.prototype.currentTime = function () {
        return this.simulationTime;
    };
    return SimulationClock;
}());
exports.SimulationClock = SimulationClock;
