import { TxnQeuryByHash, TxnSendQuery, TxnType, TxnsQeury, responseStatus } from "@paybox/common";
import { Router } from "express";
import { getTxnByHash, getTxns, insertTxn } from "../db/transaction";
import { cache, solTxn } from "..";
import { txnCheckAddress } from "../auth/middleware";
import { dbResStatus } from "../types/client";
import { Network } from "ethers";

export const txnRouter = Router();

txnRouter.post("/send", txnCheckAddress, async (req, res) => {
    try {
        //@ts-ignore
        const id = req.id;
        if (id) {
            const { from, amount, to, network } = TxnSendQuery.parse(req.query);
            const instance = await solTxn.acceptTxn({ from, amount, to });
            if (!instance) {
                return res.status(400).json({ status: responseStatus.Error, msg: "Transaction failed" })
            }
            const { blockTime, meta, slot, transaction } = instance;
            if (!meta || !blockTime) {
                return res.status(400).json({ status: responseStatus.Error, msg: "Transaction failed" });
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
            if (insertTxnOne.status == dbResStatus.Error) {
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

/**
 * http://domain.dev/txn/get?network=mainnet&network=testnet&network=other&count=4
 */
txnRouter.get("/getMany", async (req, res) => {
    try {
        //@ts-ignore
        const id = req.id as string;
        if (id) {
            let { networks, count } = TxnsQeury.parse(req.query);
            //Db query
            const txns = await getTxns({ networks, count, clientId: id });
            if(txns.status == dbResStatus.Error) {
                return res.status(503).json({ status: responseStatus.Error, msg: "Database Error" });
            }

            //bug related to data type
            await cache.cacheTxns(txns.id as string, txns.txns as TxnType[]);
            return res.status(200).json({ txns: txns.txns as TxnType[], status: responseStatus.Ok })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: responseStatus.Error, msg: "Internal Server Error" });
    }
});

txnRouter.get("/get", async (req, res) => {
    try {
        //@ts-ignore
        const id = req.id as string;
        if (id) {
            let { network, sign } = TxnQeuryByHash.parse(req.query);
            /**
             * Cache
             */
            const isTxn = await cache.cacheGetTxnBySign(sign);
            if(isTxn) {
                return res.status(302).json({ ...isTxn, status: responseStatus.Ok });
            }

            //Db query
            const txn = await getTxnByHash({ network, sign, clientId: id });
            if(txn.status == dbResStatus.Error) {
                return res.status(503).json({ status: responseStatus.Error, msg: "Database Error" });
            }
            //bug related to data type
            await cache.cacheTxn(txn.id as string, txn.txn as TxnType);
            return res.status(200).json({ txn, status: responseStatus.Ok })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: responseStatus.Error, msg: "Internal Server Error" });
    }
});