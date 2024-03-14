import { RedisClientType } from "redis";
import { Redis } from "../Redis";
import { AccountParser, AccountType, AccountsParser, WALLET_CACHE_EXPIRE } from "@paybox/common";

export class AccountCache {
  private client: RedisClientType;
  private redis: Redis;

  constructor(client: RedisClientType, redis: Redis) {
    this.client = client;
    this.redis = redis;
  }

  async cacheAccount<T extends AccountType>(
    key: string,
    items: T,
    expire: number
  ): Promise<void> {
    const data = await this.client.hSet(key, {
      id: items.id,
      clientId: items.clientId,
      walletId: items.walletId,
      name: items.name,
      sol: JSON.stringify(items.sol),
      eth: JSON.stringify(items.eth),
      bitcoin: JSON.stringify(items.bitcoin || {}),
      usdc: JSON.stringify(items.usdc || {}),
      createdAt: items.createdAt,
      updatedAt: items.updatedAt,
    });

    await this.client.expire(key, expire);

    // Accounts inside wallets
    const getWallet = await this.client.hGetAll(items.walletId);
    await this.client.hSet(items.walletId, {
      id: items.walletId,
      clientId: items.clientId,
      accounts: JSON.stringify([
        ...(getWallet?.accounts ? JSON.parse(getWallet.accounts) : []),
        items,
      ]),
    });
    await this.client.expire(items.walletId, WALLET_CACHE_EXPIRE);

    // // acounts in accs
    // await this.client.set(`accs:${items.clientId}`, JSON.stringify([
    //   ...(getWallet?.accounts ? JSON.parse(getWallet.accounts) : []),
    //   items,
    // ]))
    // console.log([
    //   ...(getWallet?.accounts ? JSON.parse(getWallet.accounts) : []),
    //   items,
    // ]);

    console.log(`Account Cached ${data}`);
    return;
  }

  async getAccount<T>(key: string): Promise<T | null> {
    const account = await this.client.hGetAll(key);
    if (!account) {
      return null;
    }
    return {
      id: account.id,
      clientId: account.clientId,
      walletId: account.walletId,
      name: account.name,
      sol: JSON.parse(account.sol),
      eth: JSON.parse(account.eth),
      bitcoin: JSON.parse(account.bitcoin),
      usdc: JSON.parse(account.usdc),
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    } as T;
  }

  async cacheAccounts(key: string, items: AccountType[], expire: number): Promise<void> {
    const data = items.map((item) => {
      return {
        id: item.id,
        clientId: item.clientId,
        walletId: item.walletId,
        name: item.name,
        sol: JSON.stringify(item.sol),
        eth: JSON.stringify(item.eth),
        bitcoin: JSON.stringify(item.bitcoin || {}),
        usdc: JSON.stringify(item.usdc || {}),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    })
    const cache = await this.client.set(key, JSON.stringify(data), {
      EX: expire,
    });
    console.log(`Accounts Cached ${cache}`);

    return;
  }

  async getAccounts<T extends AccountType>(key: string): Promise<T | null> {
    const cache = await this.client.get(key);
    if (!cache) {
      return null;
    }
    //@ts-ignore
    const acc = JSON.parse(cache).map(account => {
      return {
        id: account.id,
        clientId: account.clientId,
        walletId: account.walletId,
        name: account.name,
        sol: JSON.parse(account.sol),
        eth: JSON.parse(account.eth),
        bitcoin: JSON.parse(account.bitcoin) || undefined,
        usdc: JSON.parse(account.usdc) || undefined,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      }
    });
    return acc as T;
  }

}
