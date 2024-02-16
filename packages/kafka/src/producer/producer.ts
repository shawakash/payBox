import { EthCluster, Network, TxnSolana } from "@paybox/common";
import { kafkaClient } from "..";
import { ConfirmedTransactionMeta } from "@solana/web3.js";
import { TransactionReceipt, TransactionResponse } from "ethers";
import { calculateGas } from "../utils/utils";
import { Cluster } from "@solana/web3.js";
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
export const publishSolTxn = async (
  transaction: TxnSolana,
  blockTime: number,
  meta: ConfirmedTransactionMeta,
  slot: number,
  amount: number,
  clientId: string,
  network: Network,
  cluster: Cluster,
): Promise<boolean> => {
  try {
    //@ts-ignore
    const sender = transaction.message?.accountKeys[0].toBase58();
    //@ts-ignore
    const receiver = transaction.message?.accountKeys[1].toBase58();
    await kafkaClient.publishOne({
      topic: "txn3",
      message: [
        {
          partition: 0,
          key: transaction.signatures[0] || "",
          value: JSON.stringify({
            signature: transaction.signatures,
            amount,
            blockTime,
            fee: meta.fee,
            clientId,
            from: sender,
            to: receiver,
            postBalances: meta.postBalances,
            preBalances: meta.preBalances,
            recentBlockhash: transaction.message.recentBlockhash,
            slot,
            nonce: slot,
            network,
            cluster
          }),
        },
      ],
    });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const publishEthTxn = async (
  transaction: TransactionResponse,
  amount: number,
  clientId: string,
  network: Network,
  cluster: EthCluster,
): Promise<boolean> => {
  try {
    await kafkaClient.publishOne({
      topic: "txn3",
      message: [
        {
          partition: 1,
          key: transaction.hash,
          value: JSON.stringify({
            signature: [transaction.hash],
            amount,
            blockTime: Number(transaction.blockNumber),
            fee: calculateGas(transaction.gasLimit, transaction.gasPrice),
            clientId,
            from: transaction.from,
            to: transaction.to,
            recentBlockhash: transaction.blockHash,
            chainId: Number(transaction.chainId),
            nonce: Number(transaction.nonce),
            slot: Number(transaction.nonce),
            network,
            cluster,
          }),
        },
      ],
    });
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

/**
 * {
  provider: _InfuraProvider {
    projectId: '89fdb669cd9443a287a12b6e140ced99',
    projectSecret: null
  },
  to: '0x632DEc77CCab42C9B8879db98a07663bf54715f1',
  from: '0x632DEc77CCab42C9B8879db98a07663bf54715f1',
  contractAddress: null,
  hash: '0x50e0f22c6583541c3bfbdd63c421aaba7cb3b8379f955e2f1af93bc25fe41949',
  index: 103,
  blockHash: '0xfc14ce41f05e442f6e428f9cf4ee5a19daa75b90a94e371adfc3eab0a19eb841',
  blockNumber: 5218125,
  logsBloom: '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
  gasUsed: 21000n,
  cumulativeGasUsed: 8150833n,
  gasPrice: 5117412890n,
  type: 2,
  status: 1,
  root: undefined
} instance
 */
