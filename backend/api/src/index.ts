import express from "express";
import bodyParser from "body-parser";
import http from "http";
import { WebSocket, WebSocketServer } from "ws";
import { ETH_ADDRESS, INFURA_PROJECT_ID, SOLANA_ADDRESS } from "./config";
import SolTxnLogs from "./sockets/sol";
import EthTxnLogs from "./sockets/eth";
import { EthNetwok } from "./types/chain";
import { PORT } from "@paybox/common";
import morgan from "morgan";
import { Redis } from "./Redis";
import { clientRouter } from "./routes/client";
import * as bitcore from 'bitcore-lib';
// import { Client } from 'bitcoin-core';

// Set up Bitcoin network

export const app = express();
export const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const solTxn = new SolTxnLogs("devnet", SOLANA_ADDRESS);
const ethTxn = new EthTxnLogs(EthNetwok.sepolia, INFURA_PROJECT_ID, ETH_ADDRESS);
const network = bitcore.Networks.testnet; // or bitcore.Networks.livenet for the mainnet
const clients: Set<WebSocket> = new Set();

const rpcConfig = {
    host: '127.0.0.1',
    port: 8332,
    username: 'your_rpc_username',
    password: 'your_rpc_password',
};

// const bitcoinClient = new Client(rpcConfig);


export const cache = Redis.getInstance();

app.use(bodyParser.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));


app.get("/", (_req, res) => {
    return res.status(200).json({
        uptime: process.uptime(),
        message: "OK",
        timestamp: Date.now(),
    });
});

app.get("/_health", (_req, res) => {
    return res.status(200).json({
        uptime: process.uptime(),
        message: "OK",
        timestamp: Date.now(),
    });
});

app.use("/client", clientRouter);


wss.on('connection', async (ws: WebSocket) => {
    solTxn.connectWebSocket(ws);
    ethTxn.connectWebSocket(ws);

    //     clients.add(ws);

    //   // Function to broadcast transaction data to all connected clients
    //   const broadcastTransaction = (transaction: bitcore.Transaction) => {
    //     const message = JSON.stringify({
    //       type: 'transaction',
    //       data: {
    //         txid: transaction.id,
    //         amount: transaction.outputs.reduce((sum, output) => sum + output.satoshis, 0),
    //       },
    //     });

    //     clients.forEach((client) => {
    //       if (client.readyState === WebSocket.OPEN) {
    //         client.send(message);
    //       }
    //     });
    //   };

    //   // Create a new transaction monitor for all transactions
    //   const transactionMonitor = new bitcore.TransactionMonitor();

    //   // Subscribe to transaction events
    //   transactionMonitor.on('tx', (transaction: bitcore.Transaction) => {
    //     console.log('New Transaction:', transaction.id);
    //     broadcastTransaction(transaction);
    //   });

    //   // Handle errors
    //   transactionMonitor.on('error', (error: Error) => {
    //     console.error('Transaction Monitor Error:', error.message);
    //   });

    // Subscribe to transaction notifications
    // bitcoinClient.subscribe('rawtx');

    // // Handle incoming transaction notifications
    // bitcoinClient.on('rawtx', (transactionHex: string) => {
    //     const transaction = bitcoinClient.decodeRawTransaction(transactionHex);
    //     ws.send(JSON.stringify(transaction));
    // });


    ws.on('message', (message) => {
        const data = message.toString();
        console.log(data);
    });

});

server.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
});