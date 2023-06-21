import { Context, NextFunction } from "@/deps.ts";

import AdminCommands from "@/constants/adminCommands.ts";

import { isGroupAdmin } from "@/utils/asyncUtils.ts";

/**
 * Checks if current command is an admin command
 *
 * @param currentCommand Text of command
 * @returns Check result of current command text
 */
function isAdminCommand(currentCommand: string) {
    const validatedString = currentCommand
        .split("@") // In case: /help@someusername_bot
        .at(0)!;
    return AdminCommands.findIndex((adminCommand) =>
        adminCommand === validatedString
    ) !== -1;
}

/**
 * Checks if current command is an admin one
 *
 * If it is, checks if user is an admin, otherwise skip execution.
 * If command is a regular one, continue
 * @param ctx Context object for getting chat data
 * @param next Callback for continuation of middleware flow
 */
async function checkForAdminCommand(ctx: Context, next: NextFunction) {
    const botCommand = ctx.entities("bot_command").at(0);
    if (botCommand === undefined) {
        await next();
        return;
    }

    if (!isAdminCommand(botCommand.text)) {
        await next();
        return;
    }

    if (await isGroupAdmin(ctx)) {
        await next();
        return;
    }

    return;
}

export default checkForAdminCommand;
