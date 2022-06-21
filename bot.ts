import { Bot } from "grammy";

const bot = new Bot(process.env.BOT_KEY!);

bot.on("message:sticker", async (ctx) => {
    const userMention = ctx.update.message.from.username === undefined ? ctx.update.message.from.first_name : `@${ctx.update.message.from.username}`;

    if (ctx.update.message.sticker.premium_animation !== undefined) {
        try {
            ctx.deleteMessage();
            ctx.reply(`${userMention}, мой папа говорит, что такие стикеры используют плохие дяди!`);
        } catch (e) {
            console.log(e);
        }
    };
});

bot.start();
