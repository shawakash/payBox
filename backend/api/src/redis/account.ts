import { RedisClientType } from "redis";
import { Redis } from "../Redis";
import { AccountParser, AccountType, AccountsParser } from "@paybox/common";

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

    // // acounts in accs
    // await this.client.set(`accs:${items.clientId}`, JSON.stringify([
    //   ...(getWallet?.accounts ? JSON.parse(getWallet.accounts) : []),
    //   items,
    // ]))
    console.log([
      ...(getWallet?.accounts ? JSON.parse(getWallet.accounts) : []),
      items,
    ]);

    console.log(`Account Cached ${data}`);
    return;
  }

  async getAccount<T>(key: string): Promise<T | null> {
    const account = await this.client.hGetAll(key);
    if (!account) {
      return null;
    }
    return AccountParser.parse(account) as T;
  }

  async cacheAccounts(key: string, items: AccountType[]): Promise<void> {
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
    const cache = await this.client.set(key, JSON.stringify(data));
    console.log(`Accounts Cached ${cache}`);

    return;
  }

  async getAccounts<T>(key: string){
    const cache = await this.client.get(key);
    if (!cache) {
      return null;
    }
    const acc = AccountsParser.parse(JSON.parse(cache));
    return acc as T;
  }

}
