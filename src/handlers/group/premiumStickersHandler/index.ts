import { Composer } from "@/deps.ts";

import SetsNames from "@/constants/setsNames.ts";

import redisClient from "@/database/redisClient.ts";

import {
    getChatID,
    isBotCanDelete,
    isPremiumSticker,
} from "@/utils/apiUtils.ts";
import {
    deleteUserMessage,
    generateStickerMessageLocale,
    isGroupAdmin,
} from "@/utils/asyncUtils.ts";
import { stringToBoolean } from "@/utils/generalUtils.ts";

const premiumStickersHandler = new Composer();

premiumStickersHandler.on("message:sticker", async (ctx) => {
    const chatID = getChatID(ctx);
    const botData = await ctx.getChatMember(ctx.me.id);
    const isAdminPowerEnabled = await redisClient.getValueFromConfig(
        chatID,
        "adminPower",
        "false",
    );

    if (
        !(await redisClient.isValueInSet(SetsNames.WHITELIST, chatID)) ||
        !isPremiumSticker(ctx) ||
        !isBotCanDelete(botData) ||
        ((await isGroupAdmin(ctx)) &&
            stringToBoolean(isAdminPowerEnabled))
    ) {
        return;
    }

    const deleteStatus = await deleteUserMessage(ctx);
    if (deleteStatus) return;

    const silentStatus = await redisClient.getValueFromConfig(
        chatID,
        "isSilent",
        "false",
    );
    if (stringToBoolean(silentStatus)) return;

    await ctx.reply(
        await generateStickerMessageLocale(
            ctx,
            chatID,
        ),
    );
});

export default premiumStickersHandler;
