import express from "express";
import { PORT, SolanaRpcUrl } from "@paybox/common";
import bodyParser from "body-parser";
import http from "http";
import { WebSocketServer } from "ws";
import { Connection, PublicKey, Transaction, clusterApiUrl } from '@solana/web3.js';
import { SOLANA_ADDRESS } from "./config";
import SolTxnLogs from "./sockets/connection";

const app = express();
export const server = http.createServer(app);
const wss = new WebSocketServer({ server });


const connection = new Connection(SolanaRpcUrl, 'confirmed');
const publicKey = new PublicKey(SOLANA_ADDRESS);
const solTxn = new SolTxnLogs("devnet", SOLANA_ADDRESS);

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
    solTxn.connectWebSocket(ws);
});

server.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
});