import colors from "./colors.ts";
import fs from 'fs';


const options = {
    printLog: true,
    logFile: "./logs/logfile.txt",
    enabled: false
}

export type LogLevel = 'info' | 'warning' | 'error' | 'debug';


const logText = (level: LogLevel) => {
    switch (level) {
        case 'info': return "I:";
        case 'warning': return "W:";
        case 'error': return "E:";
        case 'debug': return "D:";
        default: return "";
    }
}

const decodeColor = (level: LogLevel) => {
    switch (level) {
        case 'warning': return colors.FgYellow;
        case 'error': return colors.FgRed;
        case 'debug': return colors.FgGreen;
        default: return "";
    }
};

const appendToFile = (msg: string) => {
    fs.appendFile(options.logFile, msg, function (err) {
        if (err) throw err;
    });
}

export const log = (message: any, level: LogLevel = 'info') => {
    const colorCode = decodeColor(level);
    const time = new Date().toISOString();
    if (typeof (message) === 'object') {
        message = JSON.stringify(message);
    }

    if (options.printLog) {
        console.log(colorCode, logText(level), "[" + time + "]", message, colors.FgWhite);
    }

}