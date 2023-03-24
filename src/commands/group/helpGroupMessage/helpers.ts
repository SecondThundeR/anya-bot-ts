import { Context } from "grammy";

import ListsNames from "@data/listsNames";

import whiteListMessages from "@locale/whiteListMessages";

import AsyncUtils from "@utils/asyncUtils";
import RedisSingleton from "@utils/redisSingleton";
import RegularUtils from "@utils/regularUtils";

async function sendNoAccessMessage(ctx: Context, chatID: number) {
    return await ctx.reply(
        whiteListMessages.chatMessage.replace(/xxx/i, `<code>${chatID}</code>`),
        {
            parse_mode: "HTML"
        }
    );
}

export async function isHelpIgnored(
    ctx: Context,
    redisInstance: RedisSingleton
) {
    const whiteListIDs = await redisInstance.getList(ListsNames.WHITELIST);
    const chatID = RegularUtils.getChatID(ctx);

    if (!RegularUtils.isItemInList(chatID, whiteListIDs)) {
        await sendNoAccessMessage(ctx, chatID);
        return true;
    }

    return !(await AsyncUtils.isGroupAdmin(ctx));
}
