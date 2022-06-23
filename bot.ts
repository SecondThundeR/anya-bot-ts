import {
    Bot,
    GrammyError,
    HttpError,
} from "grammy";
import {
    createClient
} from "redis";
import {
    RedisClientType
} from "@redis/client";
import {
    isGroupAdmin,
    convertStringToBoolean,
    sendWhiteListKeyboard,
    setHashData,
    getHashSingleData,
    getHashMultipleData,
    deleteHashData,
    checkLocaleWord,
    getWhiteListKeyboardResponseLocale,
    getAllValuesFromList,
    deleteHashKey,
    getChatsByIDs,
    isBotCreator,
    isStringEmpty,
    getAuthorStatus,
    createMessageMentionLocaleKeyboard,
    isTimeoutExceeded,
    isInList,
    addIDToLists,
    removeIDFromLists,
    generateStickerLocaleMessage,
} from "./utils";
import {
    silentMessagesLocale,
    stickerMessagesLocale,
    otherLocale,
    whiteListLocale,
    ignoreListLocale,
    helpLocale,
    keyboardLocale,
} from "./locale";

let whiteListIDs: string[] = [];
let ignoreListIDs: string[] = [];
const whiteListIDsListName = "whiteListIDs";
const ignoreListIDsListName = "ignoreListIDs";

const redisUser = process.env.REDIS_USER;
const redisPass = process.env.REDIS_PASS;
const redisURL = process.env.REDIS_URL;
const redisPort = process.env.REDIS_PORT;
const creatorID = process.env.CREATOR_ID;
const botToken = process.env.BOT_KEY!;

const bot: Bot = new Bot(botToken);
const client: RedisClientType = createClient({
    url: `redis://${redisUser}:${redisPass}@${redisURL}:${redisPort}`,
});

const pm = bot.filter((ctx) => ctx.chat?.type === "private");
const group = bot.filter((ctx) => ctx.chat?.type !== "private");

group.command("help", async (ctx) => {
    if (!isGroupAdmin(await getAuthorStatus(ctx))) return await ctx.reply(
        helpLocale["message"]
    );
    await ctx.reply(helpLocale["adminMessage"]);
});

group.command("silent", async (ctx) => {
    if (!isGroupAdmin(await getAuthorStatus(ctx))) return await ctx.deleteMessage();

    const chatID = ctx.update.message?.chat.id!;

    const [isSilentString, silentOnLocale, silentOffLocale] = await getHashMultipleData(
        client,
        chatID,
        ["isSilent", "silentOnLocale", "silentOffLocale"]
    );
    const isSilent = isSilentString === null ? false : convertStringToBoolean(isSilentString);
    const newSilentStatus = !isSilent;

    await setHashData(client, chatID, ["isSilent", String(newSilentStatus)]);

    const messageText = checkLocaleWord(
        newSilentStatus ? silentOnLocale : silentOffLocale,
        newSilentStatus ? silentMessagesLocale["enabledDefault"] : silentMessagesLocale["disabledDefault"]
    )

    await ctx.reply(messageText)
});

group.command("silentonlocale", async (ctx) => {
    if (!isGroupAdmin(await getAuthorStatus(ctx))) return await ctx.deleteMessage();

    const newLocaleString = ctx.match;
    if (isStringEmpty(newLocaleString)) return await ctx.reply(otherLocale["stringIsEmpty"]);

    const chatID = ctx.update.message?.chat.id!;
    await setHashData(client, chatID, ["silentOnLocale", newLocaleString]);
    await ctx.reply(silentMessagesLocale["enabledMessageChange"]);
});

group.command("silentonlocalereset", async (ctx) => {
    if (!isGroupAdmin(await getAuthorStatus(ctx))) return await ctx.deleteMessage();

    const chatID = ctx.update.message?.chat.id!;
    await deleteHashData(client, chatID, ["silentOnLocale"]);
    await ctx.reply(silentMessagesLocale["enabledMessageReset"]);
});

group.command("silentofflocale", async (ctx) => {
    if (!isGroupAdmin(await getAuthorStatus(ctx))) return await ctx.deleteMessage();

    const newLocaleString = ctx.match;
    if (isStringEmpty(newLocaleString)) return await ctx.reply(otherLocale["stringIsEmpty"]);

    const chatID = ctx.update.message?.chat.id!;
    await setHashData(client, chatID, ["silentOffLocale", newLocaleString]);
    await ctx.reply(silentMessagesLocale["disabledMessageChange"]);
});

group.command("silentofflocalereset", async (ctx) => {
    if (!isGroupAdmin(await getAuthorStatus(ctx))) return await ctx.deleteMessage();

    const chatID = ctx.update.message?.chat.id!;
    await deleteHashData(client, chatID, ["silentOffLocale"]);
    await ctx.reply(silentMessagesLocale["disabledMessageReset"]);
});

