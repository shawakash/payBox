import { KAFKA_CLIENT_ID } from "@paybox/common";
import { Kafka } from "kafkajs";

export const kafka = new Kafka({
    clientId: KAFKA_CLIENT_ID,
    brokers: ["localhost:9092"]
});