import { TxnSendQuery, responseStatus } from "@paybox/common";
import { Router } from "express";
import { insertTxn } from "../db/transaction";
import { cache, solTxn } from "..";
import { txnCheckAddress } from "../auth/middleware";
import { dbResStatus } from "../types/client";

export const txnRouter = Router();

txnRouter.post("/send", txnCheckAddress, async (req, res) => {
    try {
        //@ts-ignore
        const id = req.id;
        if(id) {
            const { from, amount, to, network } = TxnSendQuery.parse(req.query);
            const instance = await solTxn.acceptTxn({ from, amount, to });
            if (!instance) {
                return res.status(400).json({ status: responseStatus.Error, msg: "Transaction failed" })
            }
            const { blockTime, meta, slot, transaction } = instance;
            if (!meta || !blockTime) {
                return
            }
            const sender = transaction.message.accountKeys[0].toBase58();
            const receiver = transaction.message.accountKeys[1].toBase58();
            /**
             * Do a db call
             * Add a queue based system to improve mutations
             */
            const insertTxnOne = await insertTxn({ 
                signature: transaction.signatures, 
                amount, 
                blockTime, 
                fee: meta.fee, 
                clientId: id, 
                from: sender, to: receiver, 
                postBalances: meta.postBalances,
                preBalances: meta.preBalances,
                recentBlockhash: transaction.message.recentBlockhash,
                slot,
                network
            });
            if(insertTxnOne.status == dbResStatus.Error) {
                return res.status(503).json({ status: responseStatus.Error, msg: "Database Error" });
            }
            
            /**
             * Cache it
             */
            await cache.cacheTxn(insertTxnOne?.id as string, {
                signature: transaction.signatures, 
                amount, 
                blockTime, 
                fee: meta.fee, 
                clientId: id, 
                from: sender, to: receiver, 
                postBalances: meta.postBalances,
                preBalances: meta.preBalances,
                recentBlockhash: transaction.message.recentBlockhash,
                slot,
                network,
                id: insertTxnOne.id as string
            });
            return res.status(200).json({ status: responseStatus.Ok, signature: instance, id: insertTxnOne.id })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: responseStatus.Error, msg: "Internal Server Error" });
    }
});