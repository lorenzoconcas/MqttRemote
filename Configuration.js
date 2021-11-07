var exec = require('child_process').exec;

const device = {
    "identifiers": "hass-berry",
    "manufacturer": "Raspberry Ltd",
    "model": "Rasberry PI 4",
    "name": "berry",
    "sw_version": "0.0.0.1+035"
};
var config = {
    device: device,
    "entities": [
        {
            state_handler: (request_type, data, callback) => { },
            state: "OFF",
            name: "spegni",
            deviceType: "switch",
            uuid: "4e8cb464-e2a9-48ee-9844-9376f499997a",
            icon: "mdi:refresh",

        },
        {
            state_handler: (request_type, data, callback) => { },
            state: "OFF",
            name: "accendi",
            deviceType: "switch",
            uuid: "4e8cb464-e2a9-48ee-9844-9376f494997b",
            icon: "mdi:refresh",

        },

        {
            state_handler: (request_type, data, callback) => {
                let command = "cat /sys/class/thermal/thermal_zone0/temp"
                exec(command, function(error, stdout, stderr){
                    var r  = parseInt(stdout) / 100;
                    console.log(r);
                   // calback(stdout); 
                });
             },
            state: 10,
            name: "tempcpu",
            deviceType: "sensor",
            uuid: "4e8cb464-e2a9-48ee-9844-9376f763497c",
            icon: "mdi:temperature-celsius",
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
        return data;
    }
};

module.exports = config;