"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mock = mock;
const j_1 = require("../variables/j");
function mock(pin) {
    if (j_1.j.mockProcesses[pin])
        return;
}
