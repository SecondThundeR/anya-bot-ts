import {
    Bot,
    conversations,
    createConversation,
    dotenv,
    GrammyError,
    HttpError,
    run,
    RunnerHandle,
    sequentialize,
    session,
} from "@/deps.ts";
// @deno-types="npm:@types/node"
import process from "node:process";

import importDatabaseConversation from "@/conversations/importDatabase.ts";

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

import pmCallbackHandler from "@/pmHandlers/pmCallbackHandler/index.ts";

import redisClient from "@/database/redisClient.ts";

import otherMessages from "@/locales/otherMessages.ts";

import checkForAdminCommand from "@/middlewares/group/checkForAdminCommand.ts";
import checkForWhitelist from "@/middlewares/group/checkForWhitelist.ts";
import incrementCommandUsage from "@/middlewares/group/incrementCommandUsage.ts";
import checkForCreatorID from "@/middlewares/pm/checkForCreatorID.ts";

import BotContext from "@/types/context.ts";

import { getMessageID, getSessionKey } from "@/utils/apiUtils.ts";
import { logBotInfo } from "@/utils/asyncUtils.ts";
import { setPlaceholderData } from "@/utils/generalUtils.ts";

await dotenv({ export: true, allowEmptyValues: true });

const BOT_TOKEN = Deno.env.get("BOT_TOKEN");
if (!BOT_TOKEN) {
    throw new Error(
        "Token for bot wasn't provided. Please set the BOT_TOKEN environment variable.",
    );
}

const bot = new Bot<BotContext>(BOT_TOKEN);
let runner: RunnerHandle | undefined;

bot.use(session({
    initial: () => ({}),
    getSessionKey,
}));
bot.use(sequentialize(getSessionKey));
bot.use(conversations());
bot.use(createConversation(importDatabaseConversation, "import"));

const pm = bot.filter((ctx) => ctx.chat?.type === "private");
const group = bot.filter(
    (ctx) => ctx.chat?.type !== "private" && ctx.chat?.type !== "channel",
);

// Commands Middlewares
group.use(checkForWhitelist);
group.use(checkForAdminCommand);
group.use(incrementCommandUsage);
pm.use(checkForCreatorID);

// Group Commands
group.use(adminPowerTrigger);
group.use(aidenMode);
group.use(aidenSilentTrigger);
group.use(diceGame);
group.use(helpGroupMessage);
group.use(messageLocale);
group.use(messageLocaleReset);
group.use(noCustomEmoji);
group.use(silentOffLocale);
group.use(silentOffLocaleReset);
group.use(silentOnLocale);
group.use(silentOnLocaleReset);
group.use(silentTrigger);

// Group Handlers
group.use(groupCallbackHandler);
group.use(customEmojisHandler);
group.use(inlineNicknameGenerator);
group.use(newChatHandler);
group.use(premiumStickersHandler);
group.use(voiceAndVideoHandler);

// PM Commands
pm.use(addIgnoreList);
pm.use(addWhiteList);
pm.use(exportDatabase);
pm.use(getCommandsUsage);
pm.use(getIgnoreList);
pm.use(getWhiteList);
pm.use(helpPMMessage);
pm.use(importDatabase);
pm.use(removeIgnoreList);
pm.use(removeWhiteList);
pm.use(startMessage);
pm.use(uptimeCommand);

// PM Handlers
pm.use(pmCallbackHandler);

bot.catch(async (err) => {
    const { ctx, error, ctx: { message } } = err;

    console.error(
        `Error while handling update: ${JSON.stringify(ctx.update, null, 4)}`,
    );

    if (error instanceof GrammyError) {
        console.error("Error in request:", error.description);
        return;
    }

    if (error instanceof HttpError) {
        console.error("Could not contact Telegram:", error);
        return;
    }

    if (message) {
        await bot.api.sendMessage(
            message?.chat.id,
            setPlaceholderData(otherMessages.unknownError, {
                error: String(error),
            }),
            {
                reply_to_message_id: getMessageID(message),
                parse_mode: "HTML",
            },
        );
    }
    console.error("Unknown error occurred:", error);
});

const stopOnTerm = async () => {
    if (runner?.isRunning()) {
        await runner.stop();
        await redisClient.quitClient();
        return true;
    }
    return false;
};

process.once("SIGINT", stopOnTerm);
process.once("SIGTERM", stopOnTerm);

try {
    runner = run(bot);
    await logBotInfo(bot.api);
} catch (e) {
    console.log(e);
    await redisClient.quitClient();
}
