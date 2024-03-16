import { dbResStatus } from "@paybox/common";
import { kafkaClient } from "..";
import {insertTxn} from "@paybox/backend-common"

export const initTxnConsumer = async ({
    groupId,
    topics,
}: { groupId: string, topics: string[] }) => {
    const txnConsumer = await kafkaClient.connectCounsumer(
        groupId,
        topics,
        true,
    );
    await txnConsumer.run({
        eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
            const payload = JSON.parse(message.value?.toString() || "");
            const insertTxnOne = await insertTxn({
                ...payload,
            });
            if (insertTxnOne.status == dbResStatus.Error) {
                console.log("Error from db");
                pause();
            }
            console.log(
                `${payload.network}: [${topic}]: PART:${partition}:`,
                message?.value?.toString(),
            );
            await heartbeat();
        },
    });
}