import cluster from "cluster";
import express from "express";
import os from "os";

import { KAFKA_ID, KAFKA_URL, PORT } from "./config";
import { Kafka } from "kafkajs";
import { WorkerAdmin } from "./kafka/admin";
import { ConsumerWorker } from "./kafka/consumer";
import { ProducerWorker } from "./kafka/producer";
import Prometheus from "prom-client";


export const kafka = new Kafka({
    clientId: KAFKA_ID,
    brokers: [KAFKA_URL],
});

const defaultMetrics = Prometheus.collectDefaultMetrics;
defaultMetrics({ register: Prometheus.register, });


const workers: { [workerPid: string]: any } = {},
    count = os.cpus().length;

function spawn() {
    const worker = cluster.fork();
    //@ts-ignore
    workers[worker.pid] = worker;
    return worker;
}

if (cluster.isPrimary) {
    for (let i = 0; i < count; i++) {
        spawn();
    }
    cluster.on("death", function (worker: any) {
        console.log("worker " + worker.pid + " died. spawning a new process...");
        delete workers[worker.pid];
        spawn();
    });
    const app = express();

    app.get("/metrics", async (_req, res) => {
        res.set("Content-Type", Prometheus.register.contentType);
        try {
            const metrics = await Prometheus.register.metrics();
            return res.end(metrics);
        } catch (error) {
            console.error('Error while fetching metrics:', error);
            return res.status(500).end('Error while fetching metrics');
        }
    }); 

    (async () => {
        await WorkerAdmin.getInstance().init([
            { topicName: "notif", partitions: 1 },
        ]);

        // This can be connected in any service/s
        await ProducerWorker.getInstance().connectProducer();

    })();

    app.listen(PORT, async () => {
        console.log(`Server listening on port: ${PORT}\n`);
    });
} else {
    (async () => {
        try {
            await ConsumerWorker.getInstance().connectCounsumer(
                "notif-group",
                ["notif"],
                true
            );
            await ConsumerWorker.getInstance().runConsumer();

        } catch (error) {
            console.log(`Error in consumer operations: ${error}`);
            process.exit(1);
        }
    })();
}

process.on("uncaughtException", function (err) {
    console.log("Caught exception: " + err);
});