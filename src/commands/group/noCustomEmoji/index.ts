import { stringToBoolean } from "@/utils/generalUtils.ts";
import { Composer } from "@/deps.ts";

import { RedisClient } from "@/database/redisClient.ts";

import { getChatID, getMessageID } from "@/utils/apiUtils.ts";

const noCustomEmoji = new Composer();

noCustomEmoji.command("noemoji", async (ctx) => {
    const chatID = getChatID(ctx);

    const strictEmojiRemoval = (await RedisClient.getValueFromConfig(
        chatID,
        "strictEmojiRemoval",
    )) || null;
    const strictEmojiRemovalBoolean = strictEmojiRemoval === null
        ? false
        : stringToBoolean(strictEmojiRemoval);
    const newStrictEmojiRemovalBoolean = !strictEmojiRemovalBoolean;

    if (!newStrictEmojiRemovalBoolean) {
        await RedisClient.removeFieldsFromConfig(
            chatID,
            "strictEmojiRemoval",
        );
    } else {
        await RedisClient.setConfigData(chatID, {
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
