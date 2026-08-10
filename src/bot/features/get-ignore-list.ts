import { Composer } from "grammy";

import { getChatsByListStatus } from "#drizzle/queries/chats.js";
import type { Context } from "#root/bot/context.js";
import { isAdmin } from "#root/bot/filter/is-admin.js";
import { idsToCodeBlocks } from "#root/bot/helpers/general.js";
import { logHandle } from "#root/bot/helpers/logging.js";

const composer = new Composer<Context>();

const feature = composer.chatType("private").filter(isAdmin);

feature.command("getil", logHandle("command-getil"), async (ctx) => {
    const ignoreList = await getChatsByListStatus("ignored");

    if (ignoreList.length === 0) {
        return await ctx.reply(ctx.t("ignoreListMessages.idsListEmpty"));
    }

    const ignoreListIDs = ignoreList.map((chat) => chat.chatId);

    await ctx.reply(
        `${ctx.t("ignoreListMessages.idsListHeader")}\n${idsToCodeBlocks(ignoreListIDs)}`,
    );
});

export { composer as getIgnoreListFeature };
