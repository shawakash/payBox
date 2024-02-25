import { RedisClientType, createClient } from "redis";
import { REDIS_URL } from "./config";
import { ClientCache } from "./redis/client";
import { AddressCache } from "./redis/address";
import { TxnCache } from "./redis/txn";
import { WalletCache } from "./redis/wallet";
import { AccountCache } from "./redis/account";

export class Redis {
  private client: RedisClientType;
  private static instance: Redis;
  public clientCache: ClientCache;
  public address: AddressCache;
  public txn: TxnCache;
  public wallet: WalletCache;
  public account: AccountCache;

  constructor() {
    this.client = createClient({
      url: REDIS_URL,
      legacyMode: false,
    });
    this.client.connect();
    this.clientCache = new ClientCache(this.client, this);
    this.address = new AddressCache(this.client, this);
    this.txn = new TxnCache(this.client, this);
    this.wallet = new WalletCache(this.client, this);
    this.account = new AccountCache(this.client, this);
  }

  public static getInstance(): Redis {
    if (!this.instance) {
      this.instance = new Redis();
    }
    return this.instance;
  }

  async deleteHash(key: string) {
    const deletedKeys = await this.client.del(key);
    console.log(`Deleted hash with ${key} key`)
    return deletedKeys;
  }

  async cacheIdUsingKey(key: string, item: string) {
    await this.client.set(key, item);
    console.log(`${item} is cached with ${key}`);
    return;
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
