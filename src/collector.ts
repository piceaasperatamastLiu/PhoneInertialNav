// src/collector.ts

export type SensorData = {
    acceleration: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    timestamp: number;
};

type IMSensors = {
    accelerometer?: Accelerometer;
    gyroscope?: Gyroscope;
};

export type InitStatus = 'success' | 'not-supported' | 'error';

export class Collector {
    constructor() {
        this.sensors = {};
        this.sensorData = [];
    }

    async init(): Promise<InitStatus> {
        try {
            if (navigator.permissions) {
                await navigator.permissions.query({ name: 'accelerometer' } as any);
                await navigator.permissions.query({ name: 'gyroscope' } as any);
            }

            if (!('Accelerometer' in window) || !('Gyroscope' in window)) {
                console.warn('当前浏览器不支持 Accelerometer 或 Gyroscope');
                return 'not-supported';
            }

            this.sensors.accelerometer = new Accelerometer({ frequency: 60 });
            this.sensors.gyroscope = new Gyroscope({ frequency: 60 });

            this.sensors.accelerometer.addEventListener('reading', this.updateData.bind(this));
            this.sensors.gyroscope.addEventListener('reading', this.updateData.bind(this));

            if (this.sensors.accelerometer && this.sensors.gyroscope) {
                return 'success';
            } else {
                return 'error';
            }
        } catch (error) {
            console.error('初始化失败:', error);
            return 'error';
        }
    }

    private updateData(): void {
        const acc = this.sensors.accelerometer;
        const gyro = this.sensors.gyroscope;

        if (acc && gyro) {
            const data: SensorData = {
                acceleration: {
                    x: acc.x ?? 0,
                    y: acc.y ?? 0,
                    z: acc.z ?? 0,
                },
                rotation: {
                    x: gyro.x ?? 0,
                    y: gyro.y ?? 0,
                    z: gyro.z ?? 0,
                },
                timestamp: Date.now(),
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
}
