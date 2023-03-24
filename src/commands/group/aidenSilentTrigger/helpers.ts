import aidenPierceMessages from '@/locale/aidenPierceMessages.ts';

import RedisSingleton from '@/utils/redisSingleton.ts';
import RegularUtils from '@/utils/regularUtils.ts';

function getAidenModeWord(currentStatus: boolean) {
    return currentStatus
        ? aidenPierceMessages.silentEnabled
        : aidenPierceMessages.silentDisabled;
}

function parseSilentValueFromDB(currentStatus: string | null) {
    return currentStatus === null
        ? false
        : RegularUtils.getBoolean(currentStatus);
}

async function changeAidenSilentStatusDB(
    client: RedisSingleton,
    chatID: number,
    aidenStatus: boolean,
) {
    if (!aidenStatus) {
        return await client.deleteHashData(chatID, ['isAidenSilent']);
    }
    await client.setHashData(chatID, { isAidenSilent: String(aidenStatus) });
}

export async function updateAidenSilentData(
    redisSingleton: RedisSingleton,
    chatID: number,
) {
    const isAidenSilentEnabledString =
        (await redisSingleton.getHashData(chatID, 'isAidenSilent')) || null;
    const isAidenSilentEnabledReverse = !parseSilentValueFromDB(
        isAidenSilentEnabledString,
    );

    await changeAidenSilentStatusDB(
        redisSingleton,
        chatID,
        isAidenSilentEnabledReverse,
    );
    return getAidenModeWord(isAidenSilentEnabledReverse);
}
