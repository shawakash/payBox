import {
  Cluster,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  Signer,
  SystemProgram,
  Transaction,
  TransactionResponse,
  clusterApiUrl,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { WebSocket, WebSocketServer } from "ws";
import { TransactionData } from "../types/sol";
import { AcceptSolTxn, WalletKeys } from "@paybox/common";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import baseX from "base-x";
import * as base58 from 'bs58';

import * as bip39 from 'bip39';
import bip32 from 'bip32';
import { ec as EC } from 'elliptic';
import bs58 from 'bs58';

export const ec = new EC('secp256k1');
import { derivePath } from 'ed25519-hd-key';

export class SolTxnLogs {
  private rpcUrl: string;
  private connection: Connection;
  private publicKey: PublicKey;
  private keyPair: Signer;
  private logsListeners: TransactionData[];

  constructor(net: Cluster, address: string) {
    this.rpcUrl = clusterApiUrl(net);
    this.connection = new Connection(this.rpcUrl, "confirmed");
    this.publicKey = new PublicKey(address);
    this.keyPair = Keypair.fromSeed(this.publicKey.toBuffer());
    this.logsListeners = [];
  }

  async connectWebSocket(ws: WebSocket) {
    this.connection.onLogs(
      this.publicKey,
      async (logInfo, ctx) => {
        console.log(logInfo);
        console.log(ctx);
        const transaction: TransactionResponse | null =
          await this.connection.getTransaction(logInfo.signature);
        const transactionData: TransactionData = {
          type: "transaction",
          data: transaction,
        };
        console.log(transaction);
        this.logsListeners.push(transactionData);
        ws.send(JSON.stringify(transactionData));
      },
      "confirmed",
    );

    ws.on("message", (message) => {
      const data = message.toString();
      console.log(data);
    });

    ws.on("close", () => {
      this.disconnectWebSocket(ws);
    });
  }

  disconnectWebSocket(ws: WebSocket) {
    this.logsListeners.forEach((logsListener) => {
      this.connection.removeOnLogsListener(0);
    });
  }

  async checkAddress(address: string): Promise<boolean> {
    const isAccount = await this.connection.getAccountInfo(
      new PublicKey(address),
    );
    if (isAccount) {
      return true;
    }
    return false;
  }

  async acceptTxn({
    from,
    to,
    amount,
  }: AcceptSolTxn): Promise<TransactionResponse | null> {
    try {
      const senderPublicKey = Keypair.fromSeed(new PublicKey(from).toBuffer());
      const receiverSigner = Keypair.fromSeed(new PublicKey(to).toBuffer());
      /**
       * Do some airdrop for new keypair generated
       */
      // const airdropSignature = await this.connection.requestAirdrop(
      //     senderPublicKey.publicKey,
      //     LAMPORTS_PER_SOL
      // );
      const { blockhash } = await this.connection.getRecentBlockhash();

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: senderPublicKey.publicKey,
          toPubkey: receiverSigner.publicKey,
          lamports: amount * 10 ** 9, // Convert amount to lamports
        }),
      );

      transaction.recentBlockhash = blockhash;

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [senderPublicKey],
      );
      const status = await this.connection.getSignatureStatuses([signature]);
      if (status.value[0]?.confirmationStatus == "confirmed") {
        console.log(`Transaction confirmed with signature: ${signature}`);
        const txn = await this.connection.getTransaction(signature);
        return txn;
      }
      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

}

export class SolOps {

  constructor() {
  }

  async createWallet(secretPhrase: string): Promise<WalletKeys> {
    const seedBuffer = await bip39.mnemonicToSeed(secretPhrase);
    const seedKeyArray = Uint8Array.from(seedBuffer.subarray(0, 32));
    const keyPair = Keypair.fromSeed(seedKeyArray);
    return { publicKey: keyPair.publicKey.toBase58(), privateKey: base58.encode(keyPair.secretKey) };
  }

  async createAccount(secretPhrase: string): Promise<WalletKeys> {
    const accountIndex = Math.round(Date.now() / 1000);
    const path = `m/44'/501'/${accountIndex}'/0'`;
    const derivedSeed = derivePath(path, secretPhrase).key;
    const keyPair = Keypair.fromSeed(derivedSeed);
    return { publicKey: keyPair.publicKey.toBase58(), privateKey: base58.encode(keyPair.secretKey) };
  }

  async importAccount(mnemonic: string): Promise<WalletKeys> {
    const seedBuffer = await bip39.mnemonicToSeed(mnemonic);
    const seedKeyArray = Uint8Array.from(seedBuffer.subarray(0, 32));
    const keyPair = Keypair.fromSeed(seedKeyArray);
    return { publicKey: keyPair.publicKey.toBase58(), privateKey: base58.encode(keyPair.secretKey) };
  }

  async accountFromSecret(secretKey: string): Promise<WalletKeys> {
    const decodedBytes = bs58.decode(secretKey);
    console.log(decodedBytes)
    const privateKeyArray = new Uint8Array(decodedBytes);
    console.log(privateKeyArray)
    const keyPair = Keypair.fromSecretKey(decodedBytes);
    return { publicKey: keyPair.publicKey.toBase58(), privateKey: base58.encode(keyPair.secretKey) };
  }

  isValidSecretKey(secretKey: string): boolean {
    try {
      const key = Buffer.from(secretKey, 'hex');
      if (key.length !== 64) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }
}

export default SolTxnLogs;
