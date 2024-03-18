import { RedisClientType, createClient } from "redis";
import { PROCESS, REDIS_URL } from "../config";

export class RedisBase {
  public client: RedisClientType;
  private static instance: RedisBase;

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
  }

  public static getInstance(): RedisBase {
    if (!this.instance) {
      this.instance = new RedisBase();
    }
    return this.instance;
  }

  get getclient() {
    return this.client;
  }

  async deleteHash(key: string) {
    const deletedKeys = await this.client.del(key);
    console.log(`Deleted hash with ${key} key`);
    return deletedKeys;
  }

  async cacheIdUsingKey(key: string, item: string, expire?: number): Promise<void> {
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
