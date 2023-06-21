import { Context, NextFunction } from "@/deps.ts";

import otherMessages from "@/locales/otherMessages.ts";

import { isUserACreator } from "@/utils/apiUtils.ts";

/**
 * Checks if correct user trying to invoke PM commands.
 * If user isn't a creator, replies with no PM hint mesasge
 *
 * @param ctx Context object for getting user data
 * @param next Callback for continuation of middleware flow
 */
async function checkForCreatorID(ctx: Context, next: NextFunction) {
    if (ctx.editedMessage !== undefined) return;

    const isCreator = isUserACreator(ctx);
    if (!isCreator) {
        await ctx.reply(otherMessages.noPMHint);
        return;
    }

    await next();
}

export default checkForCreatorID;
