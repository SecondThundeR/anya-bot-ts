import { Context, NextFunction } from "@/deps.ts";

import whiteListMessages from "@/locale/whiteListMessages.ts";

import { getChatID } from "@/utils/apiUtils.ts";
import { isChatWhitelisted } from "@/utils/asyncUtils.ts";
import { getCreatorLink, setPlaceholderData } from "@/utils/generalUtils.ts";

/**
 * Checks if help command was triggered in current context object
 *
 * @param ctx Context object for getting bot command data
 * @returns True if help command triggered, False - otherwise
 */
function isHelpCommandTriggered(ctx: Context) {
    const helpCommand = ctx.entities("bot_command").at(0);
    return helpCommand !== undefined && helpCommand.text === "/help";
}

/**
 * Sends pending whitelist approval message
 *
 * @param ctx Context object for sending group message
 */
async function sendPendingApprovalMessage(ctx: Context) {
    await ctx.reply(
        setPlaceholderData(
            whiteListMessages.chatMessage,
            {
                link: getCreatorLink(),
                id: String(getChatID(ctx)),
            },
        ),
        {
            parse_mode: "HTML",
        },
    );
}

/**
 * Checks if bot was added in chat
 *
 * @param ctx Context object to get info about new chat members
 * @returns True if bot was added, False otherwise
 */
function isBotAddedInChat(ctx: Context) {
    return ctx.message?.new_chat_members?.findIndex(
        (user) => user.id === ctx.me.id,
    ) !== -1;
}

/**
 * Checks if chat is whitelisted for commands usage
 *
 * If it's not whitelist, skip executing.
 * Also, if help command is being triggered,
 * sends message about pending whitelist approval
 *
 * @param ctx Context object for getting chat data
 * @param next Callback for continuation of middleware flow
 */
async function checkForWhitelist(ctx: Context, next: NextFunction) {
    // Case for addition in chat (To skip to certain handler)
    if (isBotAddedInChat(ctx)) {
        await next();
        return;
    }

    if (await isChatWhitelisted(ctx)) {
        await next();
        return;
    }

    if (isHelpCommandTriggered(ctx)) {
        await sendPendingApprovalMessage(ctx);
        return;
    }

    return;
}

export default checkForWhitelist;
