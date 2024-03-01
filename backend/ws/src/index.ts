import { BTC_WS_URL, CLIENT_URL, WSPORT } from "@paybox/common";
import bodyParser from "body-parser";
import express from "express";
import http from "http";
import morgan from "morgan";
import url from "url";
import { WebSocketServer } from "ws";
import cors from "cors";
import { EthNetwok } from "./types";
import { BTC_ADDRESS, ETH_ADDRESS, INFURA_PROJECT_ID, SOLANA_ADDRESS } from "./config";
import { SolTxnLogs } from "./managers/sol";
import { EthTxnLogs } from "./managers/eth";
import { BtcTxn } from "./managers/btc";

export * from "./managers";

export const app = express();

const server = http.createServer(app);

export const wss = new WebSocketServer({ server });

// instances of the socket classes
export const solTxn = new SolTxnLogs("devnet", SOLANA_ADDRESS);
export const ethTxn = new EthTxnLogs(
    EthNetwok.sepolia,
    INFURA_PROJECT_ID,
    ETH_ADDRESS,
);
export const btcTxn = new BtcTxn(BTC_WS_URL, BTC_ADDRESS);

app.use(bodyParser.json());
app.use(
    morgan("ws :method :url :status :res[content-length] - :response-time ms"),
);

const corsOptions = {
    origin: CLIENT_URL, // specify the allowed origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // specify the allowed HTTP methods
    credentials: true, // enable credentials (cookies, authorization headers, etc.)
    optionsSuccessStatus: 204, // handle preflight requests (OPTIONS) with a 204 status code
    allowedHeaders: "Content-Type, Authorization", // specify allowed headers
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

wss.on("connection", async (ws) => {
    solTxn.connectWebSocket(ws);
    ethTxn.connectWebSocket(ws);
    btcTxn.connectWebSocket(ws);
    ws.on("message", (message) => {
        const data = message.toString();
        console.log(data);
    });
});


process.on("uncaughtException", function (err) {
    console.log("Caught exception: " + err);
});

server.listen(WSPORT, async () => {
    console.log(`Server listening on port: ${WSPORT}\n`);
});
