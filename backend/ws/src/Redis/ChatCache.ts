import { PROCESS, RedisBase } from "@paybox/backend-common";
import { ChatType } from "@paybox/common";
import { RedisClientType } from "redis";
import { REDIS_URL } from "../config";

export class Redis extends RedisBase {
    public chatCache: ChatRedis
    constructor() {
        super();
        this.client.on('connect', () => {
            console.log(`Redis ${PROCESS} server connect at port: ${REDIS_URL?.split(":").slice(-1)[0]}`);
        });

        this.client.on('error', (err) => {
            console.error(`Error connecting to Redis ${PROCESS} server:`, err);
        });



        this.client.connect();
        this.chatCache = new ChatRedis(this.client, this);
    }
}

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