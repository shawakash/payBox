import { RedisClientType } from "redis";
import { Redis } from "..";
import { NotifSubType } from "@paybox/common";

export class NotifCache {
    private client: RedisClientType;
    private redis: Redis;

    constructor(client: RedisClientType, redis: Redis) {
        this.client = client;
        this.redis = redis;
    }

    async cacheNotifSub<T extends NotifSubType>(key: string, value: T, expire: number): Promise<void> {
        //TODO: use json.set after upgrading redis
        await this.client.hSet(key, {
            auth: value.auth,
            endpoint: value.endpoint,
            expirationTime: value.expirationTime || "",
            p256dh: value.p256dh,
            clientId: value.clientId,
            id: value.id,
        });
        await this.client.expire(
            key,
            expire
        );
        console.log(`Notif Sub Cached ${key}`);
        return;
    }

}