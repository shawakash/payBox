import { RedisClientType, createClient } from "redis";
import { PROCESS, REDIS_URL } from "./config";
import { ClientCache } from "./redis/client";
import { AddressCache } from "./redis/address";
import { TxnCache } from "./redis/txn";
import { WalletCache } from "./redis/wallet";
import { AccountCache } from "./redis/account";
import { RedisBase } from "@paybox/backend-common";
import { NotifCache } from "./redis/notification";

export class Redis extends RedisBase {
  public clientCache: ClientCache;
  public address: AddressCache;
  public txn: TxnCache;
  public wallet: WalletCache;
  public account: AccountCache;
  public notif: NotifCache;
  private static redisInst: Redis;

  constructor() {

    super();
    this.clientCache = new ClientCache(this.client, this);
    this.address = new AddressCache(this.client, this);
    this.txn = new TxnCache(this.client, this);
    this.wallet = new WalletCache(this.client, this);
    this.account = new AccountCache(this.client, this);
    this.notif = new NotifCache(this.client, this);
    
  }

  public static getRedisInst(): Redis {
    if (!this.redisInst) {
      this.redisInst = new Redis();
    }
    return this.redisInst;
  }
}
