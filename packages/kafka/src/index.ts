import { KafkaInstance } from "./admin";
import { initChatConsumer } from "./consumer/chat";
import { initTxnConsumer } from "./consumer/txn";

export * from "./admin";
export * from "./consumer";
export * from "./producer";

export const kafkaClient = new KafkaInstance();

(async () => {
  await kafkaClient.init([{ topicName: "txn4", partitions: 2 }, { topicName: "chat", partitions: 1 }]);
  await kafkaClient.connectProducer();

  await initTxnConsumer({
    groupId: "txn",
    topics: ["txn4"],
  });

  await initChatConsumer({
    groupId: "chat",
    topics: ["chat"],
  });

})();


