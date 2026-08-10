import type { Middleware } from "grammy";

import type { Context } from "#root/bot/context.js";
import { isChatWhitelisted } from "#root/bot/helpers/chat.js";

/**
 * Checks if help command was triggered in current context object
 *
 * @param ctx Context object for getting bot command data
 * @returns True if help command triggered, False - otherwise
 */
function isHelpCommandTriggered(ctx: Context) {
    const helpCommand = ctx.entities("bot_command").at(0);
    return helpCommand?.text === "/help";
}

/**
 * Checks if bot was added in chat
 *
 * @param ctx Context object to get info about new chat members
 * @returns True if bot was added, False otherwise
 */
function isBotAddedInChat(ctx: Context) {
    return (
        ctx.message?.new_chat_members?.some((user) => user.id === ctx.me.id) ??
        false
    );
}

/**
 * Checks if chat is whitelisted for commands usage
 *
 * If it's not whitelisted, skip executing.
 * Also, if help command is being triggered,
 * sends message about pending whitelist approval
 */
export function checkForWhitelist(): Middleware<Context> {
    return async (ctx, next) => {
        if (isBotAddedInChat(ctx) || (await isChatWhitelisted(ctx))) {
            return void (await next());
        }

        if (isHelpCommandTriggered(ctx)) {
            await ctx.reply(ctx.t("whiteListMessages.chatMessage"));
        }
    };
}
