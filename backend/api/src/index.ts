import express from "express";
import bodyParser from "body-parser";
import http from "http";
import { WebSocketServer } from "ws";
import { ETH_ADDRESS, INFURA_PROJECT_ID, SOLANA_ADDRESS } from "./config";
import SolTxnLogs from "./sockets/sol";
import EthTxnLogs from "./sockets/eth";
import { EthNetwok } from "./types/address";
import { CORS_ORIGIN, PORT } from "@paybox/common";
import morgan from "morgan";
import { Redis } from "./Redis";
import { clientRouter } from "./routes/client";
import cors from "cors";
import { addressRouter } from "./routes/address";
import { extractClientId } from "./auth/middleware";
import { qrcodeRouter } from "./routes/qrcode";
import { txnRouter } from "./routes/transaction";

export const app = express();
export const server = http.createServer(app);
const wss = new WebSocketServer({ server });

export const solTxn = new SolTxnLogs("devnet", SOLANA_ADDRESS);
export const ethTxn = new EthTxnLogs(EthNetwok.sepolia, INFURA_PROJECT_ID, ETH_ADDRESS);
export const cache = Redis.getInstance();

app.use(bodyParser.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

const corsOptions = {
    origin: CORS_ORIGIN, // specify the allowed origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // specify the allowed HTTP methods
    credentials: true, // enable credentials (cookies, authorization headers, etc.)
    optionsSuccessStatus: 204, // handle preflight requests (OPTIONS) with a 204 status code
    allowedHeaders: 'Content-Type, Authorization', // specify allowed headers
};

app.use(cors(corsOptions));


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
app.use("/address", extractClientId, addressRouter);
app.use("/qrcode", qrcodeRouter);
app.use("/txn", extractClientId, txnRouter);


wss.on('connection', async (ws) => {
    solTxn.connectWebSocket(ws);
    ethTxn.connectWebSocket(ws);
    ws.on('message', (message) => {
        const data = message.toString();
        console.log(data);
    });

});

server.listen(PORT, async () => {
    console.log(`Server listening on port: ${PORT}\n`);
});