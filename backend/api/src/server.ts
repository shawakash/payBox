import express from "express";
import bodyParser from "body-parser";
import http from "http";
import { WebSocketServer } from "ws";
import { ETH_ADDRESS, INFURA_PROJECT_ID, SEPOLIA_URL, SEPOLIA_URL_HTTP, SOLANA_ADDRESS } from "./config";
import SolTxnLogs from "./sockets/connection";
import EthTxnLogs from "./sockets/eth-connection";
import { ethers } from "ethers";

export const app = express();
export const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const solTxn = new SolTxnLogs("devnet", SOLANA_ADDRESS);
const ethTxn = new EthTxnLogs(SEPOLIA_URL, ETH_ADDRESS);
const provider = new ethers.InfuraWebSocketProvider("sepolia", INFURA_PROJECT_ID);
const provider2 = new ethers.JsonRpcProvider(SEPOLIA_URL_HTTP, "sepolia");

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

async function isTransactionConfirmed(transactionHash: string): Promise<boolean> {
    try {
      // Connect to an Ethereum node (e.g., Infura)
      const provider = new ethers.InfuraProvider("sepolia", INFURA_PROJECT_ID);
  
      // Get transaction receipt
      const transactionReceipt = await provider.waitForTransaction(transactionHash);
      // Check if the transaction receipt exists and has the required number of confirmations
      console.log(transactionReceipt)
      if (transactionReceipt &&  transactionReceipt.blockHash.length > 0) {
        console.log(`Transaction ${transactionHash} is confirmed with ${transactionReceipt.confirmations} confirmations.`);
        return true;
      } else {
        console.log(`Transaction ${transactionHash} is still pending or has not reached the required confirmations.`);
        return false;
      }
    } catch (error) {
      console.error('Error checking transaction confirmation:', error);
      return false;
    }
  }


wss.on('connection', async (ws) => {
    // solTxn.connectWebSocket(ws);

    /**
     * Filter for a specific address is not working for most of the providers
     */
    const filter = {
        address: ETH_ADDRESS,
        topics: [
            null, // Any event (wildcard)
            null, // Sender address (wildcard)
            ethers.zeroPadValue(ethers.hexlify(ETH_ADDRESS), 32) // Receiver address
        ]
    };

    provider.on("pending", async (log) => {
        try {
            const txn = await provider.getTransaction(log);
            if (txn !== null && txn.to !== null) {
                if (filter.address === txn.to) {
                    
                    /**
                     * Check if the transaction got confirmed
                    */
                   if((await isTransactionConfirmed(txn.hash))) {
                        console.log({
                            txnObj: txn,
                            address: txn.from,
                            value: ethers.formatEther(txn.value),
                            timestamp: new Date(),
                            txnHash: txn.hash,
                            status: "success"
                        });
                        ws.send(JSON.stringify(txn));
                    }

                }
            }
        } catch (err) {
            console.error(err);
        }
    });

    // ethTxn.connectWebSocket(ws);
    ws.on('message', (message) => {
        const data = message.toString();
        console.log(data);
    });

});

// server.listen(PORT, () => {
//     console.log(`Server listening on port: ${PORT}`);
// });