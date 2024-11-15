export declare type pinOptions = ({
    type: "input";
    pullUp?: boolean;
    pullDown?: boolean;
} | {
    type: "output";
    value?: boolean | 0 | 1;
}) & {
    noFunction?: boolean;
};
export declare type getPinEntry = {
    type: "ip" | "op";
    state: 0 | 1;
};
export declare type mockCallbackType = {
    value: number;
    pinValue: number;
    pin: string;
    time: number;
};
export declare class oberknechtRPIO {
    constructor();
    setGPIO: (pin: number | number[] | string | string[], pinOptions: pinOptions) => boolean | Error;
    getGPIO: (pin?: string | number) => Record<string, getPinEntry>;
    mock: (pin: string, cb: (data: mockCallbackType) => {}) => void;
    unMock: (pin: string | number, cb: Function) => void;
}
