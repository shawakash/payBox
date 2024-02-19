import { RedisClientType, createClient } from "redis";
import { REDIS_URL } from "./config";
import {
  AccountType,
  Address,
  AddressPartial,
  Client,
  Network,
  TxnType,
  WalletType,
} from "@paybox/common";

export class Redis {
  private client: RedisClientType;
  private static instance: Redis;

  constructor() {
    this.client = createClient({
      url: REDIS_URL,
      legacyMode: false,
    });
    this.client.connect();
  }

  public static getInstance(): Redis {
    if (!this.instance) {
      this.instance = new Redis();
    }
    return this.instance;
  }

  async cacheClient(key: string, items: Client) {
    const serializedItem = JSON.stringify(items);
    const data = await this.client.hSet(key, {
      id: items.id,
      firstname: items.firstname || "",
      lastname: items.lastname || "",
      email: items.email,
      mobile: items.mobile || "",
      username: items.username,
      password: items.password,
      address: JSON.stringify(items.address),
    });

    console.log(`User Cached ${data}`);
    await this.cacheIdUsingKey(items.username, items.id);
    await this.cacheIdUsingKey(items.email, items.id);
    return;
  }

  async getClientCache(key: string): Promise<Client | null> {
    const client = await this.client.hGetAll(key);

    if (!client) {
      return null;
    }

    return {
      id: client.id,
      email: client.email,
      mobile: client.mobile,
      password: client.password,
      username: client.username,
      firstname: client.firstname,
      lastname: client.lastname,
      //@ts-ignore  Redis does not allow to cache with types
      address: JSON.parse(client.address),
    };
  }

  async getClientFromKey(key: string): Promise<Client | null> {
    const clientId = await this.client.get(key);
    if (!clientId) {
      return null;
    }
    const client = await this.getClientCache(clientId);

    if (!client) {
      return null;
    }

    return { ...client };
  }

  async updateUserFields(key: string, updatedFields: Partial<Client>) {
    for (const [field, value] of Object.entries(updatedFields)) {
      await this.client.hSet(key, field, value.toString());
    }
    return;
  }

  async deleteHash(key: string) {
    const deletedKeys = await this.client.del(key);
    return deletedKeys;
  }

  async cacheAddress(
    key: string,
    items: Partial<Address> & { id: string; clientId: string },
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
    const data = await this.client.hSet(key, {
      id: items.id,
      sol: items.sol as string,
      eth: items.eth as string,
      bitcoin: items.bitcoin as string,
      usdc: items.usdc as string,
      client_id: items.clientId,
    });
    console.log(`Address Cached ${data}`);
    return;
  }

  async getAddress(
    key: string,
  ): Promise<Partial<Address & { id: string; clientId: string }> | null> {
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
    };
  }

  async patchAddress(key: string, items: Partial<Address>) {
    for (const [field, value] of Object.entries(items)) {
      await this.client.hSet(key, field, value.toString());
    }
    return;
  }

  async updateClientAddress(
    key: string,
    items: Partial<Address> & { id: string },
  ) {
    const client = await this.client.hGetAll(key);
    if (!client) {
      return;
    }
    await this.client.hSet(key, {
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

    console.log(`Client address updated for client ID: ${key}`);

    return;
  }

  async getAddressFromKey(
    key: string,
  ): Promise<Partial<Address & { id: string; clientId: string }> | null> {
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

  async cacheIdUsingKey(key: string, item: string) {
    const data = await this.client.set(key, item);
    console.log(`${item} is cached with ${key}`);
    return;
  }

  async cacheTxns(key: string, items: TxnType | TxnType[]) {
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

      console.log(`Txn Cached ${data}`);
      await this.cacheIdUsingKey(item.signature[0], item.id);
    });

    await Promise.all(promises);

    return;
  }

  async cacheTxn(key: string, item: TxnType) {
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

    console.log(`Txn Cached ${data}`);
    await this.cacheIdUsingKey(item.signature[0], item.id);
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

  async cacheWallet(key: string, items: WalletType): Promise<void> {
    const data = await this.client.hSet(key, {
      id: items.id,
      clientId: items.clientId,
      secretPhase: items.secretPhase as string,
      accounts: JSON.stringify(items.accounts),
    });

    console.log(`Wallet Cached ${data}`);
    return;
  }

  async getWallet(key: string): Promise<WalletType | null> {
    const wallet = await this.client.hGetAll(key);
    if (!wallet) {
      return null;
    }
    return {
      id: wallet.id,
      clientId: wallet.clientId,
      secretPhase: wallet.secretPhase,
      accounts: JSON.parse(wallet.accounts),
    };
  }

  async cacheAccount(key: string, items: AccountType): Promise<void> {
    const data = await this.client.hSet(key, {
      id: items.id,
      clientId: items.clientId,
      walletId: items.walletId,
      name: items.name,
      sol: JSON.stringify(items.sol),
      eth: JSON.stringify(items.eth),
      bitcoin: JSON.stringify(items.bitcoin || {}),
      usdc: JSON.stringify(items.usdc || {}),
    });

    console.log(`Account Cached ${data}`);
    return;
  }

  async getAccount(key: string): Promise<AccountType | null> {
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
    };
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
