export interface RedisClientInitOptions {
    username?: string;
    password?: string;
    hostname?: string;
    port?: string;
    tableName?: string;
}

export type RedisClientData = string[] | Record<string, string>;
