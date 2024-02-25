import { Context, NextFunction } from "@/deps.ts";

import ADMIN_COMMANDS from "@/constants/adminCommands.ts";

import { isGroupAdmin } from "@/utils/asyncUtils.ts";

/**
 * Checks if current command is not an admin command
 *
 * @param currentCommand Text of command
 * @returns Check result of current command text
 */
function isNotAdminCommand(currentCommand: string) {
    const validatedString = currentCommand
        .split("@") // In case: /help@someusername_bot
        .at(0)!;
    const commandIndex = ADMIN_COMMANDS.findIndex((adminCommand) =>
        adminCommand === validatedString
    );

    return commandIndex === -1;
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

    if (!botCommand) {
        return void await next();
    }

    if (isNotAdminCommand(botCommand.text)) {
        return void await next();
    }

    if (await isGroupAdmin(ctx)) {
        return void await next();
    }
}

export default checkForAdminCommand;
