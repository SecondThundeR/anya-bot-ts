import { RedisClientType, createClient } from 'redis';

import type { ListsNamesType } from '@data/listsNames';

interface ListsObject {
    [key: string]: string[];
}

class RedisSingleton {
    private static instance: RedisSingleton;
    private readonly redisClient: RedisClientType;
    private redisUser?: string = process.env.REDIS_USER;
    private redisPass?: string = process.env.REDIS_PASS;
    private redisURL?: string = process.env.REDIS_URL;
    private redisPort?: string = process.env.REDIS_PORT;
    private chatsConfigTableName?: string = process.env.CHATS_TABLE_NAME;

    private constructor() {
        if (
            this.redisUser === undefined ||
            this.redisPass === undefined ||
            this.redisURL === undefined ||
            this.redisPort === undefined
        ) {
            this.redisClient = createClient();
            return;
        }
        this.redisClient = createClient({
            url: `redis://${this.redisUser}:${this.redisPass}@${this.redisURL}:${this.redisPort}`
        });
    }

    public static getInstance(): RedisSingleton {
        if (!RedisSingleton.instance)
            RedisSingleton.instance = new RedisSingleton();
        return RedisSingleton.instance;
    }

    public async connectToServer(): Promise<void> {
        await this.redisClient.connect();
        this.redisClient.on('error', err =>
            console.log('Redis Client Error', err)
        );
    }

    public async disconnectFromServer(): Promise<void> {
        await this.redisClient.unsubscribe();
        await this.redisClient.quit();
    }

    public async getHashData(
        chatID: number | string,
        hashName: string,
        defaultData: string = ''
    ): Promise<string> {
        return (
            (await this.redisClient.hGet(
                `${this.chatsConfigTableName}:${chatID}`,
                hashName
            )) || defaultData
        );
    }

    public async getAllHashData(
        hashName: string
    ): Promise<{ [key: string]: string }> {
        return await this.redisClient.hGetAll(hashName);
    }

    public async getHashMultipleData(
        chatID: number | string,
        hashNames: string[]
    ): Promise<(string | null)[]> {
        return await this.redisClient.hmGet(
            `${this.chatsConfigTableName}:${chatID}`,
            hashNames
        );
    }

    public async getList(listName: ListsNamesType): Promise<string[]> {
        return await this.redisClient.lRange(listName, 0, -1);
    }

    public async getLists(listNames: ListsNamesType[]): Promise<ListsObject> {
        const listsData: ListsObject = {};
        for (const listName of listNames) {
            listsData[listName] = await this.getList(listName);
        }
        return listsData;
    }

    public async setHashData(
        chatID: number | string,
        hashData: { [key: string]: string }
    ): Promise<void> {
        for (const [key, value] of Object.entries(hashData)) {
            await this.redisClient.hSet(
                `${this.chatsConfigTableName}:${chatID}`,
                key,
                value
            );
        }
    }

    public async incrementFieldBy(
        hashName: string,
        field: string,
        value: number
    ): Promise<void> {
        await this.redisClient.hIncrBy(hashName, field, value);
    }

    public async pushValueToList(
        listName: string,
        value: string
    ): Promise<void> {
        await this.redisClient.rPush(listName, value);
    }

    public async deleteHashData(
        chatID: number | string,
        fieldsName: string[]
    ): Promise<void> {
        await this.redisClient.hDel(
            `${this.chatsConfigTableName}:${chatID}`,
            fieldsName
        );
    }

    public async removeValueFromList(
        listName: string,
        value: string
    ): Promise<void> {
        await this.redisClient.lRem(listName, 1, value);
    }
}

export default RedisSingleton;
