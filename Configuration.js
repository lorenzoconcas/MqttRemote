var spawn = require("child_process").spawn;
var exec = require('child_process').exec;
var utils = require("./Utils");

//change if not a raspberry pi 4
const device = {
    "identifiers": "hass-berry",
    "manufacturer": "Raspberry Ltd",
    "model": "Rasberry PI 4",
    "name": "berry",
    "sw_version": "0.0.0.1+035"
};
const statusUpdateInterval = 2000;
var config = {
    device: device,
    "entities": [
        {
            state_handler: (request_type, data, callback) => {
                if (request_type == "set") {
                    const process = spawn("sh", ["-c", "echo lore | sudo -S bash -c 'poweroff'"]);
                }
            },
            state: "OFF",
            name: "TurnSystemOff",
            deviceType: "switch",
            uuid: "4e8cb464-e2a9-48ee-9844-9376f499997a",
            icon: "mdi:power",
            statusUpdateInterval,
        },

        {
            state_handler: (request_type, data, callback) => {
                let command = "cat /sys/class/thermal/thermal_zone0/temp"
                exec(command, function (error, stdout, stderr) {
                    var r = parseInt(stdout) / 1000;
                    callback(Math.round((r + Number.EPSILON) * 100) / 100);
                });
            },
            statusUpdateInterval: 5000,
            state: 10,
            name: "CPU Temperature",
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
                if (request_type == "set") {
                    console.log("Requested program exit");
                    process.exit(0);
                }
            },
            statusUpdateInterval: 5000,
            state: 10,
            name: "CloseMqttRemote",
            deviceType: "switch",
            uuid: "4e8cb464-e2a9-48ee-9844-9376f763497d",
            icon: "mdi:eject",

        },
        {
            state_handler: async (request_type, data, callback) => {
                // let command = "cat /proc/meminfo"
                // let memory = {};
                // exec(command, function (error, stdout, stderr) {
                //     let rows = stdout.split("\n");
                //     rows.forEach((r) => {
                //         let r_split = r.split(":");
                //         if (r_split[0] && r_split[1])
                //             memory[r_split[0].trim()] = r_split[1].trim();
                //     });
                //     let free_mem_percentage = parseInt(memory['MemAvailable'].replace("kB")) * 100 / parseInt(memory['MemTotal'].replace("kB"));
                //     //console.log(free_mem_percentage);
                //     callback(Math.round((free_mem_percentage + Number.EPSILON) * 100) / 100);
                // });

                utils.ramSpace((memory) => {
                    let avail = memory['MemAvailable'].toString().replace("kB", "");
                    let total = memory['MemTotal'].toString().replace("kB", "");
                    let free_mem_percentage = parseInt(avail) * 100 / parseInt(total);
                    //console.log(free_mem_percentage);
                    callback(Math.round((free_mem_percentage + Number.EPSILON) * 100) / 100);

                });
            },

            statusUpdateInterval: 5000,
            state: 10,
            name: "FreeRam",
            deviceType: "sensor",
            uuid: "4e8cb464-e2a9-48ee-9844-9376f763497e",
            icon: "mdi:memory",

        }, {
            state_handler: (request_type, data, callback) => {
            
                utils.diskSpace((memory)=>{
                    callback(memory['/dev/sda2'].use_precentage.replace("%", ""))
                });
            

            },
            statusUpdateInterval: 5000,
            state: 10,
            name: "DiskSpace",
            deviceType: "sensor",
            uuid: "4e8cb464-e2a9-48ee-9844-9376f763497f",
            icon: "mdi:memory",

        },{
            state_handler: (request_type, data, callback) => {
            
                utils.upTime((value)=>{
                    callback(value)
                });
            

            },
            statusUpdateInterval: 5000,
            state: 10,
            name: "UpTime",
            deviceType: "sensor",
            uuid: "4e8cb464-e2a9-48ee-9844-9376f763497g",
            icon: "mdi:clock",

        },
    ],
    getDeviceConfigTopic: (d) => {
        return "homeassistant/" + d.deviceType + "/" + device.name + "/" + d.name + "/config";
    },
    getDeviceStateTopic: (d) => {
        return "homeassistant/" + d.deviceType + "/" + device.name + "/" + d.name + "/state";
    },
    getDeviceComandTopic: (d) => {
        return "homeassistant/" + d.deviceType + "/" + device.name + "/" + d.name + "/set";
    },
    getDeviceAvailabilityTopic: (d) => {
        return "homeassistant/" + d.deviceType + "/" + device.name + "/availability";
    },
    getEntryConfig: (d) => {
        let deviceName = device.name;
        let type = d.deviceType;
        let name = d.name;
        let data = {
            "availability_topic": "homeassistant/" + type + "/" + deviceName + "/availability",

            "icon": d.icon,
            "unique_id": d.uuid,
            "device": device,
            "name": name,
            "state_topic": "homeassistant/" + type + "/" + deviceName + "/" + name + "/state",
            "platform": "mqtt"
        }
        if (type == "switch")
            data["command_topic"] = "homeassistant/" + type + "/" + deviceName + "/" + name + "/set";
        if (d.customAttributes) {
            d.customAttributes.forEach((e) => {
                data[e[0]] = e[1];
            })
        }
        return data;
    }
};

module.exports = config;
