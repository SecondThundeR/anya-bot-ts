import { Composer } from "grammy";

import type { Context } from "#root/bot/context.js";
import { generateNickname } from "#root/bot/helpers/general.js";
import { logHandle } from "#root/bot/helpers/logging.js";

const MAX_NICKNAME_LENGTH = 100;

const composer = new Composer<Context>();

composer.inlineQuery(
    /^\d+$/,
    logHandle("handler-inline-nickname-length"),
    async (ctx) => {
        const queryNumber = Number(ctx.update.inline_query.query);
        if (queryNumber > MAX_NICKNAME_LENGTH) {
            return await ctx.answerInlineQuery([], {
                button: {
                    text: ctx.t("nicknameGenerator.tooLong"),
                    start_parameter: "_",
                },
                cache_time: 0,
            });
        }
        const randomNickname = generateNickname(queryNumber);
        await ctx.answerInlineQuery(
            [
                {
                    type: "article",
                    id: "ubdjshdb-nickname-length",
                    title: ctx.t("nicknameGenerator.titleWithLength", {
                        length: queryNumber,
                    }),
                    input_message_content: {
                        message_text: ctx.t("nicknameGenerator.messageText", {
                            nickname: randomNickname,
                        }),
                        parse_mode: "HTML",
                    },
                    description: ctx.t("nicknameGenerator.description"),
                },
            ],
            {
                cache_time: 0,
            },
        );
    },
);

composer.on(
    "inline_query",
    logHandle("handler-inline-nickname"),
    async (ctx) => {
        const randomNickname = generateNickname();
        await ctx.answerInlineQuery(
            [
                {
                    type: "article",
                    id: "ubdjshdb-nickname-regular",
                    title: ctx.t("nicknameGenerator.title"),
                    input_message_content: {
                        message_text: ctx.t("nicknameGenerator.messageText", {
                            nickname: randomNickname,
                        }),
                        parse_mode: "HTML",
                    },
                    description: ctx.t("nicknameGenerator.description"),
                },
            ],
            {
                cache_time: 0,
            },
        );
    },
);

export { composer as inlineNicknameGeneratorFeature };
