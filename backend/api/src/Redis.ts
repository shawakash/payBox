import { RedisClientType, createClient } from "redis";
import { PROCESS, REDIS_URL } from "./config";
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
      socket: {
        reconnectStrategy(retries, cause) {
          if (retries > 20) {
            console.log("Too many retries on REDIS. Connection Terminated");
            return false;
          } else {
            console.log(`Retrying to connect to Redis ${PROCESS} server: ${cause}`);
            return Math.min(retries * 100, 3000);
          }
        },
      },

    });

    this.client.on('connect', () => {
      console.log(`Redis ${PROCESS} server connect at port: ${REDIS_URL?.split(":").slice(-1)[0]}`);
    });

    this.client.on('error', (err) => {
      console.error(`Error connecting to Redis ${PROCESS} server:`, err);
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
    console.log(`Deleted hash with ${key} key`);
    return deletedKeys;
  }

  async cacheIdUsingKey(key: string, item: string, expire: number): Promise<void> {
    await this.client.set(key, item, {
      EX: expire,
    });
    console.log(`${item} is cached with ${key}`);
    return;
  }

  async getIdFromKey(key: string): Promise<string | null> {
    const id = await this.client.get(key);
    if (!id) {
      return null;
    }
    console.log(`Got id from key ${key}`);
    return id;
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
