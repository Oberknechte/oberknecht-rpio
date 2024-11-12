"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oberknechtRPIO = void 0;
const child_process_1 = require("child_process");
const oberknecht_utils_1 = require("oberknecht-utils");
class oberknechtRPIO {
    static setGPIO(pin, pinOptions) {
        let cmdOptions = [];
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
        let rcmd = (0, child_process_1.execSync)(`pinctrl -p set GPIO${(0, oberknecht_utils_1.convertToArray)(pin).join("GPIO")} ${cmdOptions.join(" ")}`).toString();
        if (rcmd.split("\n").length > (0, oberknecht_utils_1.convertToArray)(pin).length) {
            return Error(`Error(s) setting GPIO ${pin} with args ${cmdOptions.join(" ")}`, { cause: { rcmd } });
        }
        return true;
    }
    static getGPIO(pin) {
        let rcmd = (0, child_process_1.execSync)(`pinctrl -p get ${pin ? "GPIO" + pin : ""}`).toString();
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
    }
}
exports.oberknechtRPIO = oberknechtRPIO;
