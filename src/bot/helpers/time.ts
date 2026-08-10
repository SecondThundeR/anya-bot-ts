import process from "node:process";

import type { Context } from "#root/bot/context.js";

export async function asyncTimeout(ms: number) {
    return await new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

/**
 * Returns time number as string
 *
 * If number is less than 10, append zero to the beginning
 *
 * @param time Number representation of time (hours, minutes, seconds)
 * @returns Formatted time number as string
 */
function timeToString(time: number) {
    if (time < 10) return `0${time}`;
    return String(time);
}

/**
 * Returns formatted seconds of uptime as `hh:mm:ss` representation
 *
 * @param uptimeSeconds Number of seconds of bot's process uptime
 * @returns Formatted representation of uptime
 */
function getFormattedUptime(uptimeSeconds: number) {
    const hours = timeToString(Math.floor(uptimeSeconds / 3600));
    const minutes = timeToString(Math.floor((uptimeSeconds % 3600) / 60));
    const seconds = timeToString(Math.floor(uptimeSeconds % 60));
    return `${hours}:${minutes}:${seconds}`;
}

/**
 * Returns message string for uptime command
 *
 * @param ctx Context object for translations
 * @returns String with formatted uptime and locale string
 */
export function getUptimeMessage(ctx: Context) {
    const formattedTime = getFormattedUptime(process.uptime());
    return `${ctx.t("otherMessages.uptimeMessage")} <b>${formattedTime}</b>`;
}
