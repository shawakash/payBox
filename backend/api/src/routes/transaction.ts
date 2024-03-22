import {
  EthCluster,
  Network,
  SolCluster,
  TRANSACTION_CACHE_EXPIRE,
  TxnQeuryByHash,
  TxnSendQuery,
  TxnType,
  TxnsQeury,
  responseStatus,
} from "@paybox/common";
import { Router } from "express";
import { getAllTxn, getTxnByHash, getTxns, insertTxn } from "@paybox/backend-common";
import { Redis } from "..";
import { txnCheckAddress } from "../auth/middleware";
import { dbResStatus } from "../types/client";
import { publishEthTxn, publishSolTxn } from "@paybox/kafka";
import { Cluster } from "@solana/web3.js";
import { EthOps } from "../sockets/eth";
import { INFURA_PROJECT_ID } from "../config";
import { SolOps } from "../sockets/sol";

export const txnRouter = Router();

txnRouter.post("/send", txnCheckAddress, async (req, res) => {
  try {
    //@ts-ignore
    const id = req.id;
    if (id) {
      const { from, amount, to, network, cluster } = TxnSendQuery.parse(
        req.query,
      );
      if (network == Network.Eth) {
        const transaction = await (new EthOps(cluster as EthCluster, INFURA_PROJECT_ID)).acceptTxn({ amount, to, from });
        if (!transaction) {
          return res
            .status(400)
            .json({ status: responseStatus.Error, msg: "Transaction failed" });
        }

        /**
         * Publishing the txn payload for que based system
         */
        await publishEthTxn(
          transaction,
          amount,
          id,
          network,
          cluster as EthCluster,
        );
        return res
          .status(200)
          .json({ status: responseStatus.Ok, signature: transaction });
      }
      let instance;
      if (network == Network.Sol) {
        instance = await (new SolOps(cluster as Cluster)).acceptTxn({ from, amount, to });
        if (!instance) {
          return res
            .status(400)
            .json({ status: responseStatus.Error, msg: "Transaction failed" });
        }
        const { blockTime, meta, slot, transaction } = instance;
        if (!meta || !blockTime) {
          return res
            .status(400)
            .json({ status: responseStatus.Error, msg: "Transaction failed" });
        }
        /**
         * Publishing the txn payload for que based system
         */
        await publishSolTxn(
          transaction,
          blockTime,
          meta,
          slot,
          amount,
          id,
          network,
          cluster as Cluster,
        );
        return res
          .status(200)
          .json({ status: responseStatus.Ok, signature: instance });
      }
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: responseStatus.Error, msg: "Internal Server Error" });
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
      if (txns.status == dbResStatus.Error) {
        return res
          .status(503)
          .json({ status: responseStatus.Error, msg: "Database Error" });
      }
      await Redis.getRedisInst().txn.cacheTxns(
        `${id}_txns_${count}_${Date.now()}`,
        txns.txns as TxnType[],
        TRANSACTION_CACHE_EXPIRE
      );
      return res
        .status(200)
        .json({ txns: txns.txns as TxnType[], status: responseStatus.Ok });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: responseStatus.Error, msg: "Internal Server Error" });
  }
});

txnRouter.get("/get", async (req, res) => {
  try {
    //@ts-ignore
    const id = req.id as string;
    if (id) {
      let { network, hash } = TxnQeuryByHash.parse(req.query);
      /**
       * Cache
       */
      const isTxn = await Redis.getRedisInst().txn.cacheGetTxnBySign(hash);
      if (isTxn) {
        return res.status(302).json({ txn: isTxn, status: responseStatus.Ok });
      }
      //Db query
      const txn = await getTxnByHash({ network, hash, clientId: id });
      if (txn.status == dbResStatus.Error) {
        return res
          .status(503)
          .json({ status: responseStatus.Error, msg: "Database Error" });
      }
      await Redis.getRedisInst().txn.cacheTxn(txn.id as string, txn.txn as TxnType, TRANSACTION_CACHE_EXPIRE);
      return res.status(200).json({ txn, status: responseStatus.Ok });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: responseStatus.Error, msg: "Internal Server Error" });
  }
});

txnRouter.get("/getAll", async (req, res) => {
  try {
    //@ts-ignore
    const id = req.id as string;
    if (id) {
      const txn = await getAllTxn({ clientId: id });
      if (txn.status == dbResStatus.Error) {
        return res
          .status(503)
          .json({ status: responseStatus.Error, msg: "Database Error" });
      }
      // await Redis.getRedisInst().cacheTxns(`${id}_txns`, txn.txns as TxnType[]);
      return res
        .status(200)
        .json({ txns: txn.txns, status: responseStatus.Ok });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: responseStatus.Error, msg: "Internal Server Error" });
  }
});
