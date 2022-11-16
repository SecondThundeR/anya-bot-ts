import RedisSingleton from '@utils/redisSingleton';
import RegularUtils from '@utils/regularUtils';

export const getLocaleChangingStatus = async (
    client: RedisSingleton,
    chatID: number
): Promise<boolean> => {
    return RegularUtils.getBoolean(
        await client.getHashData(chatID, 'isMessageLocaleChanging')
    );
};

export const deleteLocaleChangingStatus = async (
    client: RedisSingleton,
    chatID: number
) => {
    return await client.deleteHashData(chatID, ['isMessageLocaleChanging']);
};

export const setLocaleChangingStatus = async (
    client: RedisSingleton,
    chatID: number
) => {
    return await client.setHashData(chatID, {
        isMessageLocaleChanging: 'true'
    });
};
