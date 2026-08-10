import type { Middleware } from "grammy";

import { ADMIN_COMMANDS } from "#root/bot/constants/admin-commands.js";
import type { Context } from "#root/bot/context.js";
import { isGroupAdmin } from "#root/bot/helpers/chat.js";

const ADMIN_COMMANDS_SET: ReadonlySet<string> = new Set(ADMIN_COMMANDS);

/**
 * Checks if current command is not an admin command
 *
 * @param currentCommand Text of command
 * @returns Check result of current command text
 */
export function isNotAdminCommand(currentCommand: string) {
    const validatedString = currentCommand
        .split("@") // In case: /help@someusername_bot
        .at(0);

    return !ADMIN_COMMANDS_SET.has(validatedString ?? "");
}

/**
 * Checks if current command is an admin one
 *
 * If it is, checks if user is an admin, otherwise skip execution.
 * If command is a regular one, continue
 */
export function checkForAdminCommand(): Middleware<Context> {
    return async (ctx, next) => {
        const botCommand = ctx.entities("bot_command").at(0);

        if (!botCommand) {
            return void (await next());
        }

        if (isNotAdminCommand(botCommand.text)) {
            return void (await next());
        }

        if (await isGroupAdmin(ctx)) {
            return void (await next());
        }
    };
}
