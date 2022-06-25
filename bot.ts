import { Bot, session, GrammyError, HttpError } from 'grammy';
import { run, sequentialize, RunnerHandle } from '@grammyjs/runner';
import { createClient } from 'redis';
import { RedisClientType } from '@redis/client';
import {
    isGroupAdmin,
    convertStringToBoolean,
    manageNewChatJoin,
    setHashData,
    getHashSingleData,
    getHashMultipleData,
    deleteHashData,
    checkLocaleWord,
    getWhiteListKeyboardResponseLocale,
    getAllValuesFromList,
    getChatsByIDs,
    isBotCreator,
    isStringEmpty,
    getAuthorStatus,
    createMessageMentionLocaleKeyboard,
    isInList,
    addIDToLists,
    removeIDFromLists,
    generateStickerLocaleMessage,
    sendAccessGrantedMessage,
    sendIgnoredMessage,
    isBotInChat,
    leaveFromIgnoredChat,
    sendAccessRemovedMessage,
    getChatLink,
    asyncTimeout,
    getSessionKey
} from './utils';
import {
    silentMessagesLocale,
    stickerMessagesLocale,
    otherLocale,
    whiteListLocale,
    ignoreListLocale,
    helpLocale
} from './locale';

if (process.env.NODE_ENV === 'local') {
    require('dotenv').config();
}

let whiteListIDs: string[] = [];
let ignoreListIDs: string[] = [];
let isMessageLocaleChanging = false;
const whiteListIDsListName = 'whiteListIDs';
const ignoreListIDsListName = 'ignoreListIDs';
const messageLocaleWaitTime = 10;

const redisUser = process.env.REDIS_USER;
const redisPass = process.env.REDIS_PASS;
const redisURL = process.env.REDIS_URL;
const redisPort = process.env.REDIS_PORT;
const creatorID = process.env.CREATOR_ID;
const botToken = process.env.BOT_KEY!;

const client: RedisClientType = createClient({
    url: `redis://${redisUser}:${redisPass}@${redisURL}:${redisPort}`
});
const bot: Bot = new Bot(botToken);
const runner: RunnerHandle = run(bot);

const pm = bot.filter(ctx => ctx.chat?.type === 'private');
const group = bot.filter(
    ctx => ctx.chat?.type !== 'private' && ctx.chat?.type !== 'channel'
);

bot.use(sequentialize(getSessionKey));
// @ts-ignore
bot.use(session({ getSessionKey }));

group.command('help', async ctx => {
    const chatID = ctx.update.message?.chat.id!;
    const isWhitelistedLocally = isInList(whiteListIDs, chatID);
    if (!isWhitelistedLocally)
        return await ctx.reply(
            whiteListLocale['noAccess'].replace(
                /xxx/i,
                `<code>${chatID}</code>`
            ),
            {
                parse_mode: 'HTML'
            }
        );

    if (!isGroupAdmin(await getAuthorStatus(ctx)))
        return await ctx.reply(helpLocale['message']);

    await ctx.reply(helpLocale['adminMessage']);
});

group.command('silent', async ctx => {
    const chatID = ctx.update.message?.chat.id!;
    const isWhitelistedLocally = isInList(whiteListIDs, chatID);
    if (!isWhitelistedLocally) return;

    if (!isGroupAdmin(await getAuthorStatus(ctx)))
        return await ctx.deleteMessage();

    const [isSilentString, silentOnLocale, silentOffLocale] =
        await getHashMultipleData(client, chatID, [
            'isSilent',
            'silentOnLocale',
            'silentOffLocale'
        ]);
    const isSilent =
        isSilentString === null
            ? false
            : convertStringToBoolean(isSilentString);
    const newSilentStatus = !isSilent;

    await setHashData(client, chatID, ['isSilent', String(newSilentStatus)]);

    const messageText = checkLocaleWord(
        newSilentStatus ? silentOnLocale : silentOffLocale,
        newSilentStatus
            ? silentMessagesLocale['enabledDefault']
            : silentMessagesLocale['disabledDefault']
    );

    await ctx.reply(messageText);
});

