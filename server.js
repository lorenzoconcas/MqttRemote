#!/usr/bin/env node

//first written : Nov 2021

const MqttHandler = require('./Handler.js');
const config = require("./Configuration");
const { log } = require("./logger");
const IP = '127.0.0.1'; //'192.168.100.0'; //'localhost'; 
const PORT = 1883;
const connectionString = 'mqtt://' + IP + ':' + PORT;

var args = process.argv.slice(2);
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

var init = async () => {
    let cooldown = 0;
    if (args[0] = "auto") {
        console.log("wait "+ cooldown + " secs");
        await sleep(cooldown * 1000);
    }
    log("");
    log("========================================================================")
    log("Welcome to MqttRemote");
    log("Service started at : " + new Date());

    var mqtthandler = new MqttHandler(connectionString, config);
    mqtthandler.connect()
}

init()
