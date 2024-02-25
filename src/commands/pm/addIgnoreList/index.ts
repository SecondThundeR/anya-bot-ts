import { Composer } from "@/deps.ts";

import SetsNames from "@/constants/setsNames.ts";

import { RedisClient } from "@/database/redisClient.ts";

import ignoreListMessages from "@/locales/ignoreListMessages.ts";
import otherMessages from "@/locales/otherMessages.ts";

import { isBotInChat, leaveFromIgnoredChat } from "@/utils/asyncUtils.ts";

const addIgnoreList = new Composer();

addIgnoreList.command("addil", async (ctx) => {
    const chatID = ctx.match;
    if (chatID === "") {
        return await ctx.reply(otherMessages.noChatIDProvided);
    }

    if (
        await RedisClient.isValueInSet(
            SetsNames.IGNORELIST,
            chatID,
        )
    ) {
        return await ctx.reply(ignoreListMessages.alreadyAdded);
    }

    await RedisClient.addValuesToSet(SetsNames.IGNORELIST, chatID);

    const isChatWhitelisted = await RedisClient.isValueInSet(
        SetsNames.WHITELIST,
        chatID,
    );
    if (isChatWhitelisted) {
        await RedisClient.removeItemsFromSet(
            SetsNames.WHITELIST,
            chatID,
        );
    }

    if (await isBotInChat(ctx, chatID)) {
        await leaveFromIgnoredChat(ctx, chatID);
    }

    await ctx.reply(
        isChatWhitelisted
            ? ignoreListMessages.addedAndUnwhitelisted
            : ignoreListMessages.added,
    );
});

export default addIgnoreList;
