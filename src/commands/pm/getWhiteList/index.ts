import { Composer } from "@/deps.ts";

import SetsNames from "@/constants/setsNames.ts";

import redisClient from "@/database/redisClient.ts";

import whiteListMessages from "@/locales/whiteListMessages.ts";

import { chatsInfoToString } from "@/utils/apiUtils.ts";
import { getChatsByIDs } from "@/utils/asyncUtils.ts";
import { idsToCodeBlocks } from "@/utils/generalUtils.ts";

const getWhiteList = new Composer();

getWhiteList.command("getwl", async (ctx) => {
    const whiteListIDs = await redisClient.getSetValues(
        SetsNames.WHITELIST,
    );

    if (whiteListIDs.length === 0) {
        return await ctx.reply(whiteListMessages.empty);
    }

    const [chats, ids] = await getChatsByIDs(ctx, whiteListIDs);
    const chatList = chatsInfoToString(chats);
    const whiteListMessageData = new Array<string>();

    if (chats.length > 0) {
        whiteListMessageData.push(
            `${whiteListMessages.chatsListHeader}${chatList}`,
        );
    }

    if (ids.length > 0) {
        whiteListMessageData.push(
            `${whiteListMessages.idsListHeader}${idsToCodeBlocks(ids)}`,
        );
    }

    await ctx.reply(whiteListMessageData.join("\n\n"), {
        parse_mode: "HTML",
    });
});

export default getWhiteList;
