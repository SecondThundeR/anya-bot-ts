import ADMIN_COMMANDS from "@/constants/adminCommands.ts";

/**
 * Names of all public commands
 */
const REGULAR_COMMANDS = [
    ...ADMIN_COMMANDS,
    "/dice",
];

export default REGULAR_COMMANDS;
