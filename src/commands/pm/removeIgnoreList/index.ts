import { Composer } from "@/deps.ts";

import SetsNames from "@/constants/setsNames.ts";

import { RedisClient } from "@/database/redisClient.ts";

import ignoreListMessages from "@/locales/ignoreListMessages.ts";
import otherMessages from "@/locales/otherMessages.ts";

const removeIgnoreList = new Composer();

removeIgnoreList.command("remil", async (ctx) => {
    const chatID = ctx.match;
    if (chatID === "") {
        return await ctx.reply(otherMessages.noChatIDProvided);
    }

    if (
        await RedisClient.isValueNotInSet(
            SetsNames.IGNORELIST,
            chatID,
        )
    ) {
        return await ctx.reply(ignoreListMessages.alreadyRemoved);
    }

    await RedisClient.removeItemsFromSet(
        SetsNames.IGNORELIST,
        chatID,
    );
    await ctx.reply(ignoreListMessages.removed);
});

export default removeIgnoreList;
