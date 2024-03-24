import { createClient, RedisClientType } from "redis";
import { CHAT_REDIS_URL } from "../config";
import { ChatPayload, WsChatMessageType, WsMessageTypeEnum } from "@paybox/common";
import { ChatWorker } from "../workers/chat";

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

    subscribe(friendshipId: string, clientId: string, ws: any) {
        this.subscriptions.set(clientId, [
            ...(this.subscriptions.get(clientId) || []),
            friendshipId
        ]);

        this.reverseSubscriptions.set(friendshipId, {
            ...(this.reverseSubscriptions.get(friendshipId) || {}),
            [clientId]: { clientId, ws }
        });

        if (Object.keys(this.reverseSubscriptions.get(friendshipId) || {}).length === 1) {
            console.log(`subscribe ${clientId} to ${friendshipId}`);
            // TODO: add the client to friendships
            this.subscriber.subscribe(friendshipId, async (payload) => {
                const parsePayload = JSON.parse(payload) as WsChatMessageType;
                console.log(`received message from ${friendshipId}`);

                try {
                    const subs = this.reverseSubscriptions.get(friendshipId) || {};
                    Object.values(subs).forEach(({ ws }) => {
                        ws.send(JSON.stringify(parsePayload));
                    });

                    // Publishing message to queue
                    try {
                        await ChatWorker.getInstance().publishOne({
                            topic: "chat",
                            message: [{
                                partition: 0,
                                key: friendshipId,
                                value: JSON.stringify({
                                    senderId: parsePayload.payload.senderId,
                                    sendAt: (new Date()).toISOString(),
                                    friendshipId,
                                    message: parsePayload.payload.message
                                })
                            }]
                        });
                    } catch (error) {
                        console.log(error);
                    }
                    
                } catch (error) {
                    console.error(`Error sending message ${error}`);
                }
            });
        }
    }

    publish(channelId: string, data: {
        type: WsMessageTypeEnum,
        payload: ChatPayload
    }) {
        console.log(`publishing to ${channelId}`);
        this.publisher.publish(channelId, JSON.stringify(data));
    }

    async sendMessage(channelId: string, payload: any) {
        this.publish(
            channelId, {
            type: WsMessageTypeEnum.Chat,
            payload: payload as ChatPayload
        }
        )
    }

    unsubscribe(clientId: string, channelId: string) {
        this.subscriptions.set(clientId, [
            ...(this.subscriptions.get(clientId) || []).filter((id) => id !== channelId)
        ]);
        if (this.subscriptions.get(clientId)?.length === 0) {
            this.subscriptions.delete(clientId)
        }

        delete this.reverseSubscriptions.get(channelId)?.[clientId];
        if (
            !this.reverseSubscriptions.get(channelId) ||
            Object.keys(this.reverseSubscriptions.get(channelId) || {}).length === 0
        ) {
            // unsubscribe from the channel
            this.subscriber.unsubscribe(channelId);
            // removing the channel from the reverseSubscriptions
            this.reverseSubscriptions.delete(channelId);
        }
    }
}