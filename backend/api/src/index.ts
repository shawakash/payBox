import express, { Response as ExResponse, Request as ExRequest } from "express";
import bodyParser from "body-parser";
import http from "http";
import { WebSocketServer } from "ws";
import {
  BTC_ADDRESS,
  ETH_ADDRESS,
  GMAIL,
  GMAIL_APP_PASS,
  INFURA_PROJECT_ID,
  MAIL_SERVICE,
  R2_ACCESS_KEY_ID,
  R2_ENDPOINT,
  R2_SECRET_ACCESS_KEY,
  SOLANA_ADDRESS,
  TWILLO_ACCOUNT_SID,
  TWILLO_TOKEN,
} from "./config";
import { EthNetwok } from "./types/address";
import { BTC_WS_URL, CLIENT_URL, PORT } from "@paybox/common";
import morgan from "morgan";
import { Redis } from "./Redis";
import { clientRouter } from "./routes/client";
import cors from "cors";
import { addressRouter } from "./routes/address";
import { checkValidation, extractClientId } from "./auth/middleware";
import { qrcodeRouter } from "./routes/qrcode";
import { txnRouter } from "./routes/transaction";
import { expressMiddleware } from "@apollo/server/express4";
import { createApollo } from "./resolver/server";
import path from "path";
import swaggerUi, { JsonObject } from "swagger-ui-express";
import { accountRouter } from "./routes/account";
import { walletRouter } from "./routes/wallet";
import twilio from 'twilio';
import nodemailer from 'nodemailer';
import { S3Client } from '@aws-sdk/client-s3';


export * from "./db";
export * from "./Redis";
export * from "./auth";

export const app = express();
export const server = http.createServer(app);
export const wss = new WebSocketServer({ server });
// export const apolloServer = createApollo();

export const cache = new Redis();
export const redisClient = cache.getclient;

export const twillo = twilio(TWILLO_ACCOUNT_SID, TWILLO_TOKEN);
export const transporter = nodemailer.createTransport({
  service: MAIL_SERVICE,
  port: 465,
  secure: true,
  auth: {
    user: GMAIL,
    pass: GMAIL_APP_PASS
  }
}); 

export const cloud = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,

  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY
  }
});

app.use(bodyParser.json());
app.use(
  morgan("\n:method :url :status :res[content-length] - :response-time ms\n"),
);

export const corsOptions = {
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
app.use("/address", extractClientId, checkValidation, addressRouter);
app.use("/qrcode", extractClientId, checkValidation, qrcodeRouter);
app.use("/txn", extractClientId, checkValidation, txnRouter);
app.use("/account", extractClientId, checkValidation, accountRouter);
app.use("/wallet", extractClientId, checkValidation, walletRouter);


process.on("uncaughtException", function (err) {
  console.log("Caught exception: " + err);
});

process.on("unhandledRejection", function (reason, _promise) {
  console.log("Unhandled Rejection at:", reason);
});

process.on('SIGINT', async () => {
  await cache.getclient.disconnect();
  process.exit(0)
});

cache.getclient.on('ready', () => {
  server.listen(PORT, async () => {
    console.log(`Server listening on port: ${PORT}\n`);
  });
});
