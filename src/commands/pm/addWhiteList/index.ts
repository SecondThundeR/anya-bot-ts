import { Composer } from "@/deps.ts";

import SetsNames from "@/constants/setsNames.ts";

import { RedisClient } from "@/database/redisClient.ts";

import otherMessages from "@/locales/otherMessages.ts";
import whiteListMessages from "@/locales/whiteListMessages.ts";

import { isBotCanDelete } from "@/utils/apiUtils.ts";
import {
    getBotInChatInfo,
    isBotInChat,
    sendMessageByChatID,
} from "@/utils/asyncUtils.ts";

const addWhiteList = new Composer();

addWhiteList.command("addwl", async (ctx) => {
    const chatID = ctx.match;
    if (chatID === "") {
        return await ctx.reply(otherMessages.noChatIDProvided);
    }

    if (
        await RedisClient.isValueInSet(
            SetsNames.WHITELIST,
            chatID,
        )
    ) {
        return await ctx.reply(whiteListMessages.alreadyAdded);
    }

    await RedisClient.addValuesToSet(SetsNames.WHITELIST, chatID);

    const isChatIgnored = await RedisClient.isValueInSet(
        SetsNames.IGNORELIST,
        chatID,
    );
    if (isChatIgnored) {
        await RedisClient.removeItemsFromSet(SetsNames.IGNORELIST, chatID);
    }

    await ctx.reply(
        isChatIgnored
            ? whiteListMessages.addedAndUnignored
            : whiteListMessages.added,
    );

    const isBotNotInChat = !(await isBotInChat(ctx, chatID));
    if (isBotNotInChat) return;

    await sendMessageByChatID(ctx, chatID, whiteListMessages.accessGranted);

    const botData = await getBotInChatInfo(ctx, chatID);
    if (isBotCanDelete(botData)) return;

    await sendMessageByChatID(
        ctx,
        chatID,
        otherMessages.botAdminHint,
    );
});

export default addWhiteList;
