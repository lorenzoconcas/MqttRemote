const {log, LOG_LEVEL} = require("./logger");
const mqtt = require('mqtt');


class MqttHandler {
    constructor(host, configuration, username = "", password = "") {
        this.configuration = configuration;
        this.mqttClient = null;

        this.host = host;
        this.username = username; // mqtt credentials if these are needed to connect
        this.password = password;

        log("Handler configured",LOG_LEVEL.INFO);

    }

    connect() {
        // Connect mqtt with credentials (in case of needed, otherwise we can omit 2nd param)
        this.mqttClient = mqtt.connect(this.host, { username: this.username, password: this.password });
        this.mqttClient['configuration'] = this.configuration;
        // Mqtt error calback
        this.mqttClient.on('error', (err) => {
            log(err);
            this.mqttClient.end();
        });

        // Connection callback
        this.mqttClient.on('connect', () => {
            log(`Connesso`);
            this.announce();
            this.updateAvailability();
            this.updateStatus();
        });
        this.updateAvailability = () => {
            this.configuration.entities.forEach((e => {
                let deviceTopic = this.configuration.getDeviceAvailabilityTopic(e);

                setInterval(() => {
                    log("Updating device avilability : " +JSON.stringify(deviceTopic));
                    this.mqttClient.publish(deviceTopic, "online");
                }, 3000);
            }));
        };
        this.updateStatus = () => {

            this.configuration.entities.forEach((e => {
                let deviceTopic = this.configuration.getDeviceStateTopic(e);
                let self = this;
                setInterval(() => {
                    log("Updating device avilability : " +JSON.stringify(deviceTopic));
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
                    log("Device announce : " +JSON.stringify(deviceData));
                    this.mqttClient.publish(
                        deviceTopic,
                        JSON.stringify(deviceData)
                    );
                }, 1);
            }));
        }

        // mqtt subscriptions
        log("Subscribed to mqtt topic # (tutti)")
        this.mqttClient.subscribe("#", { qos: 0 });

        // When a message arrives, log it
        this.mqttClient.on('message', function (topic, message) {
          
            let self = this;
            let r = new RegExp("homeassistant\/(.+)\/" + this.configuration.device.name + "\/(.+)\/(set)");

            var match = topic.match(r);
            if (match) {
                log("(match) New message on topic: "+ topic + " : "+ message);
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
                        if (data)
                            self.configuration.entities[indx].state = data;
                        
                    })
                }
            }
         
        });

        this.mqttClient.on('close', () => {
            log("Client Mqtt disconnected");
            log("Server closed at "+ new Date());
        });
    }

    // Sends a mqtt message to topic: mytopic
    sendMessage(message) {
        log("Message sent:" + message);
        this.mqttClient.publish(this.topic, message);
    }
}

module.exports = MqttHandler;
