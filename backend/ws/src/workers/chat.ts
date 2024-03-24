import { Producer } from "kafkajs";
import { PublishType } from "@paybox/common";
import { Kafka } from "kafkajs";
import { CHAT_KAFKA_URL, CHAT_KAFKA_ID } from "../config";

export const chatKafka = new Kafka({
    clientId: CHAT_KAFKA_ID,
    brokers: [CHAT_KAFKA_URL],
});

export class ChatWorker {
    private chatProducer: Producer;
    public static instance: ChatWorker;

    constructor() {
        this.chatProducer = chatKafka.producer();
        this.chatProducer.connect();
        console.log("Chat Kafka Producer Connected")
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new ChatWorker();
        }
        return this.instance;
    }

    get getProducer() {
        return this.chatProducer;
    }

    async connectProducer() {
        this.chatProducer = chatKafka.producer();
        await this.chatProducer.connect();
        console.log("Producer Connected Successfully");
        return;
    }

    async disconnectProducer() {
        await this.chatProducer.disconnect();
        return;
    }

    async publishOne(payload: PublishType) {
        await this.chatProducer.send({
            topic: payload.topic,
            messages: payload.message,
        });
        console.log("payload published successfully");
        return;
    }

    async publishMany(payloads: PublishType[]) {
        await this.chatProducer.sendBatch({
            topicMessages: payloads.map((payload) => {
                return {
                    topic: payload.topic,
                    messages: payload.message,
                };
            }),
        });
        return;
    }

}