"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DummyNode = void 0;
var DummyNode = /** @class */ (function () {
    function DummyNode() {
        this.value = 0.0;
    }
    // update 메서드는 deltaTime만큼 값을 증가시키며 상태 변화를 표현합니다.
    DummyNode.prototype.update = function (deltaTime) {
        this.value += deltaTime;
        console.log("DummyNode updated: value = ".concat(this.value.toFixed(4)));
    };
    return DummyNode;
}());
exports.DummyNode = DummyNode;
