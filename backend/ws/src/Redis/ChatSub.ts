import {createClient, RedisClientType} from "redis";
import {CHAT_REDIS_URL} from "../config";
import {WsMessageType} from "@paybox/common";
import {WsMessageTypeEnum} from "@paybox/common/src";

export class ChatSub {
    public static instance: ChatSub;
    private subscriber: RedisClientType;
    private publisher: RedisClientType;
    private subscriptions: Map<string, string[]>;
    private reverseSubscriptions: Map<string, { [clientId: string]: { clientId: string, ws: WebSocket } }>;

    constructor() {
        this.subscriber = createClient({
            url: CHAT_REDIS_URL,
        });
        this.publisher = createClient({
            url: CHAT_REDIS_URL,
        });
        this.subscriptions = new Map<string, string[]>();
        this.reverseSubscriptions = new Map<string, { [clientId: string]: { clientId: string, ws: any } }>();

        this.subscriber.connect();
        this.publisher.connect();
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new ChatSub()
        }
        return this.instance;
    }

    subscribe(channelId: string, clientId: string, ws: any) {
        this.subscriptions.set(clientId, [
            ...(this.subscriptions.get(clientId) || []),
            channelId
        ]);

        this.reverseSubscriptions.set(channelId, {
            ...(this.reverseSubscriptions.get(channelId) || {}),
            [clientId]: {clientId, ws}
        });

        if (Object.keys(this.reverseSubscriptions.get(channelId) || {}).length === 1) {
            console.log(`subscribe ${clientId} to ${channelId}`);
            // TODO: add the channelId to db
            this.subscriber.subscribe(channelId, (payload) => {
                console.log(`received message from ${channelId}`);
                // TODO: PUBLISH THE MESSAGE TO DB
                try {
                    const subs = this.reverseSubscriptions.get(channelId) || {};
                    Object.values(subs).forEach(({ws}) => {
                        ws.send(JSON.stringify(payload));
                    });
                } catch (error) {
                    console.error(`Error sending message ${error}`);
                }
            });
        }
    }

    publish(channelId: string, data: any) {
        console.log(`publishing to ${channelId}`);
        this.publisher.publish(channelId, JSON.stringify(data));
    }

    async sendMessage(channelId: string, payload: any) {
        this.publish(
            channelId, {
                type: WsMessageTypeEnum.Chat,
                payload
            }
        )
    }
}