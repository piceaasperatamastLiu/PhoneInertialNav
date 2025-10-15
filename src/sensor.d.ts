declare class Accelerometer extends Sensor {
    x: number | null;
    y: number | null;
    z: number | null;
    constructor(options?: SensorOptions);
}

declare class LinearAccelerationSensor extends Sensor {
    x: number | null;
    y: number | null;
    z: number | null;
    constructor(options?: SensorOptions);
}

declare class AbsoluteOrientationSensor extends Sensor {
    x: number | null;
    y: number | null;
    z: number | null;
    constructor(options?: SensorOptions);
}

declare class Magnetometer extends Sensor {
    x: number | null;
    y: number | null;
    z: number | null;
    constructor(options?: SensorOptions);
}

declare class Gyroscope extends Sensor {
    x: number | null;
    y: number | null;
    z: number | null;
    constructor(options?: SensorOptions);
}

interface SensorOptions {
    frequency?: number;
}

declare class Sensor extends EventTarget {
    activated: boolean;
    hasReading: boolean;
    timestamp: DOMHighResTimeStamp;
    start(): void;
    stop(): void;
    onreading: (() => void) | null;
    onerror: ((event: Event) => void) | null;
}
