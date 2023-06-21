import { Context } from "@/deps.ts";

import ListsNames from "@/constants/listsNames.ts";

import whiteListMessages from "@/locales/whiteListMessages.ts";

import AsyncUtils from "@/utils/asyncUtils.ts";
import RedisSingleton from "@/database/redisSingleton.ts";
import RegularUtils from "@/utils/regularUtils.ts";

async function sendNoAccessMessage(ctx: Context, chatID: number) {
    return await ctx.reply(
        whiteListMessages.chatMessage.replace(/xxx/i, `<code>${chatID}</code>`),
        {
            parse_mode: "HTML",
        },
    );
}

export async function isHelpIgnored(
    ctx: Context,
    redisInstance: RedisSingleton,
) {
    const whiteListIDs = await redisInstance.getList(ListsNames.WHITELIST);
    const chatID = RegularUtils.getChatID(ctx);

    if (!RegularUtils.isItemInList(chatID, whiteListIDs)) {
        await sendNoAccessMessage(ctx, chatID);
        return true;
    }

    return !(await AsyncUtils.isGroupAdmin(ctx));
}
