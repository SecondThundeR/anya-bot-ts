import { Composer } from "@/deps.ts";

import SetsNames from "@/constants/setsNames.ts";

import { RedisClient } from "@/database/redisClient.ts";

import otherMessages from "@/locales/otherMessages.ts";

import { getChatID, isBotCanDelete } from "@/utils/apiUtils.ts";
import {
    getBotInChatInfo,
    isChatWhitelisted,
    newChatJoinHandler,
} from "@/utils/asyncUtils.ts";

const newChatHandler = new Composer();

newChatHandler.on("msg:new_chat_members:me", async (ctx) => {
    const chatID = getChatID(ctx);
    const isChatNotWhitelisted = !(await isChatWhitelisted(ctx));
    if (isChatNotWhitelisted) {
        return await newChatJoinHandler(
            ctx,
            await RedisClient.isValueInSet(
                SetsNames.IGNORELIST,
                chatID,
            ),
        );
    }

    const botData = await getBotInChatInfo(ctx, chatID);
    const isBotIsntAdmin = !isBotCanDelete(botData);
    const greetingMsg = `${otherMessages.botGreeting} ${
        isBotIsntAdmin ? otherMessages.botAdminHint : otherMessages.botAdminNote
    }`;
    return await ctx.reply(greetingMsg);
});

export default newChatHandler;
