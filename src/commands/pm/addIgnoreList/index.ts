import { Composer } from "@/deps.ts";

import SetsNames from "@/constants/setsNames.ts";

import redisClient from "@/database/redisClient.ts";

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
        await redisClient.isValueInSet(
            SetsNames.IGNORELIST,
            chatID,
        )
    ) {
        return await ctx.reply(ignoreListMessages.alreadyAdded);
    }

    await redisClient.addValuesToSet(SetsNames.IGNORELIST, chatID);

    const isChatWhitelisted = await redisClient.isValueInSet(
        SetsNames.WHITELIST,
        chatID,
    );
    if (isChatWhitelisted) {
        await redisClient.removeItemsFromSet(
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
