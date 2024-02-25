export class RedisClientException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "RedisClientException";
    }
}
