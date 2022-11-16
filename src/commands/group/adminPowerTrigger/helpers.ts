import RedisSingleton from '@/utils/redisSingleton.ts';
import RegularUtils from '@/utils/regularUtils.ts';

const getDefaultAllowWord = (currentStatus: boolean): string => {
    return currentStatus
        ? 'Сила админов в деле! Теперь я не буду удалять запрещенный контент, отправленный ими'
        : 'Чувствуете? Сила админов кажется исчезла :( Теперь я буду удалять запрещенный контент, отправленный ими';
};

const parseSilentValueFromDB = (currentStatus: string | null): boolean => {
    return currentStatus === null
        ? false
        : RegularUtils.getBoolean(currentStatus);
};

const changeAllowValueInDB = async (
    client: RedisSingleton,
    chatID: number,
    silentStatus: boolean,
) => {
    if (!silentStatus) {
        return await client.deleteHashData(chatID, ['adminPower']);
    }
    await client.setHashData(chatID, { adminPower: String(silentStatus) });
};

export const updateAllowData = async (
    client: RedisSingleton,
    chatID: number,
): Promise<string> => {
    const allowStickersString = await client.getHashData(chatID, 'adminPower');
    const allowStickersStringReversed = !parseSilentValueFromDB(
        allowStickersString,
    );
    await changeAllowValueInDB(client, chatID, allowStickersStringReversed);

    return getDefaultAllowWord(allowStickersStringReversed);
};
