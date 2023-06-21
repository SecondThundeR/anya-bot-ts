import { Composer } from "@/deps.ts";

import SetsNames from "@/constants/setsNames.ts";

import redisClient from "@/database/redisClient.ts";

import ignoreListMessages from "@/locales/ignoreListMessages.ts";
import otherMessages from "@/locales/otherMessages.ts";

const removeIgnoreList = new Composer();

removeIgnoreList.command("remil", async (ctx) => {
    const chatID = ctx.match;
    if (chatID === "") {
        return await ctx.reply(otherMessages.noChatIDProvided);
    }

    if (
        await redisClient.isValueNotInSet(
            SetsNames.IGNORELIST,
            chatID,
        )
    ) {
        return await ctx.reply(ignoreListMessages.alreadyRemoved);
    }

    await redisClient.removeItemsFromSet(
        SetsNames.IGNORELIST,
        chatID,
    );
    await ctx.reply(ignoreListMessages.removed);
});

export default removeIgnoreList;
