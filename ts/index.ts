import { execSync } from "child_process";
import { convertToArray } from "oberknecht-utils";

export type pinOptions = (
  | {
      type: "input";
      pullUp?: boolean;
      pullDown?: boolean;
    }
  | {
      type: "output";
      value: boolean | 0 | 1;
    }
) & {
  noFunction: boolean;
};

export type getPinEntry = {
  type: "ip" | "op";
  state: 0 | 1;
};

export class oberknechtRPIO {
  static setGPIO(
    pin: number | number[] | string | string[],
    pinOptions: pinOptions
  ) {
    let cmdOptions = [];

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
      `pinctrl -p set GPIO${convertToArray(pin).join("GPIO")} ${cmdOptions.join(
        " "
      )}`
    ).toString();

    if (rcmd.split("\n").length > convertToArray(pin).length) {
      return Error(
        `Error(s) setting GPIO ${pin} with args ${cmdOptions.join(" ")}`,
        { cause: { rcmd } }
      );
    }

    return true;
  }

  static getGPIO(pin?: number): Record<string, getPinEntry> {
    let rcmd = execSync(`pinctrl -p get ${pin ? "GPIO" + pin : ""}`).toString();
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
  }
}
