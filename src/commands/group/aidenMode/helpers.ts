import { Context } from '@/deps.ts';

import aidenPierceMessages from '@/locale/aidenPierceMessages.ts';

import RedisSingleton from '@/utils/redisSingleton.ts';
import RegularUtils from '@/utils/regularUtils.ts';

function getAidenModeWord(currentStatus: boolean) {
    return currentStatus
        ? aidenPierceMessages.enabled
        : aidenPierceMessages.disabled;
}

function parseAidenValueFromDB(currentStatus: string | null) {
    return currentStatus === null
        ? false
        : RegularUtils.getBoolean(currentStatus);
}

async function changeAidenStatusDB(
    client: RedisSingleton,
    chatID: number,
    aidenStatus: boolean,
) {
    if (!aidenStatus) return await client.deleteHashData(chatID, ['aidenMode']);
    await client.setHashData(chatID, { aidenMode: String(aidenStatus) });
}

export async function updateAidenData(ctx: Context) {
    const chatID = RegularUtils.getChatID(ctx);
    const redisInstance = RedisSingleton.getInstance();

    const isAidenEnabledString =
        (await redisInstance.getHashData(chatID, 'aidenMode')) || null;
    const isAidenEnabledReverse = !parseAidenValueFromDB(isAidenEnabledString);

    await changeAidenStatusDB(redisInstance, chatID, isAidenEnabledReverse);
    return getAidenModeWord(isAidenEnabledReverse);
}
