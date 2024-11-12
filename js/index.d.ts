export declare type pinOptions = ({
    type: "input";
    pullUp?: boolean;
    pullDown?: boolean;
} | {
    type: "output";
    value: boolean | 0 | 1;
}) & {
    noFunction: boolean;
};
export declare type getPinEntry = {
    type: "ip" | "op";
    state: 0 | 1;
};
export declare class oberknechtRPIO {
    static setGPIO(pin: number | number[] | string | string[], pinOptions: pinOptions): true | Error;
    static getGPIO(pin?: number): Record<string, getPinEntry>;
}