group.command('silentonlocale', async ctx => {
    const chatID = ctx.update.message?.chat.id!;
    const isWhitelistedLocally = isInList(whiteListIDs, chatID);
    if (!isWhitelistedLocally) return;

    if (!isGroupAdmin(await getAuthorStatus(ctx)))
        return await ctx.deleteMessage();

    const newLocaleString = ctx.match;
    if (isStringEmpty(newLocaleString))
        return await ctx.reply(otherLocale['stringIsEmpty']);

    await setHashData(client, chatID, ['silentOnLocale', newLocaleString]);
    await ctx.reply(silentMessagesLocale['enabledMessageChange']);
});

group.command('silentonlocalereset', async ctx => {
    const chatID = ctx.update.message?.chat.id!;
    const isWhitelistedLocally = isInList(whiteListIDs, chatID);
    if (!isWhitelistedLocally) return;

    if (!isGroupAdmin(await getAuthorStatus(ctx)))
        return await ctx.deleteMessage();

    await deleteHashData(client, chatID, ['silentOnLocale']);
    await ctx.reply(silentMessagesLocale['enabledMessageReset']);
});

group.command('silentofflocale', async ctx => {
    const chatID = ctx.update.message?.chat.id!;
    const isWhitelistedLocally = isInList(whiteListIDs, chatID);
    if (!isWhitelistedLocally) return;

    if (!isGroupAdmin(await getAuthorStatus(ctx)))
        return await ctx.deleteMessage();

    const newLocaleString = ctx.match;
    if (isStringEmpty(newLocaleString))
        return await ctx.reply(otherLocale['stringIsEmpty']);

    await setHashData(client, chatID, ['silentOffLocale', newLocaleString]);
    await ctx.reply(silentMessagesLocale['disabledMessageChange']);
});

group.command('silentofflocalereset', async ctx => {
    const chatID = ctx.update.message?.chat.id!;
    const isWhitelistedLocally = isInList(whiteListIDs, chatID);
    if (!isWhitelistedLocally) return;

    if (!isGroupAdmin(await getAuthorStatus(ctx)))
        return await ctx.deleteMessage();

    await deleteHashData(client, chatID, ['silentOffLocale']);
    await ctx.reply(silentMessagesLocale['disabledMessageReset']);
});

group.command('messagelocale', async ctx => {
    const chatID = ctx.update.message?.chat.id!;
    const isWhitelistedLocally = isInList(whiteListIDs, chatID);
    if (!isWhitelistedLocally) return;

    if (!isGroupAdmin(await getAuthorStatus(ctx)))
        return await ctx.deleteMessage();

    if (isMessageLocaleChanging)
        return await ctx.reply(stickerMessagesLocale['inProgress'], {
            reply_to_message_id: ctx.update.message?.message_id
        });

    isMessageLocaleChanging = true;

    const newLocaleString = ctx.match;
    if (isStringEmpty(newLocaleString))
        return await ctx.reply(otherLocale['stringIsEmpty']);

    const userID = ctx.update.message?.from.id!;
    const keyboard = createMessageMentionLocaleKeyboard(userID, chatID);

    const message = await ctx.reply(stickerMessagesLocale['mentionQuestion'], {
        reply_markup: keyboard
    });

    await setHashData(client, chatID, [
        'stickerMessageLocale',
        newLocaleString
    ]);

    let messageExists = true;
    await asyncTimeout(messageLocaleWaitTime * 1000);
    await bot.api
        .deleteMessage(chatID, message.message_id)
        .then()
        .catch(_ => (messageExists = false));

    isMessageLocaleChanging = false;
    if (messageExists) {
        await deleteHashData(client, chatID, [
            'stickerMessageLocale',
            'stickerMessageMention'
        ]);
        return await ctx.reply(stickerMessagesLocale['timeoutError'], {
            reply_to_message_id: ctx.update.message?.message_id
        });
    }
});

