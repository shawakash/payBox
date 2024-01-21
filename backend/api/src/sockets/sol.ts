import { Cluster, Connection, PublicKey, Transaction, TransactionResponse, clusterApiUrl } from '@solana/web3.js';
import { WebSocket, WebSocketServer } from "ws";
import { TransactionData } from '../types/sol';

export class SolTxnLogs {
    private rpcUrl: string;
    private connection: Connection;
    private publicKey: PublicKey;
    private logsListeners: TransactionData[];

    constructor(net: Cluster, address: string) {
        this.rpcUrl = clusterApiUrl(net);
        this.connection = new Connection(this.rpcUrl, 'confirmed');
        this.publicKey = new PublicKey(address);
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
        if(isAccount) {
            console.log(isAccount);
            return true;
        }
        return false;
    }
}

export default SolTxnLogs;
