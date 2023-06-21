import { Composer } from "@/deps.ts";

import { generateNickname } from "@/utils/generalUtils.ts";

const inlineNicknameGenerator = new Composer();

inlineNicknameGenerator.inlineQuery(/^\d+$/, async (ctx) => {
    const queryNumber = Number(ctx.update.inline_query.query);
    if (queryNumber > 100) {
        return await ctx.answerInlineQuery([], {
            button: {
                text: "Длина никнейма слишком большая",
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
                id: `ubdjshdb-nickname-length`,
                title: `Generate new nickname (with length ${queryNumber})`,
                input_message_content: {
                    message_text:
                        `Generated nickname: <code>${randomNickname}</code>`,
                    parse_mode: "HTML",
                },
                description: "ubdjshdb's style",
            },
        ],
        {
            cache_time: 0,
        },
    );
});

inlineNicknameGenerator.on("inline_query", async (ctx) => {
    const randomNickname = generateNickname();
    await ctx.answerInlineQuery(
        [
            {
                type: "article",
                id: `ubdjshdb-nickname-regular`,
                title: "Generate new nickname",
                input_message_content: {
                    message_text:
                        `Generated nickname: <code>${randomNickname}</code>`,
                    parse_mode: "HTML",
                },
                description: "ubdjshdb's style",
            },
        ],
        {
            cache_time: 0,
        },
    );
});

export default inlineNicknameGenerator;
