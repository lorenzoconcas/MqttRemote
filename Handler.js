
const mqtt = require('mqtt');


class MqttHandler {
    constructor(host, configuration, username = "", password = "") {
        this.configuration = configuration;
        this.mqttClient = null;

        this.host = host;
        this.username = username; // mqtt credentials if these are needed to connect
        this.password = password;

    }

    connect() {
        // Connect mqtt with credentials (in case of needed, otherwise we can omit 2nd param)
        this.mqttClient = mqtt.connect(this.host, { username: this.username, password: this.password });
        this.mqttClient['configuration'] = this.configuration;
        // Mqtt error calback
        this.mqttClient.on('error', (err) => {
            console.log(err);
            this.mqttClient.end();
        });

        // Connection callback
        this.mqttClient.on('connect', () => {
            console.log(`Connesso`);
            this.announce();
            this.updateAvailability();
            this.updateStatus();
        });
        this.updateAvailability = () => {
            this.configuration.entities.forEach((e => {
                let deviceTopic = this.configuration.getDeviceAvailabilityTopic(e);

                setInterval(() => {
                    this.mqttClient.publish(deviceTopic, "online");
                }, 3000);
            }));
        }
        this.updateStatus = () => {

            this.configuration.entities.forEach((e => {
                let deviceTopic = this.configuration.getDeviceStateTopic(e);
                let self = this;
                setInterval(() => {
                    e.state_handler("update", null, (data) => {
                        self.mqttClient.publish(deviceTopic, data.toString());

                    });
                    // this.mqttClient.publish(deviceTopic, e.state.toString());
                }, e.statusUpdateInterval);
            }));
        }
        this.announce = () => {

            this.configuration.entities.forEach((e => {
                let deviceTopic = this.configuration.getDeviceConfigTopic(e);
                let deviceData = this.configuration.getEntryConfig(e);
                
                setTimeout(() => {
                    this.mqttClient.publish(
                        deviceTopic,
                        JSON.stringify(deviceData)
                    );
                }, 1);
            }));
        }

        // mqtt subscriptions
        this.mqttClient.subscribe("#", { qos: 0 });

        // When a message arrives, console.log it
        this.mqttClient.on('message', function (topic, message) {
            let self = this;
            let r = new RegExp("homeassistant\/(.+)\/" + this.configuration.device.name + "\/(.+)\/(set)");

            var match = topic.match(r);
            if (match) {
                let entity_name = match[2];
                let indx = -1;
                let e = self.configuration.entities.find((e, index) => {
                    if (e.name === entity_name) {
                        indx = index;
                        return e;
                    }
                });
                if (e) {
                    e.state_handler("set", message, (data) => {
                        self.configuration.entities[indx].state = data;
                    })
                }
            }
            //    // if (topic == ) {
            //         console.log("COMANDO RICEVUTO", "->", message.toString());


            //     }




        });

        this.mqttClient.on('close', () => {
            console.log(`mqtt client disconnected`);
        });
    }

    // Sends a mqtt message to topic: mytopic
    sendMessage(message) {
        this.mqttClient.publish(this.topic, message);
    }
}

module.exports = MqttHandler;
