import { PORT } from "@paybox/common";
import cluster from "cluster";
import os from "os";
import { server } from "./server";

const cpuCount = os.cpus().length;

if (cluster.isMaster) {   // isPrimary
  // Create a worker for each CPU
  for (let i = 0; i < cpuCount; i++) {
    cluster.fork();
  }
} else {
  server.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
  });
}