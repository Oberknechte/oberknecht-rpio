/// <reference types="node" />
import { ChildProcess } from "child_process";
import { oberknechtEmitter } from "oberknecht-emitters";
export declare class j {
    static systemSupported: boolean;
    static gpioPins: number;
    static gpioChip: string;
    static mockFireDelayMS: number;
    static emitter: oberknechtEmitter;
    static mockProcesses: Record<string, ChildProcess>;
    static mockProcess: ChildProcess;
    static mockListeners: Record<string, Function[]>;
    static pinStates: Record<string, {
        state: number;
        option: "pu" | "pd" | "nf";
    }>;
}
