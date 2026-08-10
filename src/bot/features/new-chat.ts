import { Composer } from "grammy";

import { getChatListStatus } from "#drizzle/queries/chats.js";
import type { Context } from "#root/bot/context.js";
import { getChatID, isBotCanDelete } from "#root/bot/helpers/api.js";
import {
    getBotInChatInfo,
    newChatJoinHandler,
} from "#root/bot/helpers/chat.js";
import { logHandle } from "#root/bot/helpers/logging.js";

const composer = new Composer<Context>();

const feature = composer.chatType(["group", "supergroup"]);

feature.on(
    "msg:new_chat_members:me",
    logHandle("handler-new-chat"),
    async (ctx) => {
        const chatID = getChatID(ctx);
        const listStatus = await getChatListStatus(chatID);
        if (listStatus !== "whitelisted") {
            return await newChatJoinHandler(ctx, listStatus === "ignored");
        }

        const botData = await getBotInChatInfo(ctx, chatID);
        const isBotIsntAdmin = !isBotCanDelete(botData);
        const greetingMsg = `${ctx.t("otherMessages.botGreeting")} ${
            isBotIsntAdmin
                ? ctx.t("otherMessages.botAdminHint")
                : ctx.t("otherMessages.botAdminNote")
        }`;
        return await ctx.reply(greetingMsg);
    },
);

export { composer as newChatFeature };
