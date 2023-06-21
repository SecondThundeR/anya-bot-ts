import { stringToBoolean } from "@/utils/generalUtils.ts";
import { Composer } from "@/deps.ts";

import redisClient from "@/database/redisClient.ts";

import { getChatID, getMessageID } from "@/utils/apiUtils.ts";

const noCustomEmoji = new Composer();

noCustomEmoji.command("noemoji", async (ctx) => {
    const chatID = getChatID(ctx);

    const strictEmojiRemoval = (await redisClient.getValueFromConfig(
        chatID,
        "strictEmojiRemoval",
    )) || null;
    const strictEmojiRemovalBoolean = strictEmojiRemoval === null
        ? false
        : stringToBoolean(strictEmojiRemoval);
    const newStrictEmojiRemovalBoolean = !strictEmojiRemovalBoolean;

    if (!newStrictEmojiRemovalBoolean) {
        await redisClient.removeFieldsFromConfig(
            chatID,
            "strictEmojiRemoval",
        );
    } else {
        await redisClient.setConfigData(chatID, {
            strictEmojiRemoval: String(newStrictEmojiRemovalBoolean),
        });
    }

    await ctx.reply(
        newStrictEmojiRemovalBoolean
            ? "Теперь я буду удалять все кастомные эмодзи"
            : "Теперь я не буду удалять все кастомные эмодзи",
        {
            reply_to_message_id: getMessageID(ctx.update.message),
        },
    );
});

export default noCustomEmoji;
