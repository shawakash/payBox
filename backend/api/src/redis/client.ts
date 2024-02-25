import { RedisClientType } from "redis";
import { Redis } from "../Redis";
import { Address, Client } from "@paybox/common";

export class ClientCache {
    private client: RedisClientType;
    private redis: Redis;

    constructor(client: RedisClientType, redis: Redis) {
        this.client = client;
        this.redis = redis;
    }

    async cacheClient(key: string, items: Client) {
        const data = await this.client.hSet(key, {
            id: items.id,
            firstname: items.firstname || "",
            lastname: items.lastname || "",
            email: items.email,
            mobile: items.mobile || "",
            username: items.username,
            password: items.password,
            address: JSON.stringify(items.address),
        });

        console.log(`User Cached ${data}`);
        await this.redis.cacheIdUsingKey(items.username, items.id);
        await this.redis.cacheIdUsingKey(items.email, items.id);
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
            address: JSON.parse(client.address),
        };
    }

    async getClientFromKey(key: string): Promise<Client | null> {
        const clientId = await this.client.get(key);
        if (!clientId) {
            return null;
        }
        const client = await this.getClientCache(clientId);

        if (!client) {
            return null;
        }

        return { ...client };
    }

    async updateUserFields(key: string, updatedFields: Partial<Client>) {
        for (const [field, value] of Object.entries(updatedFields)) {
            await this.client.hSet(key, field, value.toString());
        }
        return;
    }


    async updateClientAddress(
        key: string,
        items: Partial<Address> & { id: string },
      ) {
        const client = await this.client.hGetAll(key);
        if (!client) {
          return;
        }
        await this.client.hSet(key, {
          id: client.id,
          firstname: client.firstname || "",
          lastname: client.lastname || "",
          email: client.email,
          mobile: client.mobile || "",
          username: client.username,
          password: client.password,
          address: JSON.stringify({
            id: items.id,
            sol: items.sol,
            eth: items.eth,
            bitcoin: items.bitcoin,
            usdc: items.usdc,
          }),
        });
    
        console.log(`Client address updated for client ID: ${key}`);
    
        return;
      }
}