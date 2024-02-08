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
import { AcceptSolTxn } from "@paybox/common";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import baseX from "base-x";

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

export default SolTxnLogs;
