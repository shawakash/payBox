import { KAFKA_CLIENT_ID, KAFKA_URL } from "@paybox/common";
import { Kafka } from "kafkajs";

export const kafka = new Kafka({
    clientId: KAFKA_CLIENT_ID,
    brokers: [KAFKA_URL]
});

export * from "./kafkaInst";
