import { Cluster, Connection, Keypair, PublicKey, Signer, SystemProgram, Transaction, TransactionResponse, clusterApiUrl, sendAndConfirmTransaction } from '@solana/web3.js';
import { WebSocket, WebSocketServer } from "ws";
import { TransactionData } from '../types/sol';
import { AcceptSolTxn } from '@paybox/common';

export class SolTxnLogs {
    private rpcUrl: string;
    private connection: Connection;
    private publicKey: PublicKey;
    private keyPair: Signer;
    private logsListeners: TransactionData[];

    constructor(net: Cluster, address: string) {
        this.rpcUrl = clusterApiUrl(net);
        this.connection = new Connection(this.rpcUrl, 'confirmed');
        this.publicKey = new PublicKey(address);
        this.keyPair = Keypair.fromSeed(this.publicKey.toBuffer())
        this.logsListeners = [];
    }

    async connectWebSocket(ws: WebSocket) {
        this.connection.onLogs(this.publicKey, async (logInfo, ctx) => {
            console.log(logInfo);
            console.log(ctx);
            const transaction: TransactionResponse | null = await this.connection.getTransaction(logInfo.signature);
            const transactionData: TransactionData = {
                type: 'transaction',
                data: transaction,
            };
            console.log(transaction);
            this.logsListeners.push(transactionData);
            ws.send(JSON.stringify(transactionData));
        }, 'confirmed');


        ws.on("message", (message) => {
            const data = message.toString();
            console.log(data);
        });

        ws.on('close', () => {
            this.disconnectWebSocket(ws);
        });
    }

    disconnectWebSocket(ws: WebSocket) {
        this.logsListeners.forEach((logsListener) => {
            this.connection.removeOnLogsListener(0);
        });
    }

    async checkAddress(): Promise<boolean> {
        const isAccount = await this.connection.getAccountInfo(this.publicKey);
        if (isAccount) {
            return true;
        }
        return false;
    }

    async acceptTxn({ senderKey, amount }: AcceptSolTxn) {
        const senderPublicKey = new PublicKey(senderKey);
        console.log(this.keyPair.publicKey, this.publicKey)
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: senderPublicKey,
                toPubkey: this.keyPair.publicKey,
                lamports: amount * 10 ** 9, // Convert amount to lamports
            })
        );

        // Sign and send the transaction
        const signature = await sendAndConfirmTransaction(this.connection, transaction, [this.keyPair]);

        console.log(`Transaction confirmed with signature: ${signature}`);
    }
}

export default SolTxnLogs;
