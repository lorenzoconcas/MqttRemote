require('dotenv').config(); // Carica le variabili dal file .env

module.exports = {
    apps: [
        {
            name: 'berry-mqtt-status',
            script: 'npm',
            args: `run start`,
            env: {
                MQTT_PORT: process.env.MQTT_PORT,
                MQTT_IP: process.env.MQTT_IP,
                NODE_ENV: 'production'
            }
        }
    ]
};