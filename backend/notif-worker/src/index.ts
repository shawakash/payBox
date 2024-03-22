import cluster from "cluster";
import express from "express";
import os from "os";

import { PORT } from "./config";


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
    app.listen(PORT, async () => {
        console.log(`Server listening on port: ${PORT}\n`);
    });
} else {
    (async () => {
        const x = 0;
        while (x < 1) {
            // Run always
            //   await processQueue();

        }
    })();
}

process.on("uncaughtException", function (err) {
    console.log("Caught exception: " + err);
});