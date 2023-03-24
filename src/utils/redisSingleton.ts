import { createClient } from "redis";
import type { RedisClientType } from "redis";

import type { ListsNamesType } from "@data/listsNames";

interface ListsObject {
    [key: string]: string[];
}

class RedisSingleton {
    private static instance: RedisSingleton;
    private readonly redisClient: RedisClientType;
    private redisUser = process.env.REDIS_USER;
    private redisPass = process.env.REDIS_PASS;
    private redisURL = process.env.REDIS_URL;
    private redisPort = process.env.REDIS_PORT;
    private chatsConfigTableName = process.env.CHATS_TABLE_NAME;

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

    public static getInstance() {
        if (!RedisSingleton.instance)
            RedisSingleton.instance = new RedisSingleton();
        return RedisSingleton.instance;
    }

    public async connectToServer() {
        await this.redisClient.connect();
        this.redisClient.on("error", err =>
            console.log("Redis Client Error", err)
        );
    }

    public async disconnectFromServer() {
        await this.redisClient.unsubscribe();
        await this.redisClient.quit();
    }

    public async getHashData(
        chatID: number | string,
        hashName: string,
        defaultData: string = ""
    ) {
        return (
            (await this.redisClient.hGet(
                `${this.chatsConfigTableName}:${chatID}`,
                hashName
            )) || defaultData
        );
    }

    public async getAllHashData(hashName: string) {
        return await this.redisClient.hGetAll(hashName);
    }

    public async getHashMultipleData(
        chatID: number | string,
        hashNames: string[]
    ) {
        return (await this.redisClient.hmGet(
            `${this.chatsConfigTableName}:${chatID}`,
            hashNames
        )) as (string | null)[];
    }

    public async getList(listName: ListsNamesType) {
        return await this.redisClient.lRange(listName, 0, -1);
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
        hashData: { [key: string]: string }
    ) {
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
    ) {
        await this.redisClient.hIncrBy(hashName, field, value);
    }

    public async pushValueToList(listName: string, value: string) {
        await this.redisClient.rPush(listName, value);
    }

    public async deleteHashData(chatID: number | string, fieldsName: string[]) {
        await this.redisClient.hDel(
            `${this.chatsConfigTableName}:${chatID}`,
            fieldsName
        );
    }

    public async removeValueFromList(listName: string, value: string) {
        await this.redisClient.lRem(listName, 1, value);
    }
}

export default RedisSingleton;
