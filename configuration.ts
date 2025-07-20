import { spawn, exec } from "child_process";
import * as utils from "./utils.ts";
import { log } from "./logger.ts";

export interface Entity {
    name: string;
    uuid: string;
    deviceType: "sensor" | "switch";
    icon: string;
    statusUpdateInterval: number;
    state: any;
    customAttributes?: [string, string][];
    state_handler: (
        request_type: "set" | "update",
        data: Buffer | null,
        callback: (result: any) => void
    ) => void;
}

export interface Configuration {
    device: {
        identifiers: string;
        manufacturer: string;
        model: string;
        name: string;
        sw_version: string;
    };
    entities: Entity[];
    getDeviceConfigTopic: (d: Entity) => string;
    getDeviceStateTopic: (d: Entity) => string;
    getDeviceComandTopic: (d: Entity) => string;
    getDeviceAvailabilityTopic: (d: Entity) => string;
    getEntryConfig: (d: Entity) => any;
}

const device = {
    identifiers: "hass-berry",
    manufacturer: "Raspberry Ltd",
    model: "Rasberry PI 5",
    name: "berry",
    sw_version: "0.0.0.1+036"
};

const statusUpdateInterval = 2000;

const config: Configuration = {
    device,
    entities: [
        {
            state_handler: (request_type, data, callback) => {
                if (request_type === "set") {
                    spawn("sh", ["-c", "echo lore | sudo -S bash -c 'poweroff'"]);
                }
            },
            state: "OFF",
            name: "SpegniOS",
            deviceType: "switch",
            uuid: "4e8cb464-e2a9-48ee-9844-9376f499997a",
            icon: "mdi:power",
            statusUpdateInterval,
        },
        {
            state_handler: (request_type, data, callback) => {
                const command = "cat /sys/class/thermal/thermal_zone0/temp";
                exec(command, (error, stdout) => {
                    const r = parseInt(stdout) / 1000;
                    callback(Math.round((r + Number.EPSILON) * 100) / 100);
                });
            },
            statusUpdateInterval: 5000,
            state: 10,
            name: "TemperaturaCPU",
            deviceType: "sensor",
            uuid: "4e8cb464-e2a9-48ee-9844-9376f763497c",
            icon: "mdi:temperature-celsius",
            customAttributes: [
                ["state_class", "total"],
                ["device_class", "temperature"],
                ["unit_of_measurement", "°C"]
            ]
        },
        {
            state_handler: (request_type, data, callback) => {
                if (request_type === "set") {
                    console.log("Requested program exit");
                    process.exit(0);
                }
            },
            statusUpdateInterval: 5000,
            state: 10,
            name: "ChiudiMqttSender",
            deviceType: "switch",
            uuid: "4e8cb464-e2a9-48ee-9844-9376f763497d",
            icon: "mdi:eject"
        },
        {
            state_handler: async (request_type, data, callback) => {
                utils.ramSpace((memory: Record<string, string>) => {
                    const avail = memory["MemAvailable"].toString().replace("kB", "");
                    const total = memory["MemTotal"].toString().replace("kB", "");
                    const free_mem_percentage = parseInt(avail) * 100 / parseInt(total);
                    callback(Math.round((free_mem_percentage + Number.EPSILON) * 100) / 100);
                });
            },
            statusUpdateInterval: 5000,
            state: 10,
            name: "RamLibera",
            deviceType: "sensor",
            uuid: "4e8cb464-e2a9-48ee-9844-9376f763497e",
            icon: "mdi:memory"
        },
        {
            state_handler: (request_type, data, callback) => {
                utils.upTime((value: any) => {
                    callback(value);
                });
            },
            statusUpdateInterval: 5000,
            state: 10,
            name: "UpTime",
            deviceType: "sensor",
            uuid: "4e8cb464-e2a9-48ee-9844-9376f763497g",
            icon: "mdi:clock"
        },
        {
            state_handler: (request_type, data, callback) => {

                utils.diskSpace((memory) => {
                    log(memory['/dev/mmcblk0p1'], 'debug')
                    callback(memory['/dev/mmcblk0p1'].use_precentage)
                });


            },
            statusUpdateInterval: 5000,
            state: "0%",
            name: "SpazioDisco",
            deviceType: "sensor",
            uuid: "4e8cb464-e2a9-48ee-9844-9376f763497f",
            icon: "mdi:memory",

        },
    ],
    getDeviceConfigTopic: (d) => {
        return `homeassistant/${d.deviceType}/${device.name}/${d.name}/config`;
    },
    getDeviceStateTopic: (d) => {
        return `homeassistant/${d.deviceType}/${device.name}/${d.name}/state`;
    },
    getDeviceComandTopic: (d) => {
        return `homeassistant/${d.deviceType}/${device.name}/${d.name}/set`;
    },
    getDeviceAvailabilityTopic: (d) => {
        return `homeassistant/${d.deviceType}/${device.name}/availability`;
    },
    getEntryConfig: (d) => {
        const type = d.deviceType;
        const name = d.name;

        const base = {
            availability_topic: `homeassistant/${type}/${device.name}/availability`,
            icon: d.icon,
            unique_id: d.uuid,
            device,
            name,
            state_topic: `homeassistant/${type}/${device.name}/${name}/state`,
            platform: "mqtt",
        };

        if (type === "switch") {
            (base as any).command_topic = `homeassistant/${type}/${device.name}/${name}/set`;
        }

        if (d.customAttributes) {
            d.customAttributes.forEach(([key, value]) => {
                (base as any)[key] = value;
            });
        }

        return base;
    }
};

export default config;