group.command('messagelocalereset', async ctx => {
    const chatID = ctx.update.message?.chat.id!;
    const isWhitelistedLocally = isInList(whiteListIDs, chatID);
    if (!isWhitelistedLocally) return;

    if (!isGroupAdmin(await getAuthorStatus(ctx)))
        return await ctx.deleteMessage();

    await deleteHashData(client, chatID, [
        'stickerMessageLocale',
        'stickerMessageMention'
    ]);
    await ctx.reply(stickerMessagesLocale['messageReset']);
});

group.on('callback_query:data', async ctx => {
    const data = ctx.update.callback_query.data;
    const splitData = data.split('|');

    if (splitData.length !== 3)
        return await ctx.answerCallbackQuery({
            text: otherLocale['callbackFailure']
        });

    const [userID, chatID, mentionMode] = splitData;
    const clickUserID = ctx.update.callback_query.from.id;
    if (userID != String(clickUserID))
        return await ctx.answerCallbackQuery({
            text: otherLocale['callbackWrongUser']
        });

    isMessageLocaleChanging = false;
    await ctx.deleteMessage();

    const mentionModeBoolean = mentionMode === 'yes';

    await setHashData(client, chatID, [
        'stickerMessageMention',
        String(mentionModeBoolean)
    ]);

    await ctx.answerCallbackQuery();
    await ctx.reply(
        `${stickerMessagesLocale['messageWithMentionChanged']} ${
            stickerMessagesLocale[
                mentionModeBoolean ? 'mentionModeYes' : 'mentionModeNo'
            ]
        }`
    );
});

group.on('msg:new_chat_members:me', async ctx => {
    const chatID = ctx.update.message?.chat.id!;
    const isWhitelistedLocally = isInList(whiteListIDs, chatID);
    if (isWhitelistedLocally)
        return await ctx.reply(otherLocale['botAdminHint']);

    const isIgnoredLocally = isInList(ignoreListIDs, chatID);

    return await manageNewChatJoin(bot, ctx, creatorID, isIgnoredLocally);
});

group.on('message:sticker', async ctx => {
    const chatID = ctx.update.message?.chat.id!;
    const isWhitelistedLocally = isInList(whiteListIDs, chatID);
    if (!isWhitelistedLocally) return;

    const isPremiumSticker =
        ctx.update.message?.sticker.premium_animation !== undefined;
    if (!isPremiumSticker) return;

    const botData = await ctx.getChatMember(ctx.me.id);
    const canBotDeleteMessages =
        botData.status === 'administrator' &&
        botData.can_delete_messages === true;
    if (!canBotDeleteMessages) return;

    let alreadyDeleted = false;
    await ctx
        .deleteMessage()
        .then()
        .catch(_ => {
            alreadyDeleted = true;
        });
    if (alreadyDeleted) return;

    const dbData = await getHashSingleData(client, chatID, 'isSilent', 'false');
    const isSilent = convertStringToBoolean(dbData);

    if (isSilent) return;

    ctx.reply(await generateStickerLocaleMessage(client, ctx, chatID));
});

pm.command('start', async ctx => await ctx.reply(otherLocale['noPMHint']));

pm.command('help', async ctx => {
    const userID = ctx.update.message?.from.id!;
    if (isBotCreator(userID, creatorID))
        return await ctx.reply(helpLocale['creatorMessage']);
});

