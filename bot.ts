import {
    Bot,
    InlineKeyboard
} from "grammy";
import {
    createClient
} from "redis";
import {
    RedisClientType
} from "@redis/client";
import {
    isAdmin,
    convertStringToBoolean,
    adminOnlyCommandHandler,
    setHashData,
    getStickerMessageLocale,
    getHashSingleData,
    getHashMultipleData,
    getUserMention,
    deleteHashData,
    checkLocaleWord,
    checkStickerMessageLocale,
} from "./utils";
import {
    silentMessages,
    stickerMessageMentionModes,
    otherLocale,
} from "./locale";

const redisUser = process.env.REDIS_USER;
const redisPass = process.env.REDIS_PASS;
const redisURL = process.env.REDIS_URL;
const redisPort = process.env.REDIS_PORT;
const botToken = process.env.BOT_KEY!;

const bot: Bot = new Bot(botToken);
const client: RedisClientType = createClient({
    url: `redis://${redisUser}:${redisPass}@${redisURL}:${redisPort}`,
});

const pm = bot.filter((ctx) => ctx.chat?.type === "private");
const group = bot.filter((ctx) => ctx.chat?.type !== "private");

group.command("help", async (ctx) => {
    const authorData = await ctx.getAuthor();
    if (!isAdmin(authorData.status))
        return await ctx.reply(otherLocale["helpRegularMessage"]);
    await ctx.reply(otherLocale["helpAdminMessage"]);
});

group.command("silent", async (ctx) => {
    const isAdmin = await adminOnlyCommandHandler(ctx);
    if (!isAdmin) return;

    const [silentOnLocale, silentOffLocale] = await getHashMultipleData(
        client,
        ctx.chat.id,
        ["silentOnLocale", "silentOffLocale"]
    );
    const chatID = ctx.update.message?.chat.id!;
    const dbData = await getHashSingleData(client, chatID, "isSilent", "true");
    const isSilent = convertStringToBoolean(dbData);
    const newSilent = !isSilent;

    await setHashData(client, chatID, ["isSilent", String(newSilent)]);

    if (newSilent)
        return await ctx.reply(
            checkLocaleWord(silentOnLocale, silentMessages["silentEnabled"])
        );
    await ctx.reply(
        checkLocaleWord(silentOffLocale, silentMessages["silentDisabled"])
    );
});

group.command("silentonlocale", async (ctx) => {
    const isAdmin = await adminOnlyCommandHandler(ctx);
    if (!isAdmin) return;

    const word = ctx.match;
    if (word === "") return await ctx.reply(otherLocale["noText"]);

    const chatID = ctx.update.message?.chat.id!;
    await setHashData(client, chatID, ["silentOnLocale", word]);
    await ctx.reply(silentMessages["silentOnLocaleChange"]);
});

group.command("silentonlocalereset", async (ctx) => {
    const isAdmin = await adminOnlyCommandHandler(ctx);
    if (!isAdmin) return;

    const chatID = ctx.update.message?.chat.id!;
    await deleteHashData(client, chatID, ["silentOnLocale"]);
    await ctx.reply(silentMessages["silentOnLocaleReset"]);
});

group.command("silentofflocale", async (ctx) => {
    const isAdmin = await adminOnlyCommandHandler(ctx);
    if (!isAdmin) return;

    const word = ctx.match;
    if (word === "") return await ctx.reply(otherLocale["noText"]);

    const chatID = ctx.update.message?.chat.id!;
    await setHashData(client, chatID, ["silentOffLocale", word]);
    await ctx.reply(silentMessages["silentOffLocaleChange"]);
});

group.command("silentofflocalereset", async (ctx) => {
    const isAdmin = await adminOnlyCommandHandler(ctx);
    if (!isAdmin) return;

    const chatID = ctx.update.message?.chat.id!;
    await deleteHashData(client, chatID, ["silentOffLocale"]);
    await ctx.reply(silentMessages["silentOffLocaleReset"]);
});

group.command("messagelocale", async (ctx) => {
    const isAdmin = await adminOnlyCommandHandler(ctx);
    if (!isAdmin) return;

    const word = ctx.match;
    if (word === "") return await ctx.reply(otherLocale["noText"]);

    const chatID = ctx.update.message?.chat.id!;
    const keyboard = new InlineKeyboard()
        .text(otherLocale["yesButton"], `${word}|${chatID}|mention_yes`)
        .text(otherLocale["noButton"], `${word}|${chatID}|mention_no`);

    await ctx.reply(otherLocale["needToMention"], {
        reply_markup: keyboard,
    });
});

group.command("messagelocalereset", async (ctx) => {
    const isAdmin = await adminOnlyCommandHandler(ctx);
    if (!isAdmin) return;

    const chatID = ctx.update.message?.chat.id!;
    await deleteHashData(client, chatID, [
        "stickerMessageLocale",
        "stickerMessageMention",
    ]);
    await ctx.reply(otherLocale["stickerMessageLocaleReset"]);
});

group.on("callback_query:data", async (ctx) => {
    const data = ctx.update.callback_query.data;
    const splitData = data.split("|");

    if (splitData.length !== 3) return;

    const [stickerMessageLocale, chatID, mentionMode] = splitData;
    const mentionModeBoolean = mentionMode === "mention_yes";

    await setHashData(client, chatID, [
        "stickerMessageLocale",
        stickerMessageLocale,
        "stickerMessageMention",
        String(mentionModeBoolean),
    ]);
    await ctx.deleteMessage();
    await ctx.reply(
        `${otherLocale["stickerMessageLocaleChanged"]} ${
      stickerMessageMentionModes[mentionModeBoolean ? "yes" : "no"]
    }`
    );
});

group.on("message:sticker", async (ctx) => {
    const isPremiumSticker =
        ctx.update.message?.sticker.premium_animation !== undefined;
    if (!isPremiumSticker) return;

    const chatID = ctx.update.message?.chat.id!;
    const dbData = await getHashSingleData(client, chatID, "isSilent", "true");
    const isSilent = convertStringToBoolean(dbData);

    const [customText, stickerMessageMention] = await getHashMultipleData(
        client,
        chatID,
        ["stickerMessageLocale", "stickerMessageMention"]
    );
    const [checkedCustomText, checkedStickerMessageMentionStatus] =
    checkStickerMessageLocale(customText, stickerMessageMention);

    const userMention = getUserMention(ctx.update.message?.from);
    const messageText = getStickerMessageLocale(
        checkedCustomText,
        checkedStickerMessageMentionStatus,
        userMention
    );

    try {
        ctx.deleteMessage();
        if (!isSilent) ctx.reply(messageText);
    } catch (e) {
        console.log(e);
    }
});

pm.on("msg", async (ctx) => {
    await ctx.reply(otherLocale["noPMText"]);
});

process.on("SIGINT", async () => {
    await client.disconnect();
    process.exit();
});

(async () => {
    try {
        console.log("Starting bot");
        await client.connect();
        client.on("error", (err) => console.log("Redis Client Error", err));
        bot.start();
    } catch (e) {
        console.log(e);
        await client.disconnect();
    }
})();
