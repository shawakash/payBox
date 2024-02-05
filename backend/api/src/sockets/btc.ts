import { BTC_WS_URL } from '@paybox/common';
import { WebSocket } from 'ws';

export class BtcTxn {
    private socket: WebSocket;
    private address: string;
    private btcws: WebSocket;

    constructor(url: string, address: string) {
        this.socket = new WebSocket(url);
        this.address = address;
        this.btcws = new WebSocket(BTC_WS_URL); //INCOMING SOCKET
    }

    // ws OUTGOING SOCKET
    async connectWebSocket(ws: WebSocket) {
        console.log('Connecting to BTC WebSocket...');
        this.btcws.send(JSON.stringify({ op: 'addr_sub', addr: this.address }));

        this.btcws.on('open', (data: any) => {
            try {
                const transaction = JSON.parse(data.toString());
                console.log('New transaction: ', transaction);
                ws.send(JSON.stringify(transaction));
            } catch (error) {
                console.error(error);
            }
        });

        ws.on('message', (message) => {
            const data = message.toString();
            console.log(data);
        });

        ws.on('close', () => {
            // this.disconnectWebSocket(this.wsProvider, ws);
        });
    }

    disconnectWebSocket(subscription: any, ws: WebSocket) {
        if (subscription) {
            subscription.unsubscribe();
        }

        // Optionally, you can remove the WebSocket instance from an array of connected clients.
        // Example: this.connectedClients = this.connectedClients.filter(client => client !== ws);
    }

    onError(event: Event) {
        console.error('WebSocket error:', event);
        // Add your logic here for handling errors
    }

    public send(message: string) {
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(message);
        } else {
            console.warn('WebSocket connection is not open');
        }
    }

    public close() {
        this.socket.close();
    }
}