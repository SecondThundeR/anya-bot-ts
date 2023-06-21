import { Composer, User } from "@/deps.ts";

import diceGameMessages from "@/locales/diceGameMessages.ts";

import { getMessageID, getUserMention } from "@/utils/apiUtils.ts";
import {
    asyncTimeout,
    incrementCommandUsage,
    isChatWhitelisted,
} from "@/utils/asyncUtils.ts";
import { setPlaceholderData } from "@/utils/generalUtils.ts";

// This value is average animation time without issues
// (e.g. network/api errors, etc.)
const DICE_ANIMATION_TIME_MS = 2500;

const diceGame = new Composer();

diceGame.command("dice", async (ctx) => {
    if (!(await isChatWhitelisted(ctx))) return;
    await incrementCommandUsage("dice");

    const diceData = ctx.match.split(" ");

    if (diceData.length === 0) {
        return await ctx.reply(diceGameMessages.empty, {
            reply_to_message_id: getMessageID(ctx.update.message),
        });
    }

    if (diceData.length === 1) {
        return await ctx.reply(diceGameMessages.noTextProvided, {
            reply_to_message_id: getMessageID(ctx.update.message),
        });
    }

    const diceNumber = parseInt(diceData[0]);
    const diceText = diceData.slice(1).join(" ");

    if (isNaN(diceNumber)) {
        return await ctx.reply(diceGameMessages.notANumber, {
            reply_to_message_id: getMessageID(ctx.update.message),
        });
    }

    if (diceNumber < 1 || diceNumber > 6) {
        return await ctx.reply(diceGameMessages.wrongNumber, {
            reply_to_message_id: getMessageID(ctx.update.message),
        });
    }

    const initialMessage = await ctx.reply(
        setPlaceholderData(
            diceGameMessages.message,
            {
                number: String(diceNumber),
                text: diceText,
            },
        ),
        {
            reply_to_message_id: getMessageID(ctx.update.message),
        },
    );
    const diceMessage = await ctx.replyWithDice(diceGameMessages.diceEmoji, {
        reply_to_message_id: getMessageID(initialMessage),
    });

    const { dice: { value: diceValue } } = diceMessage;
    if (diceValue !== diceNumber) return;

    await asyncTimeout(DICE_ANIMATION_TIME_MS);

    const userMention = getUserMention(
        ctx.update.message?.from as User,
    );
    await ctx.reply(`${userMention}, ${diceText}`);
});

export default diceGame;
