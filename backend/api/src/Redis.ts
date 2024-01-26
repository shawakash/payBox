import { RedisClientType, createClient } from "redis";
import { REDIS_URL } from "./config";
import { Address, AddressPartial, Client, Network, TxnType } from "@paybox/common";

export class Redis {
    private client: RedisClientType;
    private static instance: Redis;

    constructor() {
        this.client = createClient({
            url: REDIS_URL,
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
        const data = await this.client.hSet(key,
            {
                id: items.id,
                firstname: items.firstname || "",
                lastname: items.lastname || "",
                email: items.email,
                mobile: items.mobile || "",
                username: items.username,
                password: items.password,
                address: JSON.stringify(items.address)
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
            address: JSON.parse(client.address)
        }
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

        return { ...client }
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

    async cacheAddress(key: string, items: Address & { id: string, clientId: string }) {
        const data = await this.client.hSet(key,
            {
                id: items.id,
                sol: items.sol,
                eth: items.eth,
                bitcoin: items.bitcoin,
                usdc: items.usdc,
                client_id: items.clientId
            });
        console.log(`Address Cached ${data}`);
        return;
    }


    async getAddress(key: string): Promise<Partial<Address & { id: string, clientId: string }> | null> {
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
            usdc: address.usdc
        }
    }

    async patchAddress(key: string, items: Partial<Address>) {
        for (const [field, value] of Object.entries(items)) {
            await this.client.hSet(key, field, value.toString());
        }
        return;
    }

    async updateClientAddress(key: string, items: Partial<Address>) {
        const client = await this.client.hGetAll(key);
        console.log(client)
        if (!client) {
            throw new Error(`Client not found for ID: ${key}`);
        }

        client.address = {
            //@ts-ignore
            ...client.address,
            ...items,
        };
        console.log(client)
        //@ts-ignore
        await this.cacheClient(key, client);

        console.log(`Client address updated for client ID: ${key}`);

        return;
    }

    async getAddressFromKey(key: string): Promise<Partial<Address & { id: string, clientId: string }> | null> {
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
        console.log(dataArray)
        const promises = dataArray.map(async (item) => {
            const data = await this.client.hSet(key, {
                id: item.id,
                clientId: item.clientId,
                signature: JSON.stringify(item.signature),
                network: item.network,
                slot: item.slot,
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
            slot: item.slot,
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
            signature: [...JSON.stringify(txn.signature)],
            network: txn.network as Network,
            slot: Number(txn.slot),
            amount: Number(txn.amount),
            blockTime: Number(txn.blockTime),
            fee: Number(txn.fee),
            from: txn.from,
            to: txn.to,
            preBalances: [...JSON.stringify(txn.preBalances)].map(pre => Number(pre)),
            postBalances: [...JSON.stringify(txn.postBalances)].map(pre => Number(pre)),
            recentBlockhash: txn.recentBlockhash,
        }
    }

    async cacheGetTxnBySign(key: string): Promise<TxnType | null> {
        const txnId = await this.client.get(key);
        if (!txnId) {
            return null;
        }
        const txn = await this.cacheGetTxn(txnId);

        if (!txn) {
            return null;
        }

        return { ...txn }
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