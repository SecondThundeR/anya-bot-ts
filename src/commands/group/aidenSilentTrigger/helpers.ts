import aidenPierceMessages from '../../../locale/aidenPierceMessages';
import RedisSingleton from '../../../utils/redisSingleton';
import RegularUtils from '../../../utils/regularUtils';

const getAidenModeWord = (currentStatus: boolean): string => {
    return currentStatus
        ? aidenPierceMessages.silentEnabled
        : aidenPierceMessages.silentDisabled;
};

const parseSilentValueFromDB = (currentStatus: string | null): boolean => {
    return currentStatus === null
        ? false
        : RegularUtils.getBoolean(currentStatus);
};

const changeAidenSilentStatusDB = async (
    client: RedisSingleton,
    chatID: number,
    aidenStatus: boolean
) => {
    if (!aidenStatus)
        return await client.deleteHashData(chatID, ['isAidenSilent']);
    await client.setHashData(chatID, ['isAidenSilent', String(aidenStatus)]);
};

export const updateAidenSilentData = async (
    redisSingleton: RedisSingleton,
    chatID: number
) => {
    const isAidenSilentEnabledString =
        (await redisSingleton.getHashData(chatID, 'isAidenSilent')) || null;
    const isAidenSilentEnabledReverse = !parseSilentValueFromDB(
        isAidenSilentEnabledString
    );

    await changeAidenSilentStatusDB(
        redisSingleton,
        chatID,
        isAidenSilentEnabledReverse
    );
    return getAidenModeWord(isAidenSilentEnabledReverse);
};