group.command("messagelocale", async (ctx) => {
    if (!isGroupAdmin(await getAuthorStatus(ctx))) return await ctx.deleteMessage();

    const newLocaleString = ctx.match;
    if (isStringEmpty(newLocaleString)) return await ctx.reply(otherLocale["stringIsEmpty"]);

    const chatID = ctx.update.message?.chat.id!;
    const keyboard = createMessageMentionLocaleKeyboard(newLocaleString, chatID);

    await ctx.reply(stickerMessagesLocale["mentionQuestion"], {
        reply_markup: keyboard,
    });
});

group.command("messagelocalereset", async (ctx) => {
    if (!isGroupAdmin(await getAuthorStatus(ctx))) return await ctx.deleteMessage();

    const chatID = ctx.update.message?.chat.id!;
    await deleteHashData(client, chatID, [
        "stickerMessageLocale",
        "stickerMessageMention",
    ]);
    await ctx.reply(stickerMessagesLocale["messageReset"]);
});

group.on("callback_query:data", async (ctx) => {
    const data = ctx.update.callback_query.data;
    const splitData = data.split("|");

    if (splitData.length !== 4) return;

    await ctx.deleteMessage();

    const [oldTimestamp, stickerMessageLocale, chatID, mentionMode] = splitData;
    const newTimestamp = Math.floor(Date.now() / 1000);
    const timeoutSeconds = 30;

    if (isTimeoutExceeded(Number(oldTimestamp), newTimestamp, timeoutSeconds)) return await ctx.reply(
        keyboardLocale["timeoutError"]
    );

    const mentionModeBoolean = mentionMode === "mention_yes";

    await setHashData(client, chatID, [
        "stickerMessageLocale",
        stickerMessageLocale,
        "stickerMessageMention",
        String(mentionModeBoolean),
    ]);

    await ctx.reply(`${stickerMessagesLocale["messageWithMentionChanged"]} ${stickerMessagesLocale[
        mentionModeBoolean ? "mentionModeYes" : "mentionModeNo"
    ]}`);
});

group.on("my_chat_member", async (ctx) => {
    const botStatus = ctx.update.my_chat_member.new_chat_member.status;
    const chatID = ctx.update.my_chat_member.chat.id;
    // @ts-ignore
    const chatName = ctx.update.my_chat_member.chat.title;
    const isWhitelistedLocally = isInList(whiteListIDs, chatID);

    if (botStatus === "member") {
        if (isWhitelistedLocally) return await ctx.reply(otherLocale["botAdminHint"]);
        const isLeft = false;
        const isIgnoredLocally = isInList(ignoreListIDs, chatID);
        return await sendWhiteListKeyboard(bot, ctx, chatID, chatName, creatorID, isLeft, isIgnoredLocally);
    };
});

group.on("message:text", async (ctx) => {
    const chatID = ctx.update.message?.chat.id!;
    // @ts-ignore
    const chatName = ctx.update.message?.chat.title;
    const isWhitelistedLocally = isInList(whiteListIDs, chatID);

    if (isWhitelistedLocally) return;

    const isLeft = true;
    const isIgnoredLocally = isInList(ignoreListIDs, chatID);

    await sendWhiteListKeyboard(bot, ctx, chatID, chatName, creatorID, isLeft, isIgnoredLocally);
})

group.on("message:sticker", async (ctx) => {
    const isPremiumSticker =
        ctx.update.message?.sticker.premium_animation !== undefined;
    if (!isPremiumSticker) return;

    const botData = await ctx.getChatMember(ctx.me.id);
    const canBotDeleteMessages = botData.status === "administrator" && botData.can_delete_messages === true;
    if (!canBotDeleteMessages) return;

    ctx.deleteMessage();

    const chatID = ctx.update.message?.chat.id!;
    const dbData = await getHashSingleData(client, chatID, "isSilent", "false");
    const isSilent = convertStringToBoolean(dbData);

    if (isSilent) return;

    ctx.reply(await generateStickerLocaleMessage(
        client, ctx, chatID
    ));
});

pm.command("help", async (ctx) => {
    const userID = ctx.update.message?.from.id!;
    if (!isBotCreator(userID, creatorID)) return await ctx.reply(otherLocale["noPMHint"]);
    await ctx.reply(helpLocale["creatorMessage"]);
});

pm.command("addwhitelist", async (ctx) => {
    const userID = ctx.update.message?.from.id!;
    if (!isBotCreator(userID, creatorID)) return await ctx.reply(otherLocale["noPMHint"]);

    const chatID = ctx.match;
    if (isStringEmpty(chatID)) return await ctx.reply(otherLocale["noChatIDProvided"]);

    const isWhitelistedLocally = isInList(whiteListIDs, chatID);
    if (isWhitelistedLocally) return await ctx.reply(whiteListLocale["alreadyAdded"]);

    whiteListIDs = await addIDToLists(client, chatID, whiteListIDsListName, whiteListIDs);

    const isIgnoredLocally = isInList(ignoreListIDs, chatID);
    if (isIgnoredLocally) {
        ignoreListIDs = await removeIDFromLists(client, chatID, ignoreListIDsListName, ignoreListIDs);
        return await ctx.reply(whiteListLocale["addedAndUnignored"]);
    }

    await ctx.reply(whiteListLocale["added"]);
});

