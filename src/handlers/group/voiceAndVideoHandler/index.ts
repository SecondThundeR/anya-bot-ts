import { Composer } from "@/deps.ts";

import redisClient from "@/database/redisClient.ts";

import aidenPierceMessages from "@/locales/aidenPierceMessages.ts";

import { getChatID, getUserMention, isBotCanDelete } from "@/utils/apiUtils.ts";
import { deleteUserMessage, isGroupAdmin } from "@/utils/asyncUtils.ts";
import { stringToBoolean } from "@/utils/generalUtils.ts";

const voiceAndVideoHandler = new Composer();

voiceAndVideoHandler.on(
    ["message:voice", "message:video_note"],
    async (ctx) => {
        const chatID = getChatID(ctx);
        const [aidenPierceMode, aidenPierceSilent] = await redisClient
            .getValuesFromConfig(chatID, "aidenMode", "isAidenSilent");

        const isAdminPowerEnabled = stringToBoolean(
            await redisClient.getValueFromConfig(
                chatID,
                "adminPower",
                "false",
            ),
        );
        const isAidenModeDisabled = !stringToBoolean(
            aidenPierceMode || "false",
        );
        const isAidenModeSilent = stringToBoolean(aidenPierceSilent || "false");
        const isUserImmune = await isGroupAdmin(ctx) && isAdminPowerEnabled;
        if (isAidenModeDisabled || isAidenModeSilent || isUserImmune) {
            return;
        }

        const botData = await ctx.getChatMember(ctx.me.id);
        const isBotIsntAdmin = !isBotCanDelete(botData);
        if (isBotIsntAdmin) return;

        if (await deleteUserMessage(ctx)) return;

        const randomAidenMessage = aidenPierceMessages.quotesArray[
            Math.floor(Math.random() * aidenPierceMessages.quotesArray.length)
        ];
        const userMention = getUserMention(
            ctx.update.message?.from!,
        );

        await ctx.reply(`${userMention}, ${randomAidenMessage}`);
    },
);

export default voiceAndVideoHandler;
