import { log } from "./logger.ts";
import MqttHandler from './MqttHandler.ts'
import config from "./configuration.ts";

const ip = process.env.MQTT_IP;
const port = process.env.MQTT_PORT
const connectionString = `mqtt://${ip}:${port}`


const printWelcome = () => {
    log("");
    log("========================================================================")
    log("Benvenuto in ServerMqttManager");
    log("Servizio avviato alle : " + new Date());
}

const init = async () => {
    printWelcome();
    ;
    var mqtthandler = new MqttHandler(connectionString, config);

    mqtthandler.connect()
}

init();