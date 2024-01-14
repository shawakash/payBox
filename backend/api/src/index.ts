import express from "express";
import bodyParser from "body-parser";
import http from "http";
import { WebSocketServer } from "ws";
import { ETH_ADDRESS, INFURA_PROJECT_ID, SOLANA_ADDRESS } from "./config";
import SolTxnLogs from "./sockets/sol";
import EthTxnLogs from "./sockets/eth";
import { EthNetwok } from "./types/chain";
import { PORT } from "@paybox/common";

export const app = express();
export const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const solTxn = new SolTxnLogs("devnet", SOLANA_ADDRESS);
const ethTxn = new EthTxnLogs(EthNetwok.sepolia, INFURA_PROJECT_ID, ETH_ADDRESS);

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
    ethTxn.connectWebSocket(ws);
    ws.on('message', (message) => {
        const data = message.toString();
        console.log(data);
    });

});

server.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
});