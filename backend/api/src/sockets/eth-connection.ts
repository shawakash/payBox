import Web3 from 'web3';
import { LogsSubscription } from 'web3-eth';
import { WebSocket } from 'ws';

// interface EthereumTransactionData {
//   type: 'transaction';
//   data: TransactionReceipt | null;
// }

export class EthTxnLogs {
  private web3: Web3;
  private address: string;

  private logsListeners: any[];
    subscription: any;

  constructor(rpcUrl: string, address: string) {
    this.web3 = new Web3(new Web3.providers.WebsocketProvider(rpcUrl));
    this.address = address;
    this.subscription = this.web3.eth.subscribe('logs', { address: this.address });
    this.logsListeners = [];
  }

  async connectWebSocket(ws: WebSocket) {

    this.subscription.on('data', async (log: LogsSubscription) => {
      console.log(log);
    //   const transactionReceipt = await this.web3.eth.getTransactionReceipt(log);
    //   const transactionData: EthereumTransactionData = {
    //     type: 'transaction',
    //     data: transactionReceipt,
    //   };
    //   console.log(transactionReceipt);
    //   this.logsListeners.push(transactionData);
    //   ws.send(JSON.stringify(transactionData));
    });

    ws.on('message', (message) => {
      const data = message.toString();
      console.log(data);
    });

    ws.on('close', () => {
      this.disconnectWebSocket(this.subscription, ws);
    });
  }

  disconnectWebSocket(subscription: any, ws: WebSocket) {
    if (subscription) {
      subscription.unsubscribe();
    }

    // Optionally, you can remove the WebSocket instance from an array of connected clients.
    // Example: this.connectedClients = this.connectedClients.filter(client => client !== ws);
  }
}

export default EthTxnLogs;
