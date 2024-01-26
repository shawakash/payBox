import { Chain } from "@paybox/zeus";
import { HASURA_URL, JWT } from "@paybox/common";
import { dbResStatus } from "@paybox/common";
import { HASURA_ADMIN_SERCRET, InsertTxnType, TxnQuerySignType, TxnsQeuryType } from "@paybox/common";

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
    id?: unknown
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
            limit: count,
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
        return {
            status: dbResStatus.Ok,
            txns: response.transactions,
            id: response.transactions[0].id
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
    txn?: unknown,
    id?: unknown
}> => {
    const response = await chain("query")({
        transactions: [{
            where: {
                signature: {_contains: sign},
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
        return {
            status: dbResStatus.Ok,
            id: response.transactions[0].id,
            txn: response.transactions[0]
        }
    }
    return {
        status: dbResStatus.Error
    }
};