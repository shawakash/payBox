import { Chain } from "@paybox/zeus";
import { HASURA_URL, JWT } from "../config";
import { dbResStatus } from "../types/client";
import { HASURA_ADMIN_SERCRET, InsertTxnType, Network } from "@paybox/common";

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
    }, {operationName: "insertTxn"});
    if(response.insert_transactions_one?.id) {
        return {
            status: dbResStatus.Ok,
            ...response.insert_transactions_one
        }
    }
    return {
        status: dbResStatus.Error
    }
};