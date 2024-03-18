import {Chain, order_by} from "@paybox/zeus";
import {ChatType, dbResStatus, HASURA_ADMIN_SERCRET, HASURA_URL, JWT} from "@paybox/common";

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

/**
 * 
 * @param friendshipId 
 * @returns 
 */
export const getChats = async (
    friendshipId: string
): Promise<{
    status: dbResStatus,
    chats?: ChatType[]
}> => {
    const response = await chain("query")({
        chat: [{
            where: {
                friendshipId: {_eq: friendshipId}
            },
            limit: 20,
            order_by: [{
                sendAt: order_by["desc"]
            }],
        }, {
            friendshipId: true,
            id: true,
            message: true,
            sendAt: true,
            updatedAt: true,
            senderId: true
        }],
    }, {operationName: "getChats"});
    if(Array.isArray(response.chat)) {
        return {
            status: dbResStatus.Ok,
            chats: response.chat as ChatType[]
        }
    }
    return {
        status: dbResStatus.Error
    }
}