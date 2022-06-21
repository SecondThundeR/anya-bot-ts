import { Bot } from "grammy";
import { createClient } from 'redis';

const silentMessages = {
    "silentEnabled": "Поняла! Теперь я буду бороться со стикерами в тишине",
    "silentDisabled": "Ура! Буду говорить обо всех стикерах сразу же",
}
const redisUser = process.env.REDIS_USER;
const redisPass = process.env.REDIS_PASS;
const redisURL = process.env.REDIS_URL;
const redisPort = process.env.REDIS_PORT;

const bot = new Bot(process.env.BOT_KEY!);
const client = createClient({
  url: `redis://${redisUser}:${redisPass}@${redisURL}:${redisPort}`
});

// JavaScript, I hate you
function convertStringToBoolean(str: string): boolean {
    return str === 'true';
}

function isAdmin(status: string): boolean {
    return status === 'administrator' || status === 'creator';
}

async function getSilentStatus(chatID: number): Promise<string> {
    const dbSilentStatus = await client.hGet(`chats_config:${chatID}`, 'isSilent') || 'true';
    return dbSilentStatus;
}

async function setNewSilentStatus(chatID: number, status: string): Promise<boolean> {
    const setStatus = await client.hSet(`chats_config:${chatID}`, 'isSilent', status);
    return setStatus == 0;
}

bot.command("silent", async (ctx) => {
    const authorData = await ctx.getAuthor();
    if (!isAdmin(authorData.status)) {
        await ctx.deleteMessage();
        return;
    }

    const chatID = ctx.update.message?.chat.id!;
    const dbData = await getSilentStatus(chatID);

    const isSilent = convertStringToBoolean(dbData);
    const newSilent = !isSilent;

    await setNewSilentStatus(chatID, String(newSilent));

    if (newSilent) {
        await ctx.reply(silentMessages["silentEnabled"]);
    }
    else {
        await ctx.reply(silentMessages["silentDisabled"]);
    }
});

bot.on("message:sticker", async (ctx) => {
    const userMention = ctx.update.message.from.username === undefined ? ctx.update.message.from.first_name : `@${ctx.update.message.from.username}`;
    const messageText = `${userMention}, мой папа говорит, что такие стикеры используют плохие дяди!`;

    const chatID = ctx.update.message?.chat.id!;
    const dbData = await getSilentStatus(chatID);
    const isSilent = convertStringToBoolean(dbData);

    if (ctx.update.message.sticker.premium_animation !== undefined) {
        try {
            ctx.deleteMessage();
            if (!isSilent) {
                ctx.reply(messageText);
            }
        } catch (e) {
            console.log(e);
        }
    };
});

process.on('SIGINT', async() => {
    await client.disconnect();
    process.exit();
});

(async () => {
    try {
        await client.connect();
        client.on('error', (err) => console.log('Redis Client Error', err));
        bot.start();
    } catch (e) {
        console.log(e);
        await client.disconnect();
    }
})();
