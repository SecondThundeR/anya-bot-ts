import RedisSingleton from '@utils/redisSingleton';

export const deleteLocaleChangingStatus = async (
    client: RedisSingleton,
    chatID: string
) => {
    return await client.deleteHashData(chatID, ['isMessageLocaleChanging']);
};
