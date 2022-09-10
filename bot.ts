import { Bot, GrammyError, HttpError, session } from 'grammy';
import { run, sequentialize } from '@grammyjs/runner';

import RegularUtils from './src/utils/regularUtils';
import AsyncUtils from './src/utils/asyncUtils';
import RedisSingleton from './src/utils/redisSingleton';

import helpGroupMessage from './src/commands/group/helpGroupMessage/helpGroupMessage';
import silentTrigger from './src/commands/group/silentTrigger/silentTrigger';
import aidenMode from './src/commands/group/aidenMode/aidenMode';
import aidenSilentTrigger from './src/commands/group/aidenSilentTrigger/aidenSilentTrigger';
import silentOnLocale from './src/commands/group/silentOnLocale/silentOnLocale';
import silentOnLocaleReset from './src/commands/group/silentOnLocaleReset/silentOnLocaleReset';
import silentOffLocale from './src/commands/group/silentOffLocale/silentOffLocale';
import silentOffLocaleReset from './src/commands/group/silentOffLocaleReset/silentOffLocaleReset';
import messageLocale from './src/commands/group/messageLocale/messageLocale';
import messageLocaleReset from './src/commands/group/messageLocaleReset/messageLocaleReset';
import noCustomEmoji from './src/commands/group/noCustomEmoji/noCustomEmoji';

import newChatHandler from './src/handlers/group/newChatHandler/newChatHandler';
import groupCallbackHandler from './src/handlers/group/groupCallbackHandler/groupCallbackHandler';
import customEmojisHandler from './src/handlers/group/customEmojisHandler/customEmojisHandler';
import premiumStickersHandler from './src/handlers/group/premiumStickersHandler/premiumStickersHandler';
import voiceAndVideoHandler from './src/handlers/group/voiceAndVideoHandler/voiceAndVideoHandler';
import startMessage from './src/commands/pm/startMessage/startMessage';
import helpPMMessage from './src/commands/pm/helpPMMessage/helpPMMessage';
import addWhiteList from './src/commands/pm/addWhiteList/addWhiteList';
import removeWhiteList from './src/commands/pm/removeWhiteList/removeWhiteList';
import getWhiteList from './src/commands/pm/getWhiteList/getWhiteList';
import addIgnoreList from './src/commands/pm/addIgnoreList/addIgnoreList';
import removeIgnoreList from './src/commands/pm/removeIgnoreList/removeIgnoreList';
import getIgnoreList from './src/commands/pm/getIgnoreList/getIgnoreList';
import pmCallbackHandler from './src/handlers/pm/pmCallbackHandler/pmCallbackHandler';
import adminPowerTrigger from './src/commands/group/adminPowerTrigger/adminPowerTrigger';
import uptimeMessage from './src/commands/pm/uptimeMessage/uptimeMessage';

if (process.env.NODE_ENV === 'local') {
    require('dotenv').config();
}

const botToken = process.env.BOT_KEY;
if (botToken === undefined) {
    console.log("Can't find bot token. Exiting...");
    process.exit(1);
}

const bot = new Bot(botToken);
const runner = run(bot);
const client = RedisSingleton.getInstance();

const pm = bot.filter(ctx => ctx.chat?.type === 'private');
const group = bot.filter(
    ctx => ctx.chat?.type !== 'private' && ctx.chat?.type !== 'channel'
);

const getSessionKeyFunc = RegularUtils.getSessionKey;
const stopOnTerm = async () => {
    if (runner.isRunning()) {
        await runner.stop();
        await client.disconnectFromServer();
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

// PM Handlers
pm.use(pmCallbackHandler);

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

process.once('SIGINT', stopOnTerm);
process.once('SIGTERM', stopOnTerm);

(async () => {
    try {
        await client.connectToServer();
        await AsyncUtils.logBotInfo(bot.api);
    } catch (e) {
        console.log(e);
        await client.disconnectFromServer();
    }
})();
