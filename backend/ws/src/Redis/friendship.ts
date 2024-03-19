import { PROCESS, RedisBase } from "@paybox/backend-common";
import { ChatType, FriendshipType } from "@paybox/common";
import { RedisClientType } from "redis";
import {Redis} from "./ChatCache";

export class FriendshipCache {
    private client: RedisClientType;
    private redis: Redis;

    constructor(client: RedisClientType, redis: Redis) {
        this.client = client;
        this.redis = redis;
    }

    async cacheFriendships<T extends FriendshipType[]>(key: string, friendships: T, expire: number): Promise<void> {
        const data = await this.client.json.set(key, ".", JSON.stringify(friendships));
        await this.client.expire(key, expire);
        console.log(`Chats Cached ${data}`);
        return;
    }

    async getFriendships<T extends FriendshipType[]>(key: string): Promise<T | null> {
        const friendships = await this.client.json.get(key);
        console.log(JSON.parse(JSON.stringify(friendships)))
        return friendships ? JSON.parse(JSON.stringify(friendships)) as T : null;
    }
}