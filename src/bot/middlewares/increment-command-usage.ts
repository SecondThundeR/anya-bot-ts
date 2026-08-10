import type { Middleware } from "grammy";

import { incrementCommandUsageQuery } from "#drizzle/prepared/commands-usage.js";
import { REGULAR_COMMANDS } from "#root/bot/constants/regular-commands.js";
import type { Context } from "#root/bot/context.js";

function extractCommandName(currentCommand?: string) {
    if (!currentCommand) return;

    return currentCommand
        .substring(1)
        .split("@") // In case: /help@someusername_bot
        .at(0);
}

/**
 * Increments command usage if all middlewares has been passed
 */
export function incrementCommandUsage(): Middleware<Context> {
    return async (ctx, next) => {
        const currentCommand = ctx.entities("bot_command").at(0);
        const extractedCommandName = extractCommandName(currentCommand?.text);

        await next();

        // Recorded after the handler so the statistics write never delays the
        // user's reply
        if (
            extractedCommandName &&
            REGULAR_COMMANDS.includes(`/${extractedCommandName}`)
        ) {
            await incrementCommandUsageQuery.execute({
                command: extractedCommandName,
            });
        }
    };
}
