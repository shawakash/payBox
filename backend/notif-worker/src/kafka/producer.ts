import { Producer } from "kafkajs";
import { kafka } from "..";
import { PublishType } from "@paybox/common";

export class ProducerWorker {
    private producer: Producer;
    public static instance: ProducerWorker;

    constructor() {
        this.producer = kafka.producer();
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new ProducerWorker();
        }
        return this.instance;
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