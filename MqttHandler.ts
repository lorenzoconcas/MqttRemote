import mqtt, { MqttClient } from 'mqtt';
import { log } from './logger.ts';
import type { Configuration } from './configuration.ts';

interface Entity {
    name: string;
    statusUpdateInterval: number;
    state: any;
    state_handler: (action: 'update' | 'set', payload: Buffer | null, callback: (data: any) => void) => void;
}


export default class MqttHandler {
    private host: string;
    private username: string;
    private password: string;
    private configuration: Configuration;
    private mqttClient: MqttClient | null = null;
    private topic: string = 'mytopic';

    constructor(host: string, configuration: Configuration, username: string = "", password: string = "") {
        this.host = host;
        this.configuration = configuration;
        this.username = username;
        this.password = password;

        log("Handler Configurato", 'info');
    }

    connect(): void {
        log(`Connecting to ${this.host}`, 'debug')
        this.mqttClient = mqtt.connect(this.host, {
            username: this.username,
            password: this.password
        });

        // @ts-ignore: estensione custom
        this.mqttClient['configuration'] = this.configuration;

        this.mqttClient.on('error', (err) => {
            log(err);
            this.mqttClient?.end();
        });

        this.mqttClient.on('connect', () => {
            log(`Connesso`);
            this.announce();
            this.updateAvailability();
            this.updateStatus();
        });

        this.mqttClient.on('message', (topic, message) => {
            const self = this;
            const r = new RegExp(`homeassistant/(.+)/${this.configuration.device.name}/(.+)/set`);
            const match = topic.match(r);

            if (match) {
                log(`(match) Nuovo messaggio sul topic : ${topic} : ${message}`);
                const entity_name = match[2];
                let indx = -1;

                const e = self.configuration.entities.find((entity, index) => {
                    if (entity.name === entity_name) {
                        indx = index;
                        return true;
                    }
                    return false;
                });

                if (e) {
                    e.state_handler("set", message, (data) => {
                        if (data) {
                            self.configuration.entities[indx].state = data;
                        }
                    });
                }
            }
        });

        this.mqttClient.on('close', () => {
            log("Client Mqtt disconnesso");
            log("Server closed at " + new Date());
        });

        log("Sottoscritto al topic # (tutti)");
        this.mqttClient.subscribe("#", { qos: 0 });
    }

    private updateAvailability(): void {
        this.configuration.entities.forEach((e) => {
            const deviceTopic = this.configuration.getDeviceAvailabilityTopic(e);

            setInterval(() => {
                log("Aggiornamento disponibilità del dispositivo : " + JSON.stringify(deviceTopic));
                this.mqttClient?.publish(deviceTopic, "online");
            }, 3000);
        });
    }

    private updateStatus(): void {
        this.configuration.entities.forEach((e) => {
            const deviceTopic = this.configuration.getDeviceStateTopic(e);
            const self = this;

            setInterval(() => {
                log("Aggiornamento stato del dispositivo : " + JSON.stringify(deviceTopic));
                e.state_handler("update", null, (data) => {
                    self.mqttClient?.publish(deviceTopic, data.toString());
                });
            }, e.statusUpdateInterval);
        });
    }

    private announce(): void {
        this.configuration.entities.forEach((e) => {
            const deviceTopic = this.configuration.getDeviceConfigTopic(e);
            const deviceData = this.configuration.getEntryConfig(e);

            setTimeout(() => {
                log("Annuncio del dispositivo : " + JSON.stringify(deviceData));
                this.mqttClient?.publish(deviceTopic, JSON.stringify(deviceData));
            }, 1);
        });
    }

    sendMessage(message: string): void {
        log("Inviato messaggio" + message);
        this.mqttClient?.publish(this.topic, message);
    }
}