import process from "node:process";

import otherMessages from "@locale/otherMessages";

const zeroAppender = (time: number): string => {
    if (time < 10) return `0${time}`;
    return String(time);
};

const uptimeFormat = (uptimeSeconds: number): string => {
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);
    return `${zeroAppender(hours)}:${zeroAppender(minutes)}:${zeroAppender(
        seconds
    )}`;
};

export const getUptimeMessage = (): string => {
    return `${otherMessages.uptimeMessage} <b>${uptimeFormat(
        process.uptime()
    )}</b>`;
};
