import { Composer } from "@/deps.ts";

import SetsNames from "@/constants/setsNames.ts";

import { RedisClient } from "@/database/redisClient.ts";

import otherMessages from "@/locales/otherMessages.ts";
import whiteListMessages from "@/locales/whiteListMessages.ts";

import { isBotInChat, sendMessageByChatID } from "@/utils/asyncUtils.ts";
import { getCreatorLink, setPlaceholderData } from "@/utils/generalUtils.ts";

const removeWhiteList = new Composer();

removeWhiteList.command(["remwl", "silentremwl"], async (ctx) => {
    const chatID = ctx.match;
    if (chatID === "") {
        return await ctx.reply(otherMessages.noChatIDProvided);
    }

    if (
        await RedisClient.isValueNotInSet(
            SetsNames.WHITELIST,
            chatID,
        )
    ) {
        return await ctx.reply(whiteListMessages.alreadyRemoved);
    }

    await RedisClient.removeItemsFromSet(
        SetsNames.WHITELIST,
        chatID,
    );
    await ctx.reply(whiteListMessages.removed);

    const isInStealthMode = ctx.hasCommand("silentremwl");
    if (isInStealthMode) return;

    if (await isBotInChat(ctx, chatID)) {
        await sendMessageByChatID(
            ctx,
            chatID,
            setPlaceholderData(
                whiteListMessages.accessRevoked,
                {
                    link: getCreatorLink(),
                    id: chatID,
                },
            ),
        );
    }
});

export default removeWhiteList;
