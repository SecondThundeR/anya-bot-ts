import { Composer } from "@/deps.ts";

import stickerMessages from "@/locales/stickerMessages.ts";
import { resetLocaleHandler } from "@/utils/asyncUtils.ts";

const messageLocaleReset = new Composer();

messageLocaleReset.command(
    "messagelocalereset",
    async (ctx) =>
        await resetLocaleHandler(
            ctx,
            ["stickerMessageLocale", "stickerMessageMention"],
            stickerMessages.messageReset,
        ),
);

export default messageLocaleReset;
