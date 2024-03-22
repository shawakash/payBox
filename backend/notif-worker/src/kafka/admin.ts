import { Admin } from "kafkajs";
import { KafkaTopicType } from "@paybox/common";
import {kafka} from "../index";

export class WorkerAdmin {
    private admin: Admin;
    public static instance: WorkerAdmin;

    constructor() {
        this.admin = kafka.admin();
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new WorkerAdmin();
        }
        return this.instance;
    }

    async init(topics: KafkaTopicType[]) {
        await this.admin.connect();
        await this.admin.createTopics({
            topics: topics.map((topic) => {
                return {
                    topic: topic.topicName,
                    numPartitions: topic.partitions,
                };
            }),
        });
        console.log("\n Kafka Ready");

        await this.admin.disconnect();
        return;
    }

}
  