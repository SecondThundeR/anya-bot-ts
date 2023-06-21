import { Composer } from "@/deps.ts";

import ListsNames from "@/constants/listsNames.ts";

import otherMessages from "@/locales/otherMessages.ts";

import AsyncUtils from "@/utils/asyncUtils.ts";
import RedisSingleton from "@/database/redisSingleton.ts";
import RegularUtils from "@/utils/regularUtils.ts";

const newChatHandler = new Composer();

newChatHandler.on("msg:new_chat_members:me", async (ctx) => {
    const creatorID = Deno.env.get("CREATOR_ID");
    const redisInstance = RedisSingleton.getInstance();
    const chatID = RegularUtils.getChatID(ctx);
    const idsLists = await redisInstance.getLists([
        ListsNames.WHITELIST,
        ListsNames.IGNORELIST,
    ]);

    if (!RegularUtils.isItemInList(chatID, idsLists[ListsNames.WHITELIST])) {
        return await AsyncUtils.newChatJoinHandler(
            ctx,
            creatorID,
            RegularUtils.isItemInList(chatID, idsLists[ListsNames.IGNORELIST]),
        );
    }

    return await ctx.reply(otherMessages.botAdminHint);
});

export default newChatHandler;
