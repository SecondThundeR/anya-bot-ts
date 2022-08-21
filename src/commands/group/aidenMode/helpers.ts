import RegularUtils from '../../../utils/regularUtils';
import aidenPierceMessages from '../../../locale/aidenPierceMessages';
import RedisSingleton from '../../../utils/redisSingleton';

const getAidenModeWord = (currentStatus: boolean): string => {
    return currentStatus
        ? aidenPierceMessages.enabled
        : aidenPierceMessages.disabled;
};

const parseAidenValueFromDB = (currentStatus: string | null): boolean => {
    return currentStatus === null
        ? false
        : RegularUtils.getBoolean(currentStatus);
};

const changeAidenStatusDB = async (
    client: RedisSingleton,
    chatID: number,
    aidenStatus: boolean
) => {
    if (!aidenStatus) return await client.deleteHashData(chatID, ['aidenMode']);
    await client.setHashData(chatID, ['aidenMode', String(aidenStatus)]);
};

export const updateAidenData = async (
    redisSingleton: RedisSingleton,
    chatID: number
) => {
    const isAidenEnabledString =
        (await redisSingleton.getHashData(chatID, 'aidenMode')) || null;
    const isAidenEnabledReverse = !parseAidenValueFromDB(isAidenEnabledString);

    await changeAidenStatusDB(redisSingleton, chatID, isAidenEnabledReverse);
    return getAidenModeWord(isAidenEnabledReverse);
};
