import { createLazyClient, Redis } from '@/deps.ts';

import type { ListsNamesType } from '@/data/listsNames.ts';

interface ListsObject {
    [key: string]: string[];
}

class RedisSingleton {
    private static instance: RedisSingleton;
    private readonly redisClient: Redis;
    private redisUser = Deno.env.get('REDIS_USER') || undefined;
    private redisPass = Deno.env.get('REDIS_PASS') || undefined;
    private redisHost = Deno.env.get('REDIS_URL') || '127.0.0.1';
    private redisPort = Deno.env.get('REDIS_PORT') || '6379';
    private chatsConfigTableName = Deno.env.get('CHATS_TABLE_NAME');

    private constructor() {
        this.redisClient = createLazyClient({
            hostname: this.redisHost,
            port: parseInt(this.redisPort),
            password: this.redisPass,
            username: this.redisUser,
        });
    }

    public static getInstance() {
        if (!RedisSingleton.instance) {
            RedisSingleton.instance = new RedisSingleton();
        }
        return RedisSingleton.instance;
    }

    public async quitClient() {
        await this.redisClient.quit();
    }

    public async getHashData(
        chatID: number | string,
        hashName: string,
        defaultData = '',
    ) {
        return (
            (await this.redisClient.hget(
                `${this.chatsConfigTableName}:${chatID}`,
                hashName,
            )) || defaultData
        );
    }

    public async getAllHashData(
        hashName: string,
    ) {
        return await this.redisClient.hgetall(hashName);
    }

    public async getHashMultipleData(
        chatID: number | string,
        hashNames: string[],
    ) {
        return await this.redisClient.hmget(
            `${this.chatsConfigTableName}:${chatID}`,
            ...hashNames,
        ) as (string | null)[];
    }

    public async getList(listName: ListsNamesType) {
        return await this.redisClient.lrange(listName, 0, -1);
    }

    public async getLists(listNames: ListsNamesType[]) {
        const listsData: ListsObject = {};
        for (const listName of listNames) {
            listsData[listName] = await this.getList(listName);
        }
        return listsData;
    }

    public async setHashData(
        chatID: number | string,
        hashData: { [key: string]: string },
    ) {
        for (const [key, value] of Object.entries(hashData)) {
            await this.redisClient.hset(
                `${this.chatsConfigTableName}:${chatID}`,
                key,
                value,
            );
        }
    }

    public async incrementFieldBy(
        hashName: string,
        field: string,
        value: number,
    ) {
        await this.redisClient.hincrby(hashName, field, value);
    }

    public async pushValueToList(
        listName: string,
        value: string,
    ) {
        await this.redisClient.rpush(listName, value);
    }

    public async deleteHashData(
        chatID: number | string,
        hashNames: string[],
    ) {
        await this.redisClient.hdel(
            `${this.chatsConfigTableName}:${chatID}`,
            ...hashNames,
        );
    }

    public async removeValueFromList(
        listName: string,
        value: string,
    ) {
        await this.redisClient.lrem(listName, 1, value);
    }
}

export default RedisSingleton;
