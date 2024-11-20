"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startMockListener = void 0;
const child_process_1 = require("child_process");
const j_1 = require("../variables/j");
let lastStates = {};
let mockTimeouts = {};
function fireMockDelay(pin, stdNum) {
    // console.log("fire mock delay", pin);
    if (mockTimeouts[pin])
        mockTimeouts[pin].refresh();
    else
        mockTimeouts[pin] = setTimeout(() => {
            fireMockOutput(pin, stdNum);
        }, j_1.j.mockFireDelayMS);
}
function fireMockOutput(pin, stdNum) {
    let pinDat = j_1.j.pinStates[pin];
    let value = lastStates[pin].value;
    if (value === j_1.j.pinStates[pin]?.state)
        return;
    // @ts-expect-error
    if (!j_1.j.pinStates[pin])
        j_1.j.pinStates[pin] = {};
    j_1.j.pinStates[pin].state = value;
    if (pinDat?.option === "pu")
        value = value === 1 ? 0 : 1;
    //   0 = falling, 1 = rising
    // console.log("mock fire", pin, value);
    j_1.j.emitter.emit(["gpioChange", `gpioChange:${pin}`], {
        value: value,
        pinValue: value,
        pin: pin,
        stdNum: stdNum(),
    });
}
function startMockListener() {
    // j.mockProcess = exec(
    //   `gpiomon -fr --format="%o;%e;%s.%n" ${j.gpioChip} ${[...Array(j.gpioPins)]
    //     .map((a, i) => i)
    //     .join(" ")}`
    // );
    j_1.j.mockProcess = (0, child_process_1.exec)(`pinctrl -p poll ${[...Array(j_1.j.gpioPins)]
        .map((a, i) => "GPIO" + i)
        .join(",")}`);
    j_1.j.mockProcess.stdout.setEncoding("utf8");
    j_1.j.mockProcess.on("error", (e) => {
        console.error(e);
    });
    let stdOutNum = -1;
    j_1.j.mockProcess.stdout.on("data", (stdouts) => {
        let msgUpdates = {};
        stdouts.split("\n").forEach((stdout) => {
            if (!stdout || stdout.length === 0)
                return;
            if (/\+\d+us/.test(stdout)) {
                // let delay = parseInt(stdout.match(/\d+/)[0]);
                return;
            }
            let pinValue = stdout.split(":")[1].split("//")[0].trim();
            let pin = stdout.split("//")[1].trim();
            let value = pinValue === "hi" ? 1 : 0;
            lastStates[pin] = { value: value, timestamp: Date.now() };
            msgUpdates[pin] = lastStates[pin];
        });
        Object.keys(msgUpdates).forEach((pin) => {
            fireMockDelay(pin, () => {
                return stdOutNum;
            });
        });
        stdOutNum++;
    });
}
exports.startMockListener = startMockListener;
