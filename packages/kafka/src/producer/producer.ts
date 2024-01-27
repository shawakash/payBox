import { Network, TxnSolana } from "@paybox/common";
import { kafkaClient } from ".."
import { ConfirmedTransactionMeta } from "@solana/web3.js";

/**
 * 
 * @param transaction 
 * @param blockTime 
 * @param meta 
 * @param slot 
 * @param amount 
 * @param clientId 
 * @param network 
 * @returns boolean
 */
export const publishNewTxn = async (
    transaction: TxnSolana,
    blockTime: number,
    meta: ConfirmedTransactionMeta,
    slot: number,
    amount: number,
    clientId: string,
    network: Network
): Promise<boolean> => {
    try {

        //@ts-ignore
        const sender = transaction.message?.accountKeys[0].toBase58();
        //@ts-ignore
        const receiver = transaction.message?.accountKeys[1].toBase58();
        await kafkaClient.publishOne({
            topic: "txn",
            message: [{
                partition: 0,
                key: transaction.signatures[0] || "",
                value: JSON.stringify({
                    signature: transaction.signatures,
                    amount,
                    blockTime,
                    fee: meta.fee,
                    clientId,
                    from: sender, to: receiver,
                    postBalances: meta.postBalances,
                    preBalances: meta.preBalances,
                    recentBlockhash: transaction.message.recentBlockhash,
                    slot,
                    network
                })
            }]
        });
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}