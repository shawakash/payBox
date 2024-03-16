import {Chain} from "@paybox/zeus";
import {dbResStatus, HASURA_ADMIN_SERCRET, HASURA_URL, JWT} from "@paybox/common";

const chain = Chain(HASURA_URL, {
    headers: {
        Authorization: `Bearer ${JWT}`,
        "x-hasura-admin-secret": HASURA_ADMIN_SERCRET,
    },
});

/**
 * @param senderId
 * @param friendshipId
 * @param message
 */
export const insertChatOne = async (
    senderId: string,
    friendshipId: string,
    message: string,
    sendAt: string
): Promise<{
    status: dbResStatus,
    id?: string
}> => {
    const response = await chain("mutation")({
        insert_chat_one: [{
            object: {
                message,
                senderId,
                friendshipId,
                sendAt
            }
        }, {
            id: true
        }]
    }, {operationName: "insertChatOne" });
    if(response.insert_chat_one?.id) {
        return {
            id: response.insert_chat_one.id as string,
            status: dbResStatus.Ok
        }
    }
    return {
        status: dbResStatus.Error,
    }
}