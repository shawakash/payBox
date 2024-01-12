import express from "express";
import { PORT, SolanaRpcUrl } from "@paybox/common";
import bodyParser from "body-parser";
import http from "http";
import { WebSocketServer } from "ws";
import { Connection, PublicKey, Transaction, clusterApiUrl } from '@solana/web3.js';
import { SOLANA_ADDRESS } from "./config";

const app = express();
export const server = http.createServer(app);
const wss = new WebSocketServer({ server });


const connection = new Connection(SolanaRpcUrl, 'confirmed');
const publicKey = new PublicKey(SOLANA_ADDRESS);

app.use(bodyParser.json());

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


wss.on('connection', async (ws) => {
    connection.onLogs(publicKey, async (logInfo, ctx) => {
        console.log(logInfo);
        console.log(ctx);
        const transaction = await connection.getTransaction(logInfo.signature);
        const transactionData = {
          type: 'transaction',
          data: transaction,
        };
        console.log(transaction);
        ws.send(JSON.stringify(transaction));
    }, 'confirmed');
    ws.on("message", (message: string) => {

        const data = message.toString();
        console.log(data);
    });
    ws.on('close', () => {
        connection.removeOnLogsListener(0);
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
});