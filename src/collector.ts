// src/collector.ts

export interface SensorSettings {
    frequency: number;
    removeGravity: boolean;
}

// 默认设置值
export const DEFAULT_SETTINGS: SensorSettings = {
    frequency: 60,
    removeGravity: false,
};

export type SensorData = {
    acceleration: { x: number; y: number; z: number };
    angularVelocity: { x: number; y: number; z: number };
    timestamp: number;
};

type IMSensors = {
    accelerometer?: Accelerometer | LinearAccelerationSensor;
    gyroscope?: Gyroscope;
};

export type InitStatus = 'success' | 'not-supported' | 'error';

export class Collector {
    constructor(sensorSettings: SensorSettings) {
        this.sensors = {};
        this.sensorData = [];
        this.sensorSettings = sensorSettings;
    }

    async init(): Promise<InitStatus> {
        try {
            if (navigator.permissions) {
                await navigator.permissions.query({ name: 'accelerometer' } as any);
                await navigator.permissions.query({ name: 'gyroscope' } as any);
            }

            if (this.sensorSettings.removeGravity) {
                if (!('Accelerometer' in window)) {
                    console.warn('当前浏览器不支持 Accelerometer');
                    return 'not-supported';
                }
            } else {
                if (!('LinearAccelerationSensor' in window)) {
                    console.warn('当前浏览器不支持 Accelerometer');
                    return 'not-supported';
                }
            }
            if (!('Gyroscope' in window)) {
                console.warn('当前浏览器不支持 Gyroscope');
                return 'not-supported';
            }

            if (this.sensorSettings.removeGravity) {
                this.sensors.accelerometer = new LinearAccelerationSensor({ frequency: this.sensorSettings.frequency });
            } else {
                this.sensors.accelerometer = new Accelerometer({ frequency: this.sensorSettings.frequency });
            }
            this.sensors.gyroscope = new Gyroscope({ frequency: this.sensorSettings.frequency });

            this.sensors.gyroscope.addEventListener('reading', this.updateData.bind(this));

            if (this.sensors.accelerometer &&
                this.sensors.gyroscope) {
                return 'success';
            } else {
                return 'error';
            }
        } catch (error) {
            console.error('初始化失败:', error);
            return 'error';
        }
    }

    private updateData(event: Event): void {
        const acc = this.sensors.accelerometer;
        const gyro = this.sensors.gyroscope;

        if (acc && gyro) {
            const data: SensorData = {
                acceleration: {
                    x: acc.x ?? 0,
                    y: acc.y ?? 0,
                    z: acc.z ?? 0,
                },
                angularVelocity: {
                    x: gyro.x ?? 0,
                    y: gyro.y ?? 0,
                    z: gyro.z ?? 0,
                },
                timestamp: event.timeStamp,
            };

            this.sensorData.push(data);
        }
    }

    public start(): void {
        const acc = this.sensors.accelerometer;
        const gyro = this.sensors.gyroscope;

        if (acc && gyro) {
            acc.start();
            gyro.start();
        } else {
            throw new Error('传感器未初始化，无法启动');
        }
    }

    public stop(): void {
        const acc = this.sensors.accelerometer;
        const gyro = this.sensors.gyroscope;

        if (acc && gyro) {
            acc.stop();
            gyro.stop();
        }
    }

    public data(): SensorData[] {
        return this.sensorData;
    }

    private sensors: IMSensors;
    private sensorData: SensorData[];
    private sensorSettings: SensorSettings;
}
