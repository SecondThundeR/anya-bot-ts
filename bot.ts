import { run, sequentialize } from "@grammyjs/runner";
import { Bot, GrammyError, HttpError, session } from "grammy";

import adminPowerTrigger from "@groupCommands/adminPowerTrigger";
import aidenMode from "@groupCommands/aidenMode";
import aidenSilentTrigger from "@groupCommands/aidenSilentTrigger";
import diceGame from "@groupCommands/diceGame";
import helpGroupMessage from "@groupCommands/helpGroupMessage";
import messageLocale from "@groupCommands/messageLocale";
import messageLocaleReset from "@groupCommands/messageLocaleReset";
import noCustomEmoji from "@groupCommands/noCustomEmoji";
import silentOffLocale from "@groupCommands/silentOffLocale";
import silentOffLocaleReset from "@groupCommands/silentOffLocaleReset";
import silentOnLocale from "@groupCommands/silentOnLocale";
import silentOnLocaleReset from "@groupCommands/silentOnLocaleReset";
import silentTrigger from "@groupCommands/silentTrigger";

import addIgnoreList from "@pmCommands/addIgnoreList";
import addWhiteList from "@pmCommands/addWhiteList";
import getCommandsUsage from "@pmCommands/getCommandsUsage";
import getIgnoreList from "@pmCommands/getIgnoreList";
import getWhiteList from "@pmCommands/getWhiteList";
import helpPMMessage from "@pmCommands/helpPMMessage";
import removeIgnoreList from "@pmCommands/removeIgnoreList";
import removeWhiteList from "@pmCommands/removeWhiteList";
import startMessage from "@pmCommands/startMessage";
import uptimeMessage from "@pmCommands/uptimeMessage";

import customEmojisHandler from "@groupHandlers/customEmojisHandler";
import groupCallbackHandler from "@groupHandlers/groupCallbackHandler";
import newChatHandler from "@groupHandlers/newChatHandler";
import premiumStickersHandler from "@groupHandlers/premiumStickersHandler";
import voiceAndVideoHandler from "@groupHandlers/voiceAndVideoHandler";

import pmCallbackHandler from "@pmHandlers/pmCallbackHandler";

import otherMessages from "@locale/otherMessages";

import AsyncUtils from "@utils/asyncUtils";
import RedisSingleton from "@utils/redisSingleton";
import RegularUtils from "@utils/regularUtils";

if (process.env.NODE_ENV === "local") {
    require("dotenv").config();
}

const botToken = process.env.BOT_TOKEN;
if (botToken === undefined) {
    console.log("Can't find bot token. Exiting...");
    process.exit(1);
}

const bot = new Bot(botToken);
const runner = run(bot);
const client = RedisSingleton.getInstance();

const pm = bot.filter(ctx => ctx.chat?.type === "private");
const group = bot.filter(
    ctx => ctx.chat?.type !== "private" && ctx.chat?.type !== "channel"
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

bot.catch(async err => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError)
        return console.error("Error in request:", e.description);
    if (e instanceof HttpError)
        return console.error("Could not contact Telegram:", e);
    if (err.ctx.message)
        await bot.api.sendMessage(
            err.ctx.message?.chat.id,
            RegularUtils.setPlaceholderData(otherMessages.unknownError, {
                error: String(e)
            }),
            {
                reply_to_message_id: RegularUtils.getMessageID(err.ctx.message),
                parse_mode: "HTML"
            }
        );
    return console.error("Unknown error occurred:", e);
});

process.once("SIGINT", stopOnTerm);
process.once("SIGTERM", stopOnTerm);

(async () => {
    try {
        await client.connectToServer();
        await AsyncUtils.logBotInfo(bot.api);
    } catch (e: any) {
        console.log(e);
        await client.disconnectFromServer();
    }
})();
