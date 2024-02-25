import { type Context, type SessionFlavor } from "@/deps.ts";

// deno-lint-ignore no-empty-interface
interface SessionData {}

type BotContext = Context & SessionFlavor<SessionData>;

export default BotContext;
