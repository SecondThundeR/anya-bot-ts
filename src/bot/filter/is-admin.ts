import type { Context } from "#root/bot/context.js";

export function isAdmin(ctx: Context) {
    return !!ctx.from && ctx.config.adminIds.includes(ctx.from.id);
}
