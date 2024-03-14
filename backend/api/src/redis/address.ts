import { RedisClientType } from "redis";
import { Address, CLIENT_CACHE_EXPIRE, Client } from "@paybox/common";
import { Redis } from "../Redis";

export class AddressCache {
  private client: RedisClientType;
  private redis: Redis;

  constructor(client: RedisClientType, redis: Redis) {
    this.client = client;
    this.redis = redis;
  }

  async cacheAddress<T extends Address>(
    key: string,
    items: Partial<T> & { id: string; clientId: string },
    expire: number
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
    await this.client.expire(items.clientId, CLIENT_CACHE_EXPIRE);
    const data = await this.client.hSet(key, {
      id: items.id,
      sol: items.sol as string,
      eth: items.eth as string,
      bitcoin: items.bitcoin as string,
      usdc: items.usdc as string,
      client_id: items.clientId,
    });
    await this.client.expire(key, expire);
    console.log(`Address Cached ${data}`);
    return;
  }

  async getAddress<T>(key: string): Promise<Partial<T> | null> {
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
    } as T;
  }

  async patchAddress<T>(key: string, items: Partial<T>, expire: number): Promise<void> {
    for (const [field, value] of Object.entries(items)) {
      //@ts-ignore
      await this.client.hSet(key, field, value.toString());
    }
    await this.client.expire(key, expire);
    return;
  }

  async getAddressFromKey<T>(key: string): Promise<Partial<T> | null> {
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
