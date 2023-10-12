const TerminalColors = require("./ConsoleColors");
const fs = require('fs');

_options = {
    printLog: true,
    logFile: "./logs/logfile.txt",
    enabled: false,
}
const LOG_LEVEL = {
    "INFO": ["I:", 0],
    "WARNING": ["W:", 1],
    "ERROR": ["E:", 2],
    "DEBUG": ["D:", 3],
};
const decodeColor = (level) => {
    if (!level) return "";
    switch (level[1]) {
        case 1: return TerminalColors.FgYellow;
        case 2: return TerminalColors.FgRed;
        case 3: return TerminalColors.FgGreen;
        default: return "";
    }
};
const appendToFile = (msg) => {

    fs.appendFile(_options.logFile, msg, function (err) {
        if (err) throw err;
    });

}

module.exports = {
    set: (options) => {
        _options = options;
        return true;
    },

    log: (message, logLevel) => {
        var colorCode = decodeColor(logLevel)
        var time = new Date().toISOString();
        if (typeof (message) == "object")
            message = JSON.stringify(message);

        if (!logLevel) {
            return 0;
            logLevel = ["U:", "-1"]
        }
        if (_options.printLog) {
            console.log(colorCode, logLevel[0], "[" + time + "]", message, TerminalColors.FgWhite); //l'ultimo parametro ripristina il colore del terminale
        }
        if (_options.enabled) {
            var msg = colorCode + " " + logLevel[0] + " [" + time + "] " + message + "\n";
            appendToFile(msg);
        }

    },
    LOG_LEVEL
}
