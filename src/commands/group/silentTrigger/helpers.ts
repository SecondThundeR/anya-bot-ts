import silentMessages from '@/locale/silentMessages.ts';

import RedisSingleton from '@/utils/redisSingleton.ts';
import RegularUtils from '@/utils/regularUtils.ts';

function getDefaultSilentWord(currentStatus: boolean) {
    return currentStatus
        ? silentMessages.enabledDefault
        : silentMessages.disabledDefault;
}

function parseSilentValueFromDB(currentStatus: string | null) {
    return currentStatus === null
        ? false
        : RegularUtils.getBoolean(currentStatus);
}

async function changeSilentStatusInDB(
    client: RedisSingleton,
    chatID: number,
    silentStatus: boolean,
) {
    if (!silentStatus) return await client.deleteHashData(chatID, ['isSilent']);
    await client.setHashData(chatID, { isSilent: String(silentStatus) });
}

export async function updateSilentData(
    client: RedisSingleton,
    chatID: number,
) {
    const [isSilentString, silentOnLocale, silentOffLocale] = await client
        .getHashMultipleData(chatID, [
            'isSilent',
            'silentOnLocale',
            'silentOffLocale',
        ]);
    const isSilentReversed = !parseSilentValueFromDB(isSilentString);
    await changeSilentStatusInDB(client, chatID, isSilentReversed);

    return RegularUtils.verifyLocaleWord(
        isSilentReversed ? silentOnLocale : silentOffLocale,
        getDefaultSilentWord(isSilentReversed),
    );
}
