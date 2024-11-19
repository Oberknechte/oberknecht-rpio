import { ChildProcess } from "child_process";
import { oberknechtEmitter } from "oberknecht-emitters";

export class j {
  static systemSupported = false;
  static gpioPins = 28;
  static gpioChip = "gpiochip0";
  static mockFireDelayMS = 1;
  static emitter = new oberknechtEmitter();

  static mockProcesses: Record<string, ChildProcess> = {};
  static mockProcess: ChildProcess;
  static mockListeners: Record<string, Function[]> = {};
  static pinStates: Record<
    string,
    { state: number; option: "pu" | "pd" | "nf" }
  > = {};
  static stdOutNum = 0;
}
