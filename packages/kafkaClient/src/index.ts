import { TxnType, dbResStatus } from "@paybox/common";
import { KafkaInstance } from "./admin";
import { insertTxn } from "./db/transaction";

export * from "./admin";
export * from "./consumer";
export * from "./producer";

export const kafkaClient = new KafkaInstance();

async function init() {
    const consuemr = await kafkaClient.connectCounsumer("newTxn", ["solTxn1"], true);
    await consuemr.run({
        eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
            const payload = JSON.parse(message.value?.toString() || ""); 
            const insertTxnOne = await insertTxn({
                ...payload
            });
            if (insertTxnOne.status == dbResStatus.Error) {
                console.log("Error from db");
            }
            console.log(
                `sol: [${topic}]: PART:${partition}:`,
                message?.value?.toString()
            );
        }
    })
}

init();