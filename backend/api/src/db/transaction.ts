import { Chain } from "@paybox/zeus";
import { HASURA_URL, JWT } from "../config";
import { dbResStatus } from "../types/client";
import { HASURA_ADMIN_SERCRET, InsertTxnType, TxnQuerySignType, TxnType, TxnsQeuryType } from "@paybox/common";

const chain = Chain(HASURA_URL, {
    headers: {
        Authorization: `Bearer ${JWT}`,
        'x-hasura-admin-secret': HASURA_ADMIN_SERCRET,
    },
});

/**
 * 
 * @param clientId 
 * @param blockTime 
 * @param amount 
 * @param fee 
 * @param from 
 * @param to 
 * @param postBalances 
 * @param preBalances 
 * @param recentBlockhash 
 * @param signature 
 * @param network 
 * @param slot 
 * @returns { status, id? }
 */
export const insertTxn = async ({
    clientId,
    blockTime,
    amount,
    fee,
    from,
    to,
    postBalances,
    preBalances,
    recentBlockhash,
    signature,
    network,
    slot
}: InsertTxnType): Promise<{
    status: dbResStatus,
    id?: unknown
}> => {
    const response = await chain("mutation")({
        insert_transactions_one: [{
            object: {
                client_id: clientId,
                signature,
                network,
                slot,
                amount,
                block_time: blockTime,
                fee,
                from,
                to,
                pre_balances: preBalances,
                post_balances: postBalances,
                recent_blockhash: recentBlockhash
            }
        }, {
            id: true
        }]
    }, { operationName: "insertTxn" });
    if (response.insert_transactions_one?.id) {
        return {
            status: dbResStatus.Ok,
            ...response.insert_transactions_one
        }
    }
    return {
        status: dbResStatus.Error
    }
};

/**
 * 
 * @param param0 
 * @returns 
 */
export const getTxns = async ({
    networks, count, clientId
}: TxnsQeuryType): Promise<{
    status: dbResStatus,
    txns?: unknown[],
}> => {
    const networkArray = Array.isArray(networks) ? networks : [networks]; // Ensure networks is an array
    const response = await chain("query")({
        transactions: [{
            where: {
                client_id: { _eq: clientId },
                _or: networkArray.map((network) => ({
                    network: { _eq: network },
                })),
            },
            limit: count
        }, {
            id: true,
            //@ts-ignore
            signature: true,
            amount: true,
            block_time: true,
            client_id: true,
            fee: true,
            date: true,
            from: true,
            network: true,
            //@ts-ignore
            post_balances: true,
            //@ts-ignore
            pre_balances: true,
            recent_blockhash: true,
            slot: true,
            to: true
        }]
    }, { operationName: "getTxns" });
    if (response.transactions[0]) {
        const txns = response.transactions.map(txn => {
            return {
                id: txn?.id,
                clientId: txn?.client_id,
                signature: txn?.signature,
                network: txn?.network,
                slot: txn?.slot,
                amount: txn?.amount,
                blockTime: txn?.block_time,
                fee: txn?.fee,
                from: txn?.from,
                to: txn?.to,
                preBalances: txn?.pre_balances,
                postBalances: txn?.post_balances,
                recentBlockhash: txn?.recent_blockhash,
            }
        });
        return {
            status: dbResStatus.Ok,
            txns,
        }
    }
    return {
        status: dbResStatus.Error
    }
}

/**
 * 
 * @param param0 
 * @returns 
 */
export const getTxnByHash = async ({
    network, sign, clientId
}: TxnQuerySignType): Promise<{
    status: dbResStatus,
    txn?: TxnType,
    id?: unknown
}> => {
    const response = await chain("query")({
        transactions: [{
            where: {
                signature: { _contains: sign },
                client_id: { _eq: clientId },
                network: { _eq: network },
            },
        }, {
            id: true,
            //@ts-ignore
            signature: true,
            amount: true,
            block_time: true,
            client_id: true,
            fee: true,
            date: true,
            from: true,
            network: true,
            //@ts-ignore
            post_balances: true,
            //@ts-ignore
            pre_balances: true,
            recent_blockhash: true,
            slot: true,
            to: true
        }]
    }, { operationName: "getTxnByHash" });
    if (response.transactions[0]) {
        const txn = {
            id: response.transactions[0].id,
            clientId: response.transactions[0].client_id,
            signature: response.transactions[0].signature,
            network: response.transactions[0].network,
            slot: response.transactions[0].slot,
            amount: response.transactions[0].amount,
            blockTime: response.transactions[0].block_time,
            fee: response.transactions[0].fee,
            from: response.transactions[0].from,
            to: response.transactions[0].to,
            preBalances: response.transactions[0].pre_balances,
            postBalances: response.transactions[0].post_balances,
            recentBlockhash: response.transactions[0].recent_blockhash,
        }
        return {
            status: dbResStatus.Ok,
            id: response.transactions[0].id,
            txn
        }
    }
    return {
        status: dbResStatus.Error
    }
};

/**
 * 
 * @param param0 
 * @returns 
 */
export const getAllTxn = async ({
    clientId
}: {clientId: string}): Promise<{
    status: dbResStatus,
    txns?: unknown[],
}> => {
    const response = await chain("query")({
        transactions: [{
            where: {
                client_id: { _eq: clientId },
            },
        }, {
            id: true,
            //@ts-ignore
            signature: true,
            amount: true,
            block_time: true,
            client_id: true,
            fee: true,
            date: true,
            from: true,
            network: true,
            //@ts-ignore
            post_balances: true,
            //@ts-ignore
            pre_balances: true,
            recent_blockhash: true,
            slot: true,
            to: true
        }]
    }, { operationName: "getTxns" });
    if (response.transactions[0]) {
        const txns = response.transactions.map(txn => {
            return {
                id: txn?.id,
                clientId: txn?.client_id,
                signature: txn?.signature,
                network: txn?.network,
                slot: txn?.slot,
                amount: txn?.amount,
                blockTime: txn?.block_time,
                fee: txn?.fee,
                from: txn?.from,
                to: txn?.to,
                preBalances: txn?.pre_balances,
                postBalances: txn?.post_balances,
                recentBlockhash: txn?.recent_blockhash,
            }
        });
        return {
            status: dbResStatus.Ok,
            txns,
        }
    }
    return {
        status: dbResStatus.Error
    }
}