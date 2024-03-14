import { RedisClientType } from "redis";
import { Redis } from "../Redis";
import {
  ACCOUNT_CACHE_EXPIRE,
  AccountType,
  ChainAccountPrivate,
  Client,
  Network,
  NetworkPublicKeyType,
  VALID_CACHE_EXPIRE,
  WALLET_CACHE_EXPIRE,
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

  async cacheWallet(key: string, items: Partial<WalletType>, expire: number): Promise<void> {
    const data = await this.client.hSet(key, {
      id: items.id as string,
      clientId: items.clientId as string,
      accounts: JSON.stringify(items.accounts),
    });
    await this.client.expire(key, expire);
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

  async fromPhrase(key: string, items: ChainAccountPrivate[], expire: number): Promise<void> {
    await Promise.all(
      items.map(async ({ privateKey, publicKey }) => {
        await this.client.hSet(publicKey, {
          privateKey,
          publicKey,
        });
        await this.client.expire(publicKey, expire);
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

  async handleValid(wallet: WalletType, clientId: string, account: AccountType): Promise<void> {
    this.client.multi()
      .hSet(clientId, "valid", "true")
      .hSet(wallet.id, {
        id: wallet.id,
        clientId: wallet.clientId,
        accounts: JSON.stringify(wallet.accounts),
      })
      .expire(wallet.id, WALLET_CACHE_EXPIRE)
      .hSet(account.id, {
        id: account.id,
        clientId: account.clientId,
        sol: JSON.stringify(account.sol),
        eth: JSON.stringify(account.eth),
        bitcoin: JSON.stringify(account.bitcoin || {}),
        usdc: JSON.stringify(account.usdc || {}),
        walletId: account.walletId,
        name: account.name,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      })
      .expire(account.id, ACCOUNT_CACHE_EXPIRE)
      .set(`valid:${clientId}`, "true", {
        EX: VALID_CACHE_EXPIRE,
      });
  }
}