pm.command('addwhitelist', async ctx => {
    const userID = ctx.update.message?.from.id!;
    if (!isBotCreator(userID, creatorID)) return;

    const chatID = ctx.match;
    if (isStringEmpty(chatID))
        return await ctx.reply(otherLocale['noChatIDProvided']);

    const isWhitelistedLocally = isInList(whiteListIDs, chatID);
    if (isWhitelistedLocally)
        return await ctx.reply(whiteListLocale['alreadyAdded']);

    whiteListIDs = await addIDToLists(
        client,
        chatID,
        whiteListIDsListName,
        whiteListIDs
    );

    const isIgnoredLocally = isInList(ignoreListIDs, chatID);
    if (isIgnoredLocally) {
        ignoreListIDs = await removeIDFromLists(
            client,
            chatID,
            ignoreListIDsListName,
            ignoreListIDs
        );
        return await ctx.reply(whiteListLocale['addedAndUnignored']);
    }

    const isInChat = await isBotInChat(bot, chatID);
    if (isInChat) await sendAccessGrantedMessage(bot, chatID);

    const botData = await bot.api.getChatMember(chatID, ctx.me.id);
    const canBotDeleteMessages =
        botData.status === 'administrator' &&
        botData.can_delete_messages === true;
    if (!canBotDeleteMessages)
        await bot.api.sendMessage(
            chatID,
            otherLocale['botAdminWhitelistedHint']
        );

    await ctx.reply(whiteListLocale['added']);
});

pm.command('removewhitelist', async ctx => {
    const userID = ctx.update.message?.from.id!;
    if (!isBotCreator(userID, creatorID)) return;

    const chatID = ctx.match;
    if (isStringEmpty(chatID))
        return await ctx.reply(otherLocale['noChatIDProvided']);

    const isWhitelistedLocally = isInList(whiteListIDs, chatID);
    if (!isWhitelistedLocally)
        return await ctx.reply(whiteListLocale['alreadyRemoved']);

    whiteListIDs = await removeIDFromLists(
        client,
        chatID,
        whiteListIDsListName,
        whiteListIDs
    );

    const isInChat = await isBotInChat(bot, chatID);
    if (isInChat) await sendAccessRemovedMessage(bot, chatID);

    await ctx.reply(whiteListLocale['removed']);
});

pm.command('getwhitelist', async ctx => {
    if (whiteListIDs.length === 0)
        return await ctx.reply(whiteListLocale['listEmpty']);

    const [chats, ids] = await getChatsByIDs(bot, whiteListIDs);

    const chatList = chats.map(chat => {
        const chatID = chat.id;
        // @ts-ignore
        const chatName = chat.title;
        // @ts-ignore
        const chatLink = getChatLink(chat.username);
        return `${
            chatLink === undefined ? chatName : chatLink
        } (<code>${chatID}</code>)`;
    });

    const messageData: string[] = [];
    if (chats.length > 0)
        messageData.push(
            `${whiteListLocale['groupsInfo']}${chatList.join('\n')}`
        );

    if (ids.length > 0)
        messageData.push(
            `${whiteListLocale['groupsInfoIds']}${ids.join('\n')}`
        );

    await ctx.reply(messageData.join('\n\n'), {
        parse_mode: 'HTML'
    });
});

pm.command('addignorelist', async ctx => {
    const userID = ctx.update.message?.from.id!;
    if (!isBotCreator(userID, creatorID)) return;

    const chatID = ctx.match;
    if (isStringEmpty(chatID))
        return await ctx.reply(otherLocale['noChatIDProvided']);

    const isIgnoredLocally = isInList(ignoreListIDs, chatID);
    if (isIgnoredLocally)
        return await ctx.reply(ignoreListLocale['alreadyAdded']);

    ignoreListIDs = await addIDToLists(
        client,
        chatID,
        ignoreListIDsListName,
        ignoreListIDs
    );

    const isWhitelistedLocally = isInList(whiteListIDs, chatID);
    if (isWhitelistedLocally)
        whiteListIDs = await removeIDFromLists(
            client,
            chatID,
            whiteListIDsListName,
            whiteListIDs
        );

    const isInChat = await isBotInChat(bot, chatID);
    if (isInChat) await leaveFromIgnoredChat(bot, chatID);

    await ctx.reply(
        isWhitelistedLocally
            ? ignoreListLocale['addedAndUnwhitelisted']
            : ignoreListLocale['added']
    );
});

