var spawn = require("child_process").spawn;
var exec = require('child_process').exec;

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
                if(request_type == "set"){
                    const process = spawn("sh", ["-c", "echo lore | sudo -S bash -c 'poweroff'"]);
                }
             },
            state: "OFF",
            name: "SpegniOS",
            deviceType: "switch",
            uuid: "4e8cb464-e2a9-48ee-9844-9376f499997a",
            icon: "mdi:refresh",
            statusUpdateInterval,
        },

        {
            state_handler: (request_type, data, callback) => {
                let command = "cat /sys/class/thermal/thermal_zone0/temp"
                exec(command, function (error, stdout, stderr) {
                    var r = parseInt(stdout) / 1000;
                    callback(r);
                });
            },
            statusUpdateInterval: 5000,
            state: 10,
            name: "TemperaturaCPU",
            deviceType: "sensor",
            uuid: "4e8cb464-e2a9-48ee-9844-9376f763497c",
            icon: "mdi:temperature-celsius",
            customAttributes:[
                ["state_class", "total"],
                ["device_class", "temperature"]
            ]
        }
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
        if(d.customAttributes){
            d.customAttributes.forEach((e)=>{
                data[e[0]] = e[1];
            })
        }
        return data;
    }
};

module.exports = config;
