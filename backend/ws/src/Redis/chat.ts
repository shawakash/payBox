import { PROCESS, RedisBase } from "@paybox/backend-common";
import { ChatType } from "@paybox/common";
import { RedisClientType } from "redis";
import {Redis} from "./ChatCache";

export class ChatRedis {
    private client: RedisClientType;
    private redis: Redis;

    constructor(client: RedisClientType, redis: Redis) {
        this.client = client;
        this.redis = redis;
    }

    async cacheChats<T extends ChatType[]>(key: string, chats: T, expire: number): Promise<void> {
        const data = await this.client.json.set(key, ".", JSON.stringify(chats));
        await this.client.expire(key, expire);
        console.log(`Chats Cached ${data}`);
        return;
    }

    async getCacheChats<T extends ChatType[]>(key: string): Promise<T | null> {
        const chats = await this.client.json.get(key);
        console.log(JSON.parse(JSON.stringify(chats)))
        return chats ? JSON.parse(JSON.stringify(chats)) as T : null;
    }
}