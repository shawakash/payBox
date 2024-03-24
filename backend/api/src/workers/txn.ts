import { Producer } from "kafkajs";
import { PublishType } from "@paybox/common";
import { Kafka } from "kafkajs";
import { CHAT_KAFKA_URL, CHAT_KAFKA_ID } from "../config";

export const kafka = new Kafka({
    clientId: CHAT_KAFKA_ID,
    brokers: [CHAT_KAFKA_URL],
});

export class Worker {
    private producer: Producer;
    public static instance: Worker;

    constructor() {
        this.producer = kafka.producer();
        this.producer.connect();
        console.log("Worker Producer Connected")
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new Worker();
        }
        return this.instance;
    }

    get getProducer() {
        return this.producer;
    }

    async connectProducer() {
        this.producer = kafka.producer();
        await this.producer.connect();
        console.log("Producer Connected Successfully");
        return;
    }

    async disconnectProducer() {
        await this.producer.disconnect();
        return;
    }

    async publishOne(payload: PublishType) {
        await this.producer.send({
            topic: payload.topic,
            messages: payload.message,
        });
        console.log("payload published successfully");
        return;
    }

    async publishMany(payloads: PublishType[]) {
        await this.producer.sendBatch({
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