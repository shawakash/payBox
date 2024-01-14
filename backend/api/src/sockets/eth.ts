import { InfuraProvider, InfuraWebSocketProvider, ProviderEvent, TransactionReceipt, ethers } from 'ethers';
import { WebSocket } from 'ws';
import { EthNetwok } from '../types/chain';

interface EthereumTransactionData {
  type: 'transaction';
  data: TransactionReceipt | null;
}

export class EthTxnLogs {
  private address: string;
  private projectId: string;
  private logsListeners: any[];
  private network: EthNetwok;
  private wsProvider: InfuraWebSocketProvider;
  private httpProvider: InfuraProvider;
  private filter: ProviderEvent;

  constructor(network: EthNetwok, projectId: string, address: string, filter?: ProviderEvent) {
    this.address = address;
    this.logsListeners = [];
    this.projectId = projectId;
    this.network = network;
    this.filter = filter || "pending";
    this.wsProvider = new ethers.InfuraWebSocketProvider(this.network, this.projectId);
    this.httpProvider = new ethers.InfuraProvider(this.network, this.projectId);
  }

  async connectWebSocket(ws: WebSocket) {
    /**
     * Filter for a specific address is not working for most of the providers
     */
    //   const filter = {
    //     address: this.address,
    //     topics: [
    //         null, // Any event (wildcard)
    //         null, // Sender address (wildcard)
    //         ethers.zeroPadValue(ethers.hexlify(this.address), 32) // Receiver address
    //     ]
    // };

    this.wsProvider.on(this.filter, async (log) => {
      try {
        const txn = await this.httpProvider.getTransaction(log);
        if (txn !== null && txn.to !== null) {
          if (this.address === txn.to) {

            /**
             * Check if the transaction got confirmed
            */
            if ((await this.isTransactionConfirmed(txn.hash))) {
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

    ws.on('message', (message) => {
      const data = message.toString();
      console.log(data);
    });

    ws.on('close', () => {
      this.disconnectWebSocket(this.wsProvider, ws);
    });
  }

  disconnectWebSocket(subscription: any, ws: WebSocket) {
    if (subscription) {
      subscription.unsubscribe();
    }

    // Optionally, you can remove the WebSocket instance from an array of connected clients.
    // Example: this.connectedClients = this.connectedClients.filter(client => client !== ws);
  }
  /**
   * to check if the pending transaction confirmed or not
   * @param transactionHash 
   * @returns 
   */
  async isTransactionConfirmed(transactionHash: string): Promise<boolean> {
    try {

      const transactionReceipt = await this.httpProvider.waitForTransaction(transactionHash);

      if (transactionReceipt && transactionReceipt.blockHash.length > 0) {
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

}

export default EthTxnLogs;
