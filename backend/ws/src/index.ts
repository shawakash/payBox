import cluster from "cluster";
import os from "os";
import {server} from "./app";
import {WSPORT} from "@paybox/common";


const cpuCount = os.cpus().length;

if (cluster.isPrimary) {
    // Create a worker for each CPU
    for (let i = 0; i < cpuCount; i++) {
        cluster.fork();
    }
} else {
    server.listen(WSPORT, async () => {
        console.log(`Server listening on port: ${WSPORT}\n`);
    });
}