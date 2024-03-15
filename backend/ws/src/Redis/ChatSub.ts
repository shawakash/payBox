import {createClient, RedisClientType} from "redis";
import {CHAT_REDIS_URL} from "../config";

export class ChatSub {
    public static instance: ChatSub;
    private subscriber: RedisClientType;
    private publisher: RedisClientType;
    private subscriptions: Map<string, string[]>;
    private reverseSubscriptions: Map<string, { [clientId: string]: {clientId: string, ws: WebSocket} }>;

    constructor() {
        this.subscriber = createClient({
            url: CHAT_REDIS_URL,
        });
        this.publisher = createClient({
            url: CHAT_REDIS_URL,
        });
        this.subscriptions = new Map<string, string[]>();
        this.reverseSubscriptions = new Map<string, { [clientId: string]: {clientId: string, ws: WebSocket} }>();

        this.subscriber.connect();
        this.publisher.connect();
    }

    static getInstance() {
        if(!this.instance) {
            this.instance = new ChatSub()
        }
        return this.instance;
    }
}