const MqttHandler = require('./Handler.js');
const config = require("./Configuration");

console.log("Welcome to ServerMqttManager")
const IP = '192.168.100.0'; //'localhost'; 
const PORT = 1883;
const connectionString = 'mqtt://'+IP+':'+PORT;
var mqtthandler = new MqttHandler(connectionString, config);

mqtthandler.connect()
