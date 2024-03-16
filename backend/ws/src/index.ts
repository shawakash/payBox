import {BTC_WS_URL, CLIENT_URL, WsChatMessageType, WsMessageTypeEnum, WSPORT} from "@paybox/common";
import bodyParser from "body-parser";
import express from "express";
import http from "http";
import morgan from "morgan";
import {WebSocketServer} from "ws";
import cors from "cors";
import {EthNetwok} from "./types";
import {BTC_ADDRESS, ETH_ADDRESS, INFURA_PROJECT_ID, SOLANA_ADDRESS} from "./config";
import {SolTxnLogs} from "./managers/sol";
import {EthTxnLogs} from "./managers/eth";
import {BtcTxn} from "./managers/btc";
import {ChatSub} from "./Redis/ChatSub";

export * from "./managers";

export const app = express();

export const server = http.createServer(app);

export const wss = new WebSocketServer({server});

// instances of the socket classes
export const solTxn = new SolTxnLogs("devnet", SOLANA_ADDRESS);
export const ethTxn = new EthTxnLogs(
    EthNetwok.sepolia,
    INFURA_PROJECT_ID,
    ETH_ADDRESS,
);
export const btcTxn = new BtcTxn(BTC_WS_URL, BTC_ADDRESS);

const clients: {
    [key: string]: {
        friendshipId: string;
        ws: any;
    }
} = {};


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

wss.on("connection", async (ws, req) => {
    // TODO: add authentication
    //@ts-ignore
    const id = new URL(req.url as string, `http://${req.headers.host}`).searchParams.get('clientId') as string;
    // ws.on("message", async (message) => {
    //     const {accountId, clusters, type} = TxnLogMsgValid.parse(message.toString());
    //     if (type === WsMessageType.Index) {
    //         // cache account
    //         const cacheAccount = await cache.account.getAccount(accountId);
    //         if (!cacheAccount) {
    //            ws.send(JSON.stringify({type: wsResponseStatus.Error, message: "Account not found"}));
    //         }
    //         // TODO: subscribe to different chains
    //     }
    // });

    ws.on("message", async (message) => {

        const data: WsChatMessageType = JSON.parse(message.toString());

        if (data.type == WsMessageTypeEnum.Join) {
            clients[id] = {
                friendshipId: data.payload.friendshipId,
                ws
            }
            ChatSub.getInstance().subscribe(data.payload.friendshipId, id, ws);
        }

        if (data.type == WsMessageTypeEnum.Chat) {
            ChatSub.getInstance().sendMessage(data.payload.friendshipId, {
                ...data.payload,
                senderId: id
            });
        }

    });

    ws.on("close", () => {
        if (clients[id]) {
            ChatSub.getInstance().unsubscribe(id, clients[id].friendshipId);
        } else {
            console.error(`Error: ID ${id} is not connected to any channel.`);
        }
    });

});


process.on("uncaughtException", function (err) {
    console.log("Caught exception: " + err);
});


server.listen(WSPORT, async () => {
    console.log(`Server listening on port: ${WSPORT}\n`);
});