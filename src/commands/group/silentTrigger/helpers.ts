import silentMessages from '@locale/silentMessages';

import RedisSingleton from '@utils/redisSingleton';
import RegularUtils from '@utils/regularUtils';

const getDefaultSilentWord = (currentStatus: boolean): string => {
    return currentStatus
        ? silentMessages.enabledDefault
        : silentMessages.disabledDefault;
};

const parseSilentValueFromDB = (currentStatus: string | null): boolean => {
    return currentStatus === null
        ? false
        : RegularUtils.getBoolean(currentStatus);
};

const changeSilentStatusInDB = async (
    client: RedisSingleton,
    chatID: number,
    silentStatus: boolean
) => {
    if (!silentStatus) return await client.deleteHashData(chatID, ['isSilent']);
    await client.setHashData(chatID, ['isSilent', String(silentStatus)]);
};

export const updateSilentData = async (
    client: RedisSingleton,
    chatID: number
): Promise<string> => {
    const [isSilentString, silentOnLocale, silentOffLocale] =
        await client.getHashMultipleData(chatID, [
            'isSilent',
            'silentOnLocale',
            'silentOffLocale'
        ]);
    const isSilentReversed = !parseSilentValueFromDB(isSilentString);
    await changeSilentStatusInDB(client, chatID, isSilentReversed);

    return RegularUtils.verifyLocaleWord(
        isSilentReversed ? silentOnLocale : silentOffLocale,
        getDefaultSilentWord(isSilentReversed)
    );
};
