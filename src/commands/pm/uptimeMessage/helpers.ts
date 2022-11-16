import { process } from '@/deps.ts';

import otherMessages from '@/locale/otherMessages.ts';

/**
 * Helper function for uptimeFormat.
 * @param time - Time value to check for append
 * @returns String with appended zero, if
 * passed value is less then 10. Otherwise just argument as string
 */
const zeroAppender = (time: number): string => {
    if (time < 10) return `0${time}`;
    return String(time);
};

/**
 * Formats seconds from process.uptime() to HH:MM:SS
 * @param uptimeSeconds - Seconds from uptime function
 * @returns String with formatted seconds
 */
const uptimeFormat = (uptimeSeconds: number): string => {
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);
    return `${zeroAppender(hours)}:${zeroAppender(minutes)}:${
        zeroAppender(
            seconds,
        )
    }`;
};

/**
 * Gets uptime of process and returns formatted message for send
 * @returns Formatted string
 */
export const getUptimeMessage = (): string => {
    return `${otherMessages.uptimeMessage} <b>${
        uptimeFormat(
            process.uptime(),
        )
    }</b>`;
};
