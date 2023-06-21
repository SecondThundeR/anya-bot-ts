import { Composer } from "@/deps.ts";

import redisClient from "@/database/redisClient.ts";

import { getChatID, isBotCanDelete } from "@/utils/apiUtils.ts";
import { isGroupAdmin } from "@/utils/asyncUtils.ts";
import { stringToBoolean } from "@/utils/generalUtils.ts";

const customEmojisHandler = new Composer();

customEmojisHandler.on(
    [
        "message:entities:custom_emoji",
        "edited_message:entities:custom_emoji",
        "message:caption_entities:custom_emoji",
        "edited_message:caption_entities:custom_emoji",
    ],
    async (ctx) => {
        const chatID = getChatID(ctx);
        const botData = await ctx.getChatMember(ctx.me.id);
        const isAdminPowerEnabled = await redisClient
            .getValueFromConfig(
                chatID,
                "adminPower",
                "false",
            );

        if (
            !isBotCanDelete(botData) ||
            ((await isGroupAdmin(ctx)) &&
                stringToBoolean(isAdminPowerEnabled))
        ) {
            return;
        }

        const strictEmojiRemovalRule = await redisClient
            .getValueFromConfig(
                chatID,
                "strictEmojiRemoval",
                "false",
            );
        if (!stringToBoolean(strictEmojiRemovalRule)) return;

        const entities_array = ctx?.update?.message?.entities ||
            ctx?.update?.edited_message?.entities ||
            ctx?.update?.message?.caption_entities ||
            ctx?.update?.edited_message?.caption_entities;
        if (!entities_array) return;

        if (entities_array.length > 0) return await ctx.deleteMessage();
    },
);

export default customEmojisHandler;
