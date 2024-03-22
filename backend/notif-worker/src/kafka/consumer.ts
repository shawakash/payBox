import { Consumer } from "kafkajs";
import { kafka } from "..";

export class ConsumerWorker {
    private consumer!: Consumer;
    public static instance: ConsumerWorker;

    constructor() {
    }

    public static getInstance() {
        if (!this.instance) {
            this.instance = new ConsumerWorker();
        }
        return this.instance;
    }

    async connectCounsumer(
        groupId: string,
        topics: string[],
        fromBeginning: boolean
    ) {
        this.consumer = kafka.consumer({ groupId });
        await this.consumer.connect();
        console.log(`consumer connected successfully`);
        await this.consumer.subscribe({ topics, fromBeginning });
        return this.consumer;
    }

    async disconnectConsumer() {
        await this.consumer.disconnect();
        return;
    }

    //TODO: create a function to run the consumer for different topics adn partitions
}