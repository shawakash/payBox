import { dbResStatus } from "@paybox/common";
import { insertChatOne } from "@paybox/backend-common";
import { kafkaClient } from "..";

export const initChatConsumer = async ({
    groupId,
    topics,
}: { groupId: string, topics: string[] }) => {
    const chatConsumer = await kafkaClient.connectCounsumer(
        groupId,
        topics,
        true,
    );
    await chatConsumer.run({
        eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
            const payload = JSON.parse(message.value?.toString() || "");
            const mutate = await insertChatOne(
                payload.senderId,
                payload.friendshipId,
                payload.message,
                payload.sendAt
            );
            if (mutate.status == dbResStatus.Error) {
                console.log("Error from db");
                // Pause processing of new messages for this topic/partition
                pause(); 
            }
            console.log(
                `chat: [${topic}]: PART:${partition}:`,
                message?.value?.toString(),
            );
            await heartbeat();
        },
    });
}