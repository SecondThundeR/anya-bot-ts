import {
    Bot,
    dotenv,
    GrammyError,
    HttpError,
    run,
    sequentialize,
    session,
} from "@/deps.ts";

await dotenv({ export: true, allowEmptyValues: true });

import adminPowerTrigger from "@/groupCommands/adminPowerTrigger/index.ts";
import aidenMode from "@/groupCommands/aidenMode/index.ts";
import aidenSilentTrigger from "@/groupCommands/aidenSilentTrigger/index.ts";
import diceGame from "@/groupCommands/diceGame/index.ts";
import helpGroupMessage from "@/groupCommands/helpGroupMessage/index.ts";
import messageLocale from "@/groupCommands/messageLocale/index.ts";
import messageLocaleReset from "@/groupCommands/messageLocaleReset/index.ts";
import noCustomEmoji from "@/groupCommands/noCustomEmoji/index.ts";
import silentOffLocale from "@/groupCommands/silentOffLocale/index.ts";
import silentOffLocaleReset from "@/groupCommands/silentOffLocaleReset/index.ts";
import silentOnLocale from "@/groupCommands/silentOnLocale/index.ts";
import silentOnLocaleReset from "@/groupCommands/silentOnLocaleReset/index.ts";
import silentTrigger from "@/groupCommands/silentTrigger/index.ts";

import addIgnoreList from "@/pmCommands/addIgnoreList/index.ts";
import addWhiteList from "@/pmCommands/addWhiteList/index.ts";
import exportDatabase from "@/pmCommands/exportDatabase/index.ts";
import getCommandsUsage from "@/pmCommands/getCommandsUsage/index.ts";
import getIgnoreList from "@/pmCommands/getIgnoreList/index.ts";
import getWhiteList from "@/pmCommands/getWhiteList/index.ts";
import helpPMMessage from "@/pmCommands/helpPMMessage/index.ts";
import importDatabase from "@/pmCommands/importDatabase/index.ts";
import removeIgnoreList from "@/pmCommands/removeIgnoreList/index.ts";
import removeWhiteList from "@/pmCommands/removeWhiteList/index.ts";
import startMessage from "@/pmCommands/startMessage/index.ts";
import uptimeCommand from "@/pmCommands/uptimeCommand/index.ts";

import customEmojisHandler from "@/groupHandlers/customEmojisHandler/index.ts";
import groupCallbackHandler from "@/groupHandlers/groupCallbackHandler/index.ts";
import inlineNicknameGenerator from "@/groupHandlers/inlineNicknameGenerator/index.ts";
import newChatHandler from "@/groupHandlers/newChatHandler/index.ts";
import premiumStickersHandler from "@/groupHandlers/premiumStickersHandler/index.ts";
import voiceAndVideoHandler from "@/groupHandlers/voiceAndVideoHandler/index.ts";

import { importFileHandler } from "@/pmHandlers/importFileHandler/index.ts";
import pmCallbackHandler from "@/pmHandlers/pmCallbackHandler/index.ts";

import { RedisClient } from "@/database/redisClient.ts";
import { RedisClientException } from "@/database/redisClientException.ts";

import checkForAdminCommand from "@/middlewares/group/checkForAdminCommand.ts";
import checkForWhitelist from "@/middlewares/group/checkForWhitelist.ts";
import incrementCommandUsage from "@/middlewares/group/incrementCommandUsage.ts";
import checkForCreatorID from "@/middlewares/pm/checkForCreatorID.ts";

import BotContext from "@/types/context.ts";

import { getSessionKey, sendErrorMessage } from "@/utils/apiUtils.ts";
import { logBotInfo } from "@/utils/asyncUtils.ts";

RedisClient.init({
    username: Deno.env.get("REDISUSER"),
    password: Deno.env.get("REDISPASS"),
    hostname: Deno.env.get("REDISHOST"),
    port: Deno.env.get("REDISPORT"),
    tableName: Deno.env.get("CHATS_TABLE_NAME"),
});

const BOT_TOKEN = Deno.env.get("BOT_TOKEN");
if (!BOT_TOKEN) {
    throw new Error(
        "Token for bot wasn't provided. Please set the BOT_TOKEN environment variable.",
    );
}

const bot = new Bot<BotContext>(BOT_TOKEN);

bot
    .use(sequentialize(getSessionKey))
    .use(session({ getSessionKey }));

const pm = bot.filter((ctx) => ctx.chat?.type === "private");
const group = bot.filter(
    (ctx) => ctx.chat?.type !== "private" && ctx.chat?.type !== "channel",
);

// Commands Middlewares
group.use(checkForWhitelist)
    .use(checkForAdminCommand)
    .use(incrementCommandUsage);
pm.use(checkForCreatorID);

// Group Commands
group.use(adminPowerTrigger)
    .use(aidenMode)
    .use(aidenSilentTrigger)
    .use(diceGame)
    .use(helpGroupMessage)
    .use(messageLocale)
    .use(messageLocaleReset)
    .use(noCustomEmoji)
    .use(silentOffLocale)
    .use(silentOffLocaleReset)
    .use(silentOnLocale)
    .use(silentOnLocaleReset)
    .use(silentTrigger)
    // Group Handlers
    .use(groupCallbackHandler)
    .use(customEmojisHandler)
    .use(inlineNicknameGenerator)
    .use(newChatHandler)
    .use(premiumStickersHandler)
    .use(voiceAndVideoHandler);

// PM Commands
pm.use(addIgnoreList)
    .use(addWhiteList)
    .use(exportDatabase)
    .use(getCommandsUsage)
    .use(getIgnoreList)
    .use(getWhiteList)
    .use(helpPMMessage)
    .use(importDatabase)
    .use(removeIgnoreList)
    .use(removeWhiteList)
    .use(startMessage)
    .use(uptimeCommand)
    // PM Handlers
    .use(pmCallbackHandler)
    .use(importFileHandler);

bot.catch(async (err) => {
    const { ctx, error, ctx: { message } } = err;

    console.error(
        `Error while handling update: ${JSON.stringify(ctx.update, null, 4)}`,
    );

    if (error instanceof RedisClientException) {
        console.error(error.message);
        Deno.exit(727);
    }

    if (error instanceof GrammyError) {
        console.error("Error in request:", error.description);
        return;
    }

    if (error instanceof HttpError) {
        console.error("Could not contact Telegram:", error);
        return;
    }

    if (message) {
        await sendErrorMessage(bot.api, message, error);
    }

    console.error("Unknown error occurred:", error);
});

const runner = run(bot);

const stopRunner = async () => {
    if (runner.isRunning()) {
        await runner.stop();
    }
    await RedisClient.quitClient();
    Deno.exit();
};

Deno.addSignalListener("SIGINT", stopRunner);
Deno.addSignalListener("SIGTERM", stopRunner);

try {
    await logBotInfo(bot.api);
} catch (e) {
    console.log(e);
    await RedisClient.quitClient();
}
