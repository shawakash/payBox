import { RedisClientType, createClient } from "redis";
import { REDIS_URL } from "./config";
import { Client } from "@paybox/common";

export class Redis {
    private client: RedisClientType;
    private static instance: Redis;

    constructor() {
        this.client = createClient({
            url: REDIS_URL,
        });
        this.client.connect();
    }

    public static getInstance(): Redis {
        if (!this.instance) {
            this.instance = new Redis();
        }
        return this.instance;
    }

    async cacheClient(key: string, items: Client) {
        const serializedItem = JSON.stringify(items);
        const data = await this.client.hSet(key,
            {
                id: items.id,
                firstname: items.firstname || "",
                lastname: items.lastname || "",
                email: items.email,
                mobile: items.mobile || "",
                username: items.username,
                password: items.password,
                chain: JSON.stringify(items.chain)
            });
        console.log(`User Cached ${data}`);
        await this.cacheUsername(items.username, items.id);
        await this.cacheEmail(items.email, items.id);
        return;
    }

    async getClientCache(key: string): Promise<Client | null> {
        const client = await this.client.hGetAll(key);

        if (!client) {
            return null;
        }

        return {
            id: client.id,
            email: client.email,
            mobile: client.mobile,
            password: client.password,
            username: client.username,
            firstname: client.firstname,
            lastname: client.lastname,
            //@ts-ignore  Redis does not allow to cache with types
            chain: JSON.parse(client.chain)
        }
    }

    async cacheUsername(key: string, items: string) {
        const data = await this.client.set(key, items);
        console.log(`Client username Cached ${data}`);
        return;
    }

    async cacheEmail(key: string, items: string) {
        const data = await this.client.set(key, items);
        console.log(`Client email Cached ${data}`);
        return;
    }

    async getClientFromKey(key: string): Promise<Client | null> {
        const clientId = await this.client.get(key);
        console.log("clientId cache", clientId)
        if (!clientId) {
            return null;
        }
        const client = await this.getClientCache(clientId);
        console.log("client cache", client)
        
        if (!client) {
            return null;
        }

        return {
            id: client.id,
            email: client.email,
            mobile: client.mobile,
            password: client.password,
            username: client.username,
            firstname: client.firstname,
            lastname: client.lastname,
            //@ts-ignore  Redis does not allow to cache with types
            chain: JSON.parse(client.chain)
        }
    }

    async updateUserFields(key: string, updatedFields: Partial<Client>) {
        for (const [field, value] of Object.entries(updatedFields)) {
            await this.client.hSet(key, field, value.toString());
        }
        return;
    }

    async deleteHash(key: string) {
        const deletedKeys = await this.client.del(key);
        return deletedKeys;
    }

    // TODO: debounce here
    async send(message: string) {
        // await this.client.rPush(NOTIFICATIONS_QUEUE, message);
    }

    async publish(room: string, message: any) {
        await this.client.publish(room, JSON.stringify(message));
    }

    async disconnect() {
        await this.client.quit();
    }
}