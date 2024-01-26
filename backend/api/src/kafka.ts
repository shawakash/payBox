import { KafkaTopicType, PublishType } from "@paybox/common";
import { kafka } from "./index";
import { Admin, Producer, Consumer } from "kafkajs";

export class KafkaInstance {
    private admin: Admin;
    private producer: Producer;
    private consumer!: Consumer;

    constructor() {
        this.admin = kafka.admin();
        this.admin.connect();
        this.producer = kafka.producer();
    }

    async init(topics: KafkaTopicType[]) {
        await this.admin.connect();
        await this.admin.createTopics({
            topics: topics.map(topic => {
                return {
                    topic: topic.topicName,
                    numPartitions: topic.partitions
                }
            })
        });
        console.log("\n Kafka Ready");

        await this.admin.disconnect();
        return;
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
            messages: payload.message
        });
        return;
    }

    async publishMany(payloads: PublishType[]) {
        await this.producer.sendBatch({
            topicMessages: payloads.map(payload => {
                return {
                    topic: payload.topic,
                    messages: payload.message
                }
            })
        });
        return;
    }

    async connectCounsumer(groupId: string, topics: string[], fromBeginning: boolean) {
        this.consumer = kafka.consumer({ groupId });
        await this.consumer.connect();
        await this.consumer.subscribe({ topics,  fromBeginning});
        return this.consumer;
    }

    async disconnectConsumer() {
        await this.consumer.disconnect();
        return;
    }
}