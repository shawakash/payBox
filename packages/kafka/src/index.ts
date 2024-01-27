import { TxnType, dbResStatus } from "@paybox/common";
import { KafkaInstance } from "./admin";
import { insertTxn } from "./db/transaction";

export * from "./admin";
export * from "./consumer";
export * from "./producer";

export const kafkaClient = new KafkaInstance();

(async () => {
    await kafkaClient.init([
        {topicName: "txn", partitions: 2},
    ]);
    await kafkaClient.connectProducer();
    const consumer = await kafkaClient.connectCounsumer("sendTxn", ["txn"], true);
    await consumer.run({
        eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
            const payload = JSON.parse(message.value?.toString() || ""); 
            const insertTxnOne = await insertTxn({
                ...payload
            });
            if (insertTxnOne.status == dbResStatus.Error) {
                console.log("Error from db");
            }
            console.log(
                `sol: [${topic}]: PART:${partition}:`,
                message?.value?.toString()
            );
        }
    })
})();
