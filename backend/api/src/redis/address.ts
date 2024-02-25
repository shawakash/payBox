import { RedisClientType } from "redis";
import { Address, Client } from "@paybox/common";
import { Redis } from "../Redis";

export class AddressCache {
    private client: RedisClientType;
    private redis: Redis;

    constructor(client: RedisClientType, redis: Redis) {
        this.client = client;
        this.redis = redis;
    }

    async cacheAddress(
        key: string,
        items: Partial<Address> & { id: string; clientId: string },
      ) {
        const client = await this.client.hGetAll(items.clientId);
        if (!client) {
          return;
        }
        await this.client.hSet(items.clientId, {
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
        const data = await this.client.hSet(key, {
          id: items.id,
          sol: items.sol as string,
          eth: items.eth as string,
          bitcoin: items.bitcoin as string,
          usdc: items.usdc as string,
          client_id: items.clientId,
        });
        console.log(`Address Cached ${data}`);
        return;
      }
    
      async getAddress(
        key: string,
      ): Promise<Partial<Address & { id: string; clientId: string }> | null> {
        const address = await this.client.hGetAll(key);
    
        if (!address) {
          return null;
        }
    
        return {
          id: address.id,
          clientId: address.client_id,
          eth: address.eth,
          sol: address.sol,
          bitcoin: address.bitcoin,
          usdc: address.usdc,
        };
      }
    
      async patchAddress(key: string, items: Partial<Address>) {
        for (const [field, value] of Object.entries(items)) {
          await this.client.hSet(key, field, value.toString());
        }
        return;
      }
    
      async getAddressFromKey(
        key: string,
      ): Promise<Partial<Address & { id: string; clientId: string }> | null> {
        const addressId = await this.client.get(key);
        if (!addressId) {
          return null;
        }
        const address = await this.getAddress(addressId);
    
        if (!address) {
          return null;
        }
    
        return { ...address };
      }
}