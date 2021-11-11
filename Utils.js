var spawn = require("child_process").spawn;
var exec = require('child_process').exec;

module.exports = {
    diskSpace: (callback) => {
        let command = "df -h";
        let memory = {};
        exec(command, function (error, stdout, stderr) {
            let rows = stdout.split("\n");
            rows.shift();
            rows.forEach((r) => {
                let r_split = r.split(/\s+/);
                //  console.log(r_split);
                if (r_split && r_split[0])
                    memory[r_split[0]] = {
                        size: r_split[1],
                        used: r_split[2],
                        available: r_split[3],
                        use_precentage: r_split[4],
                        mount_point: r_split[5],
                    }
            });
            callback(memory);
        });

    },
    ramSpace: (callback) => {

        let command = "cat /proc/meminfo"
        let memory = {};
        exec(command, function (error, stdout, stderr) {

            let rows = stdout.split("\n");
            rows.forEach((r) => {
                let r_split = r.split(":");
                if (r_split[0] && r_split[1])
                    memory[r_split[0].trim()] = r_split[1].trim();
            });
            callback(memory);

        });
    },

    upTime: (callback) => {
        // let command = "uptime | awk '{ print $3 }'";
        // let command = "cat /proc/uptime";
        let command = `awk '{print int($1/3600)" Ore, "int(($1%3600)/60)" Minuti, "int($1%60) " Secondi"} ' /proc/uptime`;
        exec(command, function (error, stdout, stderr) {
            // let time = stdout.split(" ")[0];
            // let hours = time / 3600;
            // let minutes = hours - Math.trunc(hours);
            // console.log(time, hours, minutes);
            callback(stdout);
        });
    },
}