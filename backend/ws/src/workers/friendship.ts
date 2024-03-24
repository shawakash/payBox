import { Producer } from "kafkajs";
import { PublishType } from "@paybox/common";
import { Kafka } from "kafkajs";
import { NOTIF_KAFKA_URL, NOTIF_KAFKA_ID } from "../config";

export const notifKafka = new Kafka({
    clientId: NOTIF_KAFKA_ID,
    brokers: [NOTIF_KAFKA_URL],
});

export class NotifWorker {
    private notifProducer: Producer;
    public static instance: NotifWorker;

    constructor() {
        this.notifProducer = notifKafka.producer();
        this.notifProducer.connect();
        console.log("Notif Kafka Producer Connected")
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new NotifWorker();
        }
        return this.instance;
    }

    get getProducer() {
        return this.notifProducer;
    }

    async connectProducer() {
        this.notifProducer = notifKafka.producer();
        await this.notifProducer.connect();
        console.log("Producer Connected Successfully");
        return;
    }

    async disconnectProducer() {
        await this.notifProducer.disconnect();
        return;
    }

    async publishOne(payload: PublishType) {
        await this.notifProducer.send({
            topic: payload.topic,
            messages: payload.message,
        });
        console.log("payload published successfully");
        return;
    }

    async publishMany(payloads: PublishType[]) {
        await this.notifProducer.sendBatch({
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