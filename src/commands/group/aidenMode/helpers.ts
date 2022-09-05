import RegularUtils from '../../../utils/regularUtils';
import aidenPierceMessages from '../../../locale/aidenPierceMessages';
import RedisSingleton from '../../../utils/redisSingleton';
import { Context } from "grammy";

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
    ctx: Context
) => {
    const chatID = RegularUtils.getChatID(ctx);
    const redisInstance = RedisSingleton.getInstance();

    const isAidenEnabledString =
        (await redisInstance.getHashData(chatID, 'aidenMode')) || null;
    const isAidenEnabledReverse = !parseAidenValueFromDB(isAidenEnabledString);

    await changeAidenStatusDB(redisInstance, chatID, isAidenEnabledReverse);
    return getAidenModeWord(isAidenEnabledReverse);
};
