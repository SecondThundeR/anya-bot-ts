// @deno-types="npm:@types/node"
import process from "node:process";

import otherMessages from "@/locales/otherMessages.ts";

function zeroAppender(time: number) {
    if (time < 10) return `0${time}`;
    return String(time);
}

function uptimeFormat(uptimeSeconds: number) {
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);
    return `${zeroAppender(hours)}:${zeroAppender(minutes)}:${
        zeroAppender(
            seconds,
        )
    }`;
}

export function getUptimeMessage() {
    return `${otherMessages.uptimeMessage} <b>${
        uptimeFormat(
            process.uptime(),
        )
    }</b>`;
}
