import { TxnType, dbResStatus } from "@paybox/common";
import { KafkaInstance } from "./admin";
import { insertTxn } from "./db/transaction";

export * from "./admin";
export * from "./consumer";
export * from "./producer";
export * from "./db";

export const kafkaClient = new KafkaInstance();

(async () => {
  await kafkaClient.init([{ topicName: "txn4", partitions: 2 }]);
  await kafkaClient.connectProducer();
  const consumer = await kafkaClient.connectCounsumer(
    "sendTxn4",
    ["txn4"],
    true,
  );
  await consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
      const payload = JSON.parse(message.value?.toString() || "");
      const insertTxnOne = await insertTxn({
        ...payload,
      });
      if (insertTxnOne.status == dbResStatus.Error) {
        console.log("Error from db");
      }
      console.log(
        `sol: [${topic}]: PART:${partition}:`,
        message?.value?.toString(),
      );
    },
  });
})();
