import { exec } from "child_process";

export type DiskInfo = {
    [device: string]: {
        size: string;
        used: string;
        available: string;
        use_precentage: string;
        mount_point: string;
    };
};

export type MemoryInfo = {
    [key: string]: {
        size: string;
        used: string;
        available: string;
        use_percentage: string;
        mount_point: string;
    };
};

export const diskSpace = (callback: (result: DiskInfo) => void): void => {
    const command = "df -h";
    const memory: DiskInfo = {};

    exec(command, (error, stdout, stderr) => {
        const rows = stdout.split("\n");
        rows.shift(); // rimuove l'intestazione

        rows.forEach((r) => {
            const r_split = r.trim().split(/\s+/);
            if (r_split && r_split[0]) {
                memory[r_split[0]] = {
                    size: r_split[1],
                    used: r_split[2],
                    available: r_split[3],
                    use_precentage: r_split[4],
                    mount_point: r_split[5],
                };
            }
        });

        callback(memory);
    });
};

export const ramSpace = (callback: (result: MemoryInfo) => void): void => {
    const command = "cat /proc/meminfo";
    const memory: MemoryInfo = {};

    exec(command, (error, stdout, stderr) => {
        const rows = stdout.split("\n");
        rows.forEach((r) => {
            const r_split = r.split(":");
            if (r_split[0] && r_split[1]) {
                memory[r_split[0].trim()] = r_split[1].trim();
            }
        });
        callback(memory);
    });
};

export const upTime = (callback: (result: string) => void): void => {
    const command = `awk '{print int($1/3600)" Ore, "int(($1%3600)/60)" Minuti, "int($1%60) " Secondi"}' /proc/uptime`;

    exec(command, (error, stdout, stderr) => {
        callback(stdout.trim());
    });
};