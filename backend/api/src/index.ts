import express, { Response as ExResponse, Request as ExRequest } from "express";
import bodyParser from "body-parser";
import http from "http";
import { WebSocketServer } from "ws";
import {
  BTC_ADDRESS,
  ETH_ADDRESS,
  INFURA_PROJECT_ID,
  SOLANA_ADDRESS,
} from "./config";
import SolTxnLogs from "./sockets/sol";
import EthTxnLogs from "./sockets/eth";
import { EthNetwok } from "./types/address";
import { BTC_WS_URL, CLIENT_URL, PORT } from "@paybox/common";
import morgan from "morgan";
import { Redis } from "./Redis";
import { clientRouter } from "./routes/client";
import cors from "cors";
import { addressRouter } from "./routes/address";
import { extractClientId } from "./auth/middleware";
import { qrcodeRouter } from "./routes/qrcode";
import { txnRouter } from "./routes/transaction";
import { expressMiddleware } from "@apollo/server/express4";
import { createApollo } from "./resolver/server";
import { BtcTxn } from "./sockets/btc";
import path from "path";
import { swaggerSpec, swaggerYaml } from "@paybox/openapi";
import swaggerUi, { JsonObject } from "swagger-ui-express";

export const app = express();
export const server = http.createServer(app);
export const wss = new WebSocketServer({ server });
// export const apolloServer = createApollo();

export const solTxn = new SolTxnLogs("devnet", SOLANA_ADDRESS);
export const ethTxn = new EthTxnLogs(
  EthNetwok.sepolia,
  INFURA_PROJECT_ID,
  ETH_ADDRESS,
);
export const btcTxn = new BtcTxn(BTC_WS_URL, BTC_ADDRESS);
export const cache = Redis.getInstance();

app.use(bodyParser.json());
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms"),
);

const corsOptions = {
  origin: CLIENT_URL, // specify the allowed origin
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // specify the allowed HTTP methods
  credentials: true, // enable credentials (cookies, authorization headers, etc.)
  optionsSuccessStatus: 204, // handle preflight requests (OPTIONS) with a 204 status code
  allowedHeaders: "Content-Type, Authorization", // specify allowed headers
};

app.use("/docs", swaggerUi.serve, async (_req: ExRequest, res: ExResponse) => {
  return res.send(swaggerUi.generateHTML(await import("./openapi.json")));
});
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerYaml));
// app.use('/api-docs', express.static(path.join(__dirname, 'node_modules/swagger-ui-dist')));
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

// (async () => {
//     await apolloServer.start();
// })().then(_ => {

//     app.use(
//         '/graphql',
//         cors<cors.CorsRequest>(),
//         express.json(),
//         expressMiddleware(apolloServer, {
//             context: async ({ req }) => ({ token: req.headers.token }),
//         }),
//     );
// });

app.use("/client", clientRouter);
app.use("/address", extractClientId, addressRouter);
app.use("/qrcode", qrcodeRouter);
app.use("/txn", extractClientId, txnRouter);

wss.on("connection", async (ws) => {
  solTxn.connectWebSocket(ws);
  ethTxn.connectWebSocket(ws);
  btcTxn.connectWebSocket(ws);
  ws.on("message", (message) => {
    const data = message.toString();
    console.log(data);
  });
});

server.listen(PORT, async () => {
  console.log(`Server listening on port: ${PORT}\n`);
});
