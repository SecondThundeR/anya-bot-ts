import { Context, NextFunction } from "@/deps.ts";

import redisClient from "@/database/redisClient.ts";

function extractCommandName(currentCommand: string) {
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

    if (currentCommand !== undefined) {
        await redisClient.incrementFieldByValue(
            "commandsUsage",
            extractCommandName(currentCommand.text),
            1,
        );
    }

    await next();
}

export default incrementCommandUsage;
