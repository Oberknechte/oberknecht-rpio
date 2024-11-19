"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oberknechtRPIO = void 0;
const child_process_1 = require("child_process");
const oberknecht_utils_1 = require("oberknecht-utils");
const j_1 = require("./variables/j");
const startMockListener_1 = require("./functions/startMockListener");
function detectPinCtrl() {
    try {
        (0, child_process_1.execSync)("pinctrl -h");
    }
    catch (e) {
        return console.error(`${(0, oberknecht_utils_1.stackName)("Oberknecht-RPIO")[2]} System not supported`);
    }
    j_1.j.systemSupported = true;
}
class oberknechtRPIO {
    constructor() { }
    emitter = j_1.j.emitter;
    init = () => {
        detectPinCtrl();
        if (j_1.j.systemSupported)
            (0, startMockListener_1.startMockListener)();
    };
    setGPIO = (pin, pinOptions) => {
        let cmdOptions = [];
        if (!j_1.j.systemSupported)
            return false;
        switch (pinOptions?.type) {
            case "input":
                {
                    cmdOptions.push("ip");
                    if (pinOptions.pullUp)
                        cmdOptions.push("pu");
                    if (pinOptions.pullDown)
                        cmdOptions.push("pd");
                }
                break;
            case "output":
                {
                    cmdOptions.push("op");
                    if ([true, 1].includes(pinOptions.value))
                        cmdOptions.push("dh");
                    else if ([false, 0].includes(pinOptions.value))
                        cmdOptions.push("dl");
                }
                break;
        }
        if (pinOptions.noFunction)
            cmdOptions.push("no");
        let rcmd = (0, child_process_1.execSync)(`pinctrl -p set ${(0, oberknecht_utils_1.convertToArray)(pin)} ${cmdOptions.join(" ")}`).toString();
        if (rcmd.split("\n").length > (0, oberknecht_utils_1.convertToArray)(pin).length) {
            return Error(`Error(s) setting GPIO ${pin} with args ${cmdOptions.join(" ")}`, { cause: { rcmd } });
        }
        return true;
    };
    getGPIO = (pin) => {
        if (!j_1.j.systemSupported)
            return {};
        let rcmd = (0, child_process_1.execSync)(`pinctrl -p get ${pin ?? ""}`).toString();
        let r = {};
        rcmd.split("\n").forEach((a) => {
            let b = a.trim();
            let pinMode = b.split(" ")[1];
            if (!["ip", "op"].includes(pinMode))
                return;
            let IOPin = b.split("//")[1].split("=")[0].trim();
            let pinState = b.split("|")[1].split("//")[0].trim() === "hi" ? 1 : 0;
            r[IOPin] = {
                type: pinMode,
                state: pinState,
            };
        });
        return r;
    };
    mock = (pin, cb) => {
        if (!j_1.j.mockListeners[pin])
            j_1.j.mockListeners[pin] = [];
        j_1.j.mockListeners[pin].push(cb);
        j_1.j.emitter.on(`gpioChange:${pin}`, cb);
    };
    unMock = (pin, cb) => {
        if (!j_1.j.mockListeners[pin])
            return;
        j_1.j.mockListeners[pin] = j_1.j.mockListeners[pin].filter((a) => a !== cb);
        j_1.j.emitter.removeListener(`gpioChange:${pin}`, cb);
    };
}
exports.oberknechtRPIO = oberknechtRPIO;
