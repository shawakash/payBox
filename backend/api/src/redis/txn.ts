import { Network, TxnType } from "@paybox/common";
import { RedisClientType } from "redis";
import { Redis } from "../Redis";

export class TxnCache {
  private client: RedisClientType;
  private redis: Redis;

  constructor(client: RedisClientType, redis: Redis) {
    this.client = client;
    this.redis = redis;
  }

  async cacheTxns(key: string, items: TxnType | TxnType[], expire: number) {
    const dataArray = Array.isArray(items) ? items : [items]; // Ensure items is an array
    console.log(dataArray);
    const promises = dataArray.map(async (item) => {
      const data = await this.client.hSet(key, {
        id: item.id,
        clientId: item.clientId,
        signature: JSON.stringify(item.signature),
        network: item.network,
        slot: item.slot as number,
        amount: item.amount,
        blockTime: item.blockTime,
        fee: item.fee,
        from: item.from,
        to: item.to,
        preBalances: JSON.stringify(item.preBalances),
        postBalances: JSON.stringify(item.postBalances),
        recentBlockhash: item.recentBlockhash,
      });
      await this.client.expire(key, expire);
      console.log(`Txn Cached ${data}`);
      await this.redis.cacheIdUsingKey(item.signature[0], item.id);
    });

    await Promise.all(promises);

    return;
  }

  async cacheTxn(key: string, item: TxnType, expire: number) {
    const data = await this.client.hSet(key, {
      id: item.id,
      clientId: item.clientId,
      signature: JSON.stringify(item.signature),
      network: item.network,
      slot: item.slot as number,
      amount: item.amount,
      blockTime: item.blockTime,
      fee: item.fee,
      from: item.from,
      to: item.to,
      preBalances: JSON.stringify(item.preBalances),
      postBalances: JSON.stringify(item.postBalances),
      recentBlockhash: item.recentBlockhash,
    });
    await this.client.expire(key, expire);
    
    console.log(`Txn Cached ${data}`);
    await this.redis.cacheIdUsingKey(item.signature[0], item.id);
    return;
  }

  async cacheGetTxn(key: string): Promise<TxnType | null> {
    const txn = await this.client.hGetAll(key);
    if (!txn) {
      return null;
    }
    return {
      id: txn.id,
      clientId: txn.clientId,
      signature: JSON.parse(txn.signature),
      network: txn.network as Network,
      slot: Number(txn.slot),
      amount: Number(txn.amount),
      blockTime: Number(txn.blockTime),
      fee: Number(txn.fee),
      from: txn.from,
      to: txn.to,
      preBalances: JSON.parse(txn.preBalances),
      postBalances: JSON.parse(txn.postBalances),
      recentBlockhash: txn.recentBlockhash,
    };
  }

  async cacheGetTxnBySign(key: string): Promise<TxnType | null> {
    const txnId = await this.client.get(key);
    if (txnId == null) {
      return null;
    }
    const txn = await this.cacheGetTxn(txnId);

    if (txn == null) {
      return null;
    }

    return { ...txn };
  }
}
