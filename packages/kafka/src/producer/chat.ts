import {kafkaClient} from "../index";

export const publishChatMsg = async ({
    senderId,
    friendshipId,
    message,
    sendAt
}: {
    senderId: string,
    friendshipId: string,
    message: string,
    sendAt: string,
}): Promise<boolean> => {
    try {
        await kafkaClient.publishOne({
            topic: "chat",
            message: [{
                partition: 0,
                key: friendshipId,
                value: JSON.stringify({
                    senderId,
                    friendshipId,
                    message,
                    sendAt,
                })
            }]
        });

        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}