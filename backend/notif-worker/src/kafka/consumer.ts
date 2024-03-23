import { Consumer } from "kafkajs";
import { kafka } from "..";
import { NotifTopics } from "@paybox/common";
import {notifyFriendRequest} from "../processes";

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
    async runConsumer() {
        await this.consumer.run({
            eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
                const payload = JSON.parse(message.value?.toString() || "");
                
                switch (topic) {
                    case NotifTopics.FriendRequest:
                        //TODO: NOTIFY THE FRIEND REQUEST
                        await notifyFriendRequest(payload.to, payload.from)
                        console.log("Friend Request Notification");
                        break;

                    case NotifTopics.FriendRequestAccepted:
                        //TODO: NOTIFY THE FRIEND REQUEST ACCEPTED
                        console.log("Friend Request Accepted");
                        break;

                    case NotifTopics.FriendRequestRejected:
                        //TODO: NOTIFY THE FRIEND REQUEST REJECTED
                        console.log("Friend Request Rejected");
                        break;

                    case NotifTopics.TxnAccept:
                        //Todo: NOTIFY THE TRANSACTION ACCEPTED
                        console.log("Transaction Accepted");
                        break;

                    case NotifTopics.TxnReject:
                        //Todo: NOTIFY THE TRANSACTION REJECTED
                        console.log("Transaction Rejected");
                        break;
                    
                    case NotifTopics.Paid:
                        //Todo: NOTIFY THE TRANSACTION PAID
                        console.log("Transaction Paid");
                        break;

                    default:
                        console.log(`No handler for topic: ${topic}`)
                        break;
                }

                await heartbeat();
            },
        });
    }
}