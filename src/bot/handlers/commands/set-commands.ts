import { Command, CommandGroup } from "@grammyjs/commands";
import type { CommandContext } from "grammy";
import { ADMIN_COMMANDS } from "#root/bot/constants/admin-commands.js";
import type { Context } from "#root/bot/context.js";

const PRIVATE_ADMIN_COMMANDS = [
    "start",
    "help",
    "addwl",
    "remwl",
    "silentremwl",
    "getwl",
    "addil",
    "remil",
    "getil",
    "getcmdusage",
    "export",
    "uptime",
    "setcommands",
];

const GROUP_ADMIN_COMMANDS = ADMIN_COMMANDS.map((command) => command.slice(1));

const GROUP_COMMANDS = ["dice"];

function addCommandToChats(command: Command, chats: number[]) {
    for (const chatId of chats) {
        command.addToScope({
            type: "chat",
            chat_id: chatId,
        });
    }
}

export async function setCommandsHandler(ctx: CommandContext<Context>) {
    const commands = new CommandGroup();

    PRIVATE_ADMIN_COMMANDS.forEach((commandName) => {
        const command = new Command(
            commandName,
            ctx.t(`${commandName}.description`),
        );
        addCommandToChats(command, ctx.config.adminIds);

        commands.add(command);
    });

    GROUP_ADMIN_COMMANDS.forEach((commandName) => {
        const command = new Command(
            commandName,
            ctx.t(`${commandName}.description`),
        ).addToScope({ type: "all_chat_administrators" });

        commands.add(command);
    });

    GROUP_COMMANDS.forEach((commandName) => {
        const command = new Command(
            commandName,
            ctx.t(`${commandName}.description`),
        ).addToScope({ type: "all_group_chats" });

        commands.add(command);
    });

    await commands.setCommands(ctx);

    return ctx.reply(ctx.t("general.commandsUpdated"));
}