pm.command('removeignorelist', async ctx => {
    const userID = ctx.update.message?.from.id!;
    if (!isBotCreator(userID, creatorID)) return;

    const chatID = ctx.match;
    if (isStringEmpty(chatID))
        return await ctx.reply(otherLocale['noChatIDProvided']);

    const isIgnoredLocally = isInList(ignoreListIDs, chatID);
    if (!isIgnoredLocally)
        return await ctx.reply(ignoreListLocale['alreadyRemoved']);

    ignoreListIDs = await removeIDFromLists(
        client,
        chatID,
        ignoreListIDsListName,
        ignoreListIDs
    );

    await ctx.reply(ignoreListLocale['removed']);
});

pm.command('getignorelist', async ctx => {
    if (ignoreListIDs.length === 0)
        return await ctx.reply(ignoreListLocale['listEmpty']);
    await ctx.reply(
        `${ignoreListLocale['idsInfo']}${ignoreListIDs.join('\n')}`
    );
});

pm.on('callback_query:data', async ctx => {
    const data = ctx.update.callback_query.data;
    const splitData = data.split('|');

    if (splitData.length !== 2)
        return await ctx.answerCallbackQuery({
            text: otherLocale['callbackFailure']
        });

    const originalMessage = await ctx.editMessageReplyMarkup({
        reply_markup: undefined
    });

    const [chatID, listMode] = splitData;

    const whiteListAccept = listMode === 'accept';
    const ignoreListIgnore = listMode === 'ignore';
    const isWhitelistedLocally = isInList(whiteListIDs, chatID);
    const isIgnoredLocally = isInList(ignoreListIDs, chatID);

    if (ignoreListIgnore && !isIgnoredLocally) {
        ignoreListIDs = await addIDToLists(
            client,
            chatID,
            ignoreListIDsListName,
            ignoreListIDs
        );
        await sendIgnoredMessage(bot, chatID);
    }

    if (whiteListAccept && !isWhitelistedLocally) {
        whiteListIDs = await addIDToLists(
            client,
            chatID,
            whiteListIDsListName,
            whiteListIDs
        );
        await sendAccessGrantedMessage(bot, chatID);
    }

    const botData = await bot.api.getChatMember(chatID, ctx.me.id);
    const canBotDeleteMessages =
        botData.status === 'administrator' &&
        botData.can_delete_messages === true;
    if (!canBotDeleteMessages)
        await bot.api.sendMessage(
            chatID,
            otherLocale['botAdminWhitelistedHint']
        );

    await ctx.answerCallbackQuery({
        text: otherLocale['callbackSuccess']
    });
    await ctx.reply(
        getWhiteListKeyboardResponseLocale(whiteListAccept, ignoreListIgnore),
        {
            // @ts-ignore
            reply_to_message_id: originalMessage.message_id
        }
    );
});

bot.catch(err => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError)
        return console.error('Error in request:', e.description);
    if (e instanceof HttpError)
        return console.error('Could not contact Telegram:', e);
    return console.error('Unknown error:', e);
});

const stopOnTerm = async () => {
    if (runner.isRunning()) {
        await runner.stop();
        await client.disconnect();
        return true;
    }
    return false;
};
process.once('SIGINT', stopOnTerm);
process.once('SIGTERM', stopOnTerm);

(async () => {
    try {
        console.log('Starting bot');
        await client.connect();
        client.on('error', err => console.log('Redis Client Error', err));
        whiteListIDs = await getAllValuesFromList(client, whiteListIDsListName);
        ignoreListIDs = await getAllValuesFromList(
            client,
            ignoreListIDsListName
        );
    } catch (e) {
        console.log(e);
        await client.disconnect();
    }
})();
