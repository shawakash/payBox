import { RedisClientType } from "redis";
import { Redis } from "../Redis";
import {
  ChainAccountPrivate,
  Network,
  NetworkPublicKeyType,
  WalletKeys,
  WalletType,
} from "@paybox/common";

export class WalletCache {
  private client: RedisClientType;
  private redis: Redis;

  constructor(client: RedisClientType, redis: Redis) {
    this.client = client;
    this.redis = redis;
  }

  async cacheWallet(key: string, items: Partial<WalletType>): Promise<void> {
    const data = await this.client.hSet(key, {
      id: items.id as string,
      clientId: items.clientId as string,
      accounts: JSON.stringify(items.accounts),
    });

    console.log(`Wallet Cached ${data}`);
    return;
  }

  async getWallet(key: string): Promise<Partial<WalletType> | null> {
    const wallet = await this.client.hGetAll(key);
    if (!wallet) {
      return null;
    }
    return {
      id: wallet.id,
      clientId: wallet.clientId,
      accounts: JSON.parse(wallet.accounts),
    };
  }

  async fromPhrase(key: string, items: ChainAccountPrivate[]): Promise<void> {
    await Promise.all(
      items.map(async ({ privateKey, publicKey }) => {
        await this.client.hSet(publicKey, {
          privateKey,
          publicKey,
        });
      }),
    );
    console.log(`From Phrase Cached ${key}`);
    return;
  }

  async getFromPhrase(
    key: NetworkPublicKeyType[],
  ): Promise<(WalletKeys & { network: Network })[] | null> {
    const keys: (WalletKeys & { network: Network })[] = [];
    await Promise.all(
      key.map(async ({ network, publicKey }) => {
        const data = await this.client.hGetAll(publicKey);
        if (!data) {
          return null;
        }
        keys.push({
          publicKey: data.publicKey,
          privateKey: data.privateKey,
          network,
        });
      }),
    );
    return keys;
  }
}
