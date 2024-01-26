import { KafkaTopicType } from "@paybox/common";
import { kafka } from "./index";
import {Admin, Producer, Consumer} from "kafkajs";

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
        console.log("Admin Connected");
        await this.admin.createTopics({
            topics: topics.map(topic => {
                return {
                    topic: topic.topicName,
                    numPartitions: topic.partitions
                }
            })
        });
    
        console.log("Topics creatation success");
    
        console.log("Disconnecting Admin..");
        await this.admin.disconnect();
        console.log("Admin disconnection success..");
    
    }

    // Create A producer modifer

    async createConsumers(groupId: string) {
        this.consumer = kafka.consumer({ groupId });
    }
}