import { Composer } from "grammy";

import { getChatsByListStatus } from "#drizzle/queries/chats.js";
import type { Context } from "#root/bot/context.js";
import { isAdmin } from "#root/bot/filter/is-admin.js";
import {
    escapeHtml,
    getChatLink,
    idsToCodeBlocks,
} from "#root/bot/helpers/general.js";
import { logHandle } from "#root/bot/helpers/logging.js";

const composer = new Composer<Context>();

const feature = composer.chatType("private").filter(isAdmin);

feature.command("getwl", logHandle("command-getwl"), async (ctx) => {
    const whiteList = await getChatsByListStatus("whitelisted");

    if (whiteList.length === 0) {
        return await ctx.reply(ctx.t("whiteListMessages.empty"));
    }

    const knownChats = whiteList.filter((chat) => chat.title || chat.username);
    const unknownIDs = whiteList
        .filter((chat) => !(chat.title || chat.username))
        .map((chat) => chat.chatId);
    const whiteListMessageData: string[] = [];

    if (knownChats.length > 0) {
        const chatList = knownChats
            .map(({ chatId, title, username }) => {
                const link = getChatLink(username ?? undefined);
                const label = link ?? escapeHtml(title ?? "");
                return `${label} (<code>${escapeHtml(chatId)}</code>)`;
            })
            .join("\n");
        whiteListMessageData.push(
            `${ctx.t("whiteListMessages.chatsListHeader")}\n${chatList}`,
        );
    }

    if (unknownIDs.length > 0) {
        whiteListMessageData.push(
            `${ctx.t("whiteListMessages.idsListHeader")}\n${idsToCodeBlocks(unknownIDs)}`,
        );
    }

    await ctx.reply(whiteListMessageData.join("\n\n"));
});

export { composer as getWhiteListFeature };
