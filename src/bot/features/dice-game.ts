import { setTimeout } from "node:timers/promises";
import { Composer } from "grammy";

import type { Context } from "#root/bot/context.js";
import { getUserMention } from "#root/bot/helpers/api.js";
import { escapeHtml, parseDiceCommand } from "#root/bot/helpers/general.js";
import { logHandle } from "#root/bot/helpers/logging.js";

// This value is average animation time without issues
// (e.g. network/api errors, etc.)
const DICE_ANIMATION_TIME_MS = 2500;

const DICE_EMOJI = "🎲";

const ERROR_LOCALES = {
    empty: "diceGameMessages.empty",
    noText: "diceGameMessages.noTextProvided",
    notANumber: "diceGameMessages.notANumber",
    wrongNumber: "diceGameMessages.wrongNumber",
} as const;

const composer = new Composer<Context>();

const feature = composer.chatType(["group", "supergroup"]);

feature.command("dice", logHandle("command-dice"), async (ctx) => {
    const replyParameters = { message_id: ctx.msg.message_id };
    const command = parseDiceCommand(ctx.match);

    if (command.status !== "ok") {
        return await ctx.reply(ctx.t(ERROR_LOCALES[command.status]), {
            reply_parameters: replyParameters,
        });
    }

    const { number: diceNumber, text } = command;
    const diceText = escapeHtml(text);

    const initialMessage = await ctx.reply(
        ctx.t("diceGameMessages.message", {
            number: diceNumber,
            text: diceText,
        }),
        {
            reply_parameters: replyParameters,
        },
    );
    const diceMessage = await ctx.replyWithDice(DICE_EMOJI, {
        reply_parameters: { message_id: initialMessage.message_id },
    });

    const {
        dice: { value: diceValue },
    } = diceMessage;
    if (diceValue !== diceNumber) return;

    await setTimeout(DICE_ANIMATION_TIME_MS);

    const userMention = getUserMention(ctx.msg.from);
    await ctx.reply(`${userMention}, ${diceText}`);
});

export { composer as diceGameFeature };