pm.command("removewhitelist", async (ctx) => {
    const userID = ctx.update.message?.from.id!;
    if (!isBotCreator(userID, creatorID)) return await ctx.reply(otherLocale["noPMHint"]);

    const chatID = ctx.match;
    if (isStringEmpty(chatID)) return await ctx.reply(otherLocale["noChatIDProvided"]);

    const isWhitelistedLocally = isInList(whiteListIDs, chatID);
    if (!isWhitelistedLocally) return await ctx.reply(whiteListLocale["alreadyRemoved"]);

    whiteListIDs = await removeIDFromLists(client, chatID, whiteListIDsListName, whiteListIDs);

    await ctx.reply(whiteListLocale["removed"]);
});

pm.command("getwhitelist", async (ctx) => {
    if (whiteListIDs.length === 0) return await ctx.reply(whiteListLocale["listEmpty"]);

    const [chats, ids] = await getChatsByIDs(bot, whiteListIDs);

    const chatList = chats.map((chat) => {
        const chatID = chat.id;
        // @ts-ignore
        const chatName = chat.title;
        return `${chatName} (${chatID})`;
    });

    const messageData: string[] = [];
    if (chats.length > 0) messageData.push(`${whiteListLocale["groupsInfo"]}${chatList.join("\n")}`);

    if (ids.length > 0) messageData.push(`${whiteListLocale["groupsInfoIds"]}${ids.join("\n")}`);

    await ctx.reply(messageData.join("\n\n"));
});

pm.command("addignorelist", async (ctx) => {
    const userID = ctx.update.message?.from.id!;
    if (!isBotCreator(userID, creatorID)) return await ctx.reply(otherLocale["noPMHint"]);

    const chatID = ctx.match;
    if (isStringEmpty(chatID)) return await ctx.reply(otherLocale["noChatIDProvided"]);

    const isIgnoredLocally = isInList(ignoreListIDs, chatID);
    if (isIgnoredLocally) return await ctx.reply(ignoreListLocale["alreadyAdded"]);

    ignoreListIDs = await addIDToLists(client, chatID, ignoreListIDsListName, ignoreListIDs);

    const isWhitelistedLocally = isInList(whiteListIDs, chatID);
    if (isWhitelistedLocally) {
        whiteListIDs = await removeIDFromLists(client, chatID, whiteListIDsListName, whiteListIDs);
        return await ctx.reply(ignoreListLocale["addedAndUnwhitelisted"]);
    }

    await ctx.reply(ignoreListLocale["added"]);
});

pm.command("removeignorelist", async (ctx) => {
    const userID = ctx.update.message?.from.id!;
    if (!isBotCreator(userID, creatorID)) return await ctx.reply(otherLocale["noPMHint"]);

    const chatID = ctx.match;
    if (isStringEmpty(chatID)) return await ctx.reply(otherLocale["noChatIDProvided"]);

    const isIgnoredLocally = isInList(ignoreListIDs, chatID);
    if (!isIgnoredLocally) return await ctx.reply(ignoreListLocale["alreadyRemoved"]);

    ignoreListIDs = await removeIDFromLists(client, chatID, ignoreListIDsListName, ignoreListIDs);

    await ctx.reply(ignoreListLocale["removed"]);
});

pm.command("getignorelist", async (ctx) => {
    if (ignoreListIDs.length === 0) return await ctx.reply(ignoreListLocale["listEmpty"]);
    await ctx.reply(`${ignoreListLocale["idsInfo"]}${ignoreListIDs.join("\n")}`);
});

pm.on("message:text", async (ctx) => {
    const userID = ctx.update.message?.from.id!;
    if (!isBotCreator(userID, creatorID)) return await ctx.reply(otherLocale["noPMHint"]);
});

pm.on("callback_query:data", async (ctx) => {
    const data = ctx.update.callback_query.data;
    const splitData = data.split("|");

    if (splitData.length !== 4) return;

    await ctx.deleteMessage();

    const [chatName, chatID, userMention, listMode] = splitData;

    const whiteListAccept = listMode === "accept";
    const ignoreListIgnore = listMode === "ignore";
    const isWhitelistedLocally = isInList(whiteListIDs, chatID);
    const isIgnoredLocally = isInList(ignoreListIDs, chatID);

    if (ignoreListIgnore && !isIgnoredLocally) {
        ignoreListIDs = await addIDToLists(client, chatID, ignoreListIDsListName, ignoreListIDs);
    };

    if (whiteListAccept && !isWhitelistedLocally) {
        whiteListIDs = await addIDToLists(client, chatID, whiteListIDsListName, whiteListIDs);
    };

    await ctx.reply(getWhiteListKeyboardResponseLocale(`${chatName} (${chatID})`, userMention, whiteListAccept, ignoreListIgnore));
});

bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) return console.error("Error in request:", e.description);
    if (e instanceof HttpError) return console.error("Could not contact Telegram:", e);
    return console.error("Unknown error:", e);
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
        whiteListIDs = await getAllValuesFromList(client, whiteListIDsListName);
        ignoreListIDs = await getAllValuesFromList(client, ignoreListIDsListName);
        bot.start();
    } catch (e) {
        console.log(e);
        await client.disconnect();
    }
})();
