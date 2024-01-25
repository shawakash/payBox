import { kafka } from "./client";
import readline from "readline";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});


(async () => {
    const producer = kafka.producer();

    console.log("Connecting Producer");
    await producer.connect();
    console.log("Producer Connected Successfully");

    rl.setPrompt("> ");
    rl.prompt();

    rl.on("line", async function (line) {
        const [hash, network] = line.split(" ");
        console.log(network);
        await producer.send({
            topic: "transaction",
            messages: [
                {
                    partition: network?.toLowerCase() === "sol" ? 0 : 1,
                    key: "new-transaction",
                    value: JSON.stringify({ hash, network }),
                },
            ],
        });
    }).on("close", async () => {
        await producer.disconnect();
    });
})();