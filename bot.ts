import {
    Bot,
    dotenv,
    GrammyError,
    HttpError,
    run,
    sequentialize,
    session,
} from '@/deps.ts';
// @deno-types="npm:@types/node"
import process from 'node:process';

import otherMessages from '@/locale/otherMessages.ts';

import adminPowerTrigger from '@/groupCommands/adminPowerTrigger/index.ts';
import aidenMode from '@/groupCommands/aidenMode/index.ts';
import aidenSilentTrigger from '@/groupCommands/aidenSilentTrigger/index.ts';
import diceGame from '@/groupCommands/diceGame/index.ts';
import helpGroupMessage from '@/groupCommands/helpGroupMessage/index.ts';
import messageLocale from '@/groupCommands/messageLocale/index.ts';
import messageLocaleReset from '@/groupCommands/messageLocaleReset/index.ts';
import noCustomEmoji from '@/groupCommands/noCustomEmoji/index.ts';
import silentOffLocale from '@/groupCommands/silentOffLocale/index.ts';
import silentOffLocaleReset from '@/groupCommands/silentOffLocaleReset/index.ts';
import silentOnLocale from '@/groupCommands/silentOnLocale/index.ts';
import silentOnLocaleReset from '@/groupCommands/silentOnLocaleReset/index.ts';
import silentTrigger from '@/groupCommands/silentTrigger/index.ts';

import addIgnoreList from '@/pmCommands/addIgnoreList/index.ts';
import addWhiteList from '@/pmCommands/addWhiteList/index.ts';
import getCommandsUsage from '@/pmCommands/getCommandsUsage/index.ts';
import getIgnoreList from '@/pmCommands/getIgnoreList/index.ts';
import getWhiteList from '@/pmCommands/getWhiteList/index.ts';
import helpPMMessage from '@/pmCommands/helpPMMessage/index.ts';
import removeIgnoreList from '@/pmCommands/removeIgnoreList/index.ts';
import removeWhiteList from '@/pmCommands/removeWhiteList/index.ts';
import startMessage from '@/pmCommands/startMessage/index.ts';
import uptimeMessage from '@/pmCommands/uptimeMessage/index.ts';

import customEmojisHandler from '@/groupHandlers/customEmojisHandler/index.ts';
import groupCallbackHandler from '@/groupHandlers/groupCallbackHandler/index.ts';
import newChatHandler from '@/groupHandlers/newChatHandler/index.ts';
import premiumStickersHandler from '@/groupHandlers/premiumStickersHandler/index.ts';
import voiceAndVideoHandler from '@/groupHandlers/voiceAndVideoHandler/index.ts';

import pmCallbackHandler from '@/pmHandlers/pmCallbackHandler/index.ts';

import AsyncUtils from '@/utils/asyncUtils.ts';
import RedisSingleton from '@/utils/redisSingleton.ts';
import RegularUtils from '@/utils/regularUtils.ts';

await dotenv({ export: true, allowEmptyValues: true });

const BOT_TOKEN = Deno.env.get('BOT_TOKEN');

if (!BOT_TOKEN) {
    console.error(
        'WARNING: Token for bot is not provided. Please set the BOT_TOKEN environment variable.',
    );
    Deno.exit(1);
}

const bot = new Bot(BOT_TOKEN);
const runner = run(bot);
const client = RedisSingleton.getInstance();

const pm = bot.filter((ctx) => ctx.chat?.type === 'private');
const group = bot.filter(
    (ctx) => ctx.chat?.type !== 'private' && ctx.chat?.type !== 'channel',
);

const getSessionKeyFunc = RegularUtils.getSessionKey;
const stopOnTerm = async () => {
    if (runner.isRunning()) {
        await runner.stop();
        await client.quitClient();
        return true;
    }
    return false;
};

bot.use(sequentialize(getSessionKeyFunc));
// @ts-ignore
bot.use(session({ getSessionKeyFunc }));

// Group Commands
group.use(helpGroupMessage);
group.use(aidenMode);
group.use(silentTrigger);
group.use(aidenSilentTrigger);
group.use(diceGame);
group.use(adminPowerTrigger);
group.use(silentOnLocale);
group.use(silentOnLocaleReset);
group.use(silentOffLocale);
group.use(silentOffLocaleReset);
group.use(messageLocale);
group.use(messageLocaleReset);
group.use(noCustomEmoji);

// Group Handlers
group.use(groupCallbackHandler);
group.use(newChatHandler);
group.use(customEmojisHandler);
group.use(premiumStickersHandler);
group.use(voiceAndVideoHandler);

// PM Commands
pm.use(startMessage);
pm.use(helpPMMessage);
pm.use(addWhiteList);
pm.use(removeWhiteList);
pm.use(getWhiteList);
pm.use(addIgnoreList);
pm.use(removeIgnoreList);
pm.use(getIgnoreList);
pm.use(uptimeMessage);
pm.use(getCommandsUsage);

// PM Handlers
pm.use(pmCallbackHandler);

bot.catch(async (err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) {
        return console.error('Error in request:', e.description);
    }
    if (e instanceof HttpError) {
        return console.error('Could not contact Telegram:', e);
    }
    if (err.ctx.message) {
        await bot.api.sendMessage(
            err.ctx.message?.chat.id,
            RegularUtils.setPlaceholderData(otherMessages.unknownError, {
                error: String(e),
            }),
            {
                reply_to_message_id: RegularUtils.getMessageID(err.ctx.message),
                parse_mode: 'HTML',
            },
        );
    }
    return console.error('Unknown error occurred:', e);
});

process.once('SIGINT', stopOnTerm);
process.once('SIGTERM', stopOnTerm);

try {
    await AsyncUtils.logBotInfo(bot.api);
} catch (e) {
    console.log(e);
    await client.quitClient();
}
