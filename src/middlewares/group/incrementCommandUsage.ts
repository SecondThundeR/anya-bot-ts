import { Context, NextFunction } from "@/deps.ts";

import REGULAR_COMMANDS from "@/constants/regularCommands.ts";

import { RedisClient } from "@/database/redisClient.ts";

function extractCommandName(currentCommand?: string) {
    if (!currentCommand) return;

    return currentCommand
        .substring(1)
        .split("@") // In case: /help@someusername_bot
        .at(0)!;
}

/**
 * Increments command usage if all middlewares has been passed

 * @param ctx Context object for getting command data
 * @param next Callback for continuation of middleware flow
 */
async function incrementCommandUsage(ctx: Context, next: NextFunction) {
    const currentCommand = ctx.entities("bot_command").at(0);
    const extractedCommandName = extractCommandName(currentCommand?.text);

    if (
        extractedCommandName &&
        REGULAR_COMMANDS.includes(`/${extractedCommandName}`)
    ) {
        await RedisClient.incrementFieldByValue(
            "commandsUsage",
            extractedCommandName,
            1,
        );
    }

    await next();
}

export default incrementCommandUsage;
