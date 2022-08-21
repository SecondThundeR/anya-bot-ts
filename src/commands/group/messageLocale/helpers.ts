import RedisSingleton from '../../../utils/redisSingleton';

export const getLocaleChangingStatus = async (
    client: RedisSingleton,
    chatID: number
): Promise<string | null> => {
    return (
        (await client.getHashData(chatID, 'isMessageLocaleChanging')) || null
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
    return await client.setHashData(chatID, [
        'isMessageLocaleChanging',
        'true'
    ]);
};
