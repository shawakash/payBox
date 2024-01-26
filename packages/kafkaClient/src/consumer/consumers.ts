import { kafkaClient } from "..";

const group = process.argv[2];

async function init() {
    const consuemr = await kafkaClient.connectCounsumer("newTxn", ["solTxn1"], true);
    await consuemr.run({
        eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
            console.log(
                `${group}: [${topic}]: PART:${partition}:`,
                message?.value?.toString()
            );
        }
    })
}

init();