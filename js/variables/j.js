"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.j = void 0;
const oberknecht_emitters_1 = require("oberknecht-emitters");
class j {
    static systemSupported = false;
    static gpioPins = 28;
    static gpioChip = "gpiochip0";
    static mockFireDelayMS = 1;
    static emitter = new oberknecht_emitters_1.oberknechtEmitter();
    static mockProcesses = {};
    static mockProcess;
    static mockListeners = {};
    static pinStates = {};
}
exports.j = j;
