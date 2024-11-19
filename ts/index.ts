import { execSync } from "child_process";
import { convertToArray, stackName } from "oberknecht-utils";
import { oberknechtEmitter } from "oberknecht-emitters";
import { j } from "./variables/j";
import { startMockListener } from "./functions/startMockListener";

export type pinOptions = (
  | {
      type: "input";
      pullUp?: boolean;
      pullDown?: boolean;
    }
  | {
      type: "output";
      value?: boolean | 0 | 1;
    }
) & {
  noFunction?: boolean;
};

export type getPinEntry = {
  type: "ip" | "op";
  state: 0 | 1;
};

export type mockCallbackType = {
  value: number;
  pinValue: number;
  pin: string;
  time: number;
};

function detectPinCtrl() {
  try {
    execSync("pinctrl -h");
  } catch (e) {
    return console.error(
      `${stackName("Oberknecht-RPIO")[2]} System not supported`
    );
  }

  j.systemSupported = true;
}

export class oberknechtRPIO {
  constructor() {}

  emitter: oberknechtEmitter = j.emitter;

  init = () => {
    detectPinCtrl();
    if (j.systemSupported) startMockListener();
  };

  setGPIO = (
    pin: number | number[] | string | string[],
    pinOptions: pinOptions
  ) => {
    let cmdOptions = [];

    if (!j.systemSupported) return false;

    switch (pinOptions?.type) {
      case "input":
        {
          cmdOptions.push("ip");

          if (pinOptions.pullUp) cmdOptions.push("pu");
          if (pinOptions.pullDown) cmdOptions.push("pd");
        }
        break;

      case "output":
        {
          cmdOptions.push("op");

          if ([true, 1].includes(pinOptions.value)) cmdOptions.push("dh");
          else if ([false, 0].includes(pinOptions.value)) cmdOptions.push("dl");
        }
        break;
    }

    if (pinOptions.noFunction) cmdOptions.push("no");

    let rcmd = execSync(
      `pinctrl -p set ${convertToArray(pin)} ${cmdOptions.join(" ")}`
    ).toString();

    if (rcmd.split("\n").length > convertToArray(pin).length) {
      return Error(
        `Error(s) setting GPIO ${pin} with args ${cmdOptions.join(" ")}`,
        { cause: { rcmd } }
      );
    }

    return true;
  };

  getGPIO = (pin?: string | number): Record<string, getPinEntry> => {
    if (!j.systemSupported) return {};

    let rcmd = execSync(`pinctrl -p get ${pin ?? ""}`).toString();
    let r: Record<string, getPinEntry> = {};

    rcmd.split("\n").forEach((a) => {
      let b = a.trim();
      let pinMode = b.split(" ")[1];

      if (!["ip", "op"].includes(pinMode)) return;

      let IOPin = b.split("//")[1].split("=")[0].trim();
      let pinState = b.split("|")[1].split("//")[0].trim() === "hi" ? 1 : 0;

      r[IOPin] = {
        type: pinMode as getPinEntry["type"],
        state: pinState as getPinEntry["state"],
      };
    });

    return r;
  };

  mock = (pin: string, cb: (data: mockCallbackType) => {}) => {
    if (!j.mockListeners[pin]) j.mockListeners[pin] = [];
    j.mockListeners[pin].push(cb);

    j.emitter.on(`gpioChange:${pin}`, cb);
  };

  unMock = (pin: string | number, cb: Function) => {
    if (!j.mockListeners[pin]) return;

    j.mockListeners[pin] = j.mockListeners[pin].filter((a) => a !== cb);
    j.emitter.removeListener(`gpioChange:${pin}`, cb);
  };
}
