import { Chain, order_by } from "@paybox/zeus";
import { AcceptFriendship, dbResStatus, FriendshipStatusEnum, FriendshipType, HASURA_ADMIN_SERCRET, HASURA_URL, JWT } from "@paybox/common";
import { FriendshipStatus } from "@paybox/common";

const chain = Chain(HASURA_URL, {
    headers: {
        Authorization: `Bearer ${JWT}`,
        "x-hasura-admin-secret": HASURA_ADMIN_SERCRET,
    },
});


/**
 * 
 * @param clientId1 
 * @param clientId2 
 * @returns 
 */
export const requestFriendship = async (
    clientId1: string,
    username: string,
): Promise<{
    status: dbResStatus,
    id?: string,
    friendshipStatus?: FriendshipStatus,
    msg?: string
}> => {

    const getClientId2 = await chain("query")({
        client: [{
            where: {
                username: { _eq: username }
            }
        }, {
            id: true
        }]
    }, { operationName: "getClientId2" });

    if (getClientId2.client.length === 0) {
        return {
            status: dbResStatus.Error,
            msg: "No such user"
        }
    }

    //check friendship
    const checkFriendshipRes = await chain("query")({
        friendship: [{
            where: {
                _or: [
                    {
                        clientId1: { _eq: clientId1 },
                        clientId2: { _eq: getClientId2.client[0].id }
                    },
                    {
                        clientId1: { _eq: getClientId2.client[0].id },
                        clientId2: { _eq: clientId1 }
                    }
                ]
            },
        }, {
            status: true,
            id: true
        }]
    }, { operationName: "checkFriendship" });
    if (checkFriendshipRes.friendship.length > 0) {
        return {
            status: dbResStatus.Ok,
            msg: "Friendship already exists",
            id: checkFriendshipRes.friendship[0].id as string,
            friendshipStatus: checkFriendshipRes.friendship[0].status as FriendshipStatus
        }
    }

    const response = await chain("mutation")({
        insert_friendship_one: [{
            object: {
                clientId1,
                clientId2: getClientId2.client[0].id
            }
        }, {
            id: true,
            status: true
        }]
    }, { operationName: "requestFriendship" });

    if (response.insert_friendship_one?.id) {
        return {
            id: response.insert_friendship_one.id as string,
            status: dbResStatus.Ok,
            friendshipStatus: response.insert_friendship_one.status as FriendshipStatus
        }
    }
    return {
        status: dbResStatus.Error
    }
}

/**
 * 
 * @param id string
 * @param clientId string
 * @returns 
 */
export const checkFriendship = async (
    id: string,
    clientId: string,
): Promise<{
    status: dbResStatus,
    friendshipStatus?: FriendshipStatus
}> => {
    const response = await chain("query")({
        friendship: [{
            where: {
                id: { _eq: id },
                _or: [
                    { clientId1: { _eq: clientId } },
                    { clientId2: { _eq: clientId } }
                ],
            }
        }, {
            status: true
        }]
    }, { operationName: "checkFriendship" });
    if (response.friendship.length === 0) {
        return {
            status: dbResStatus.Ok,
        }
    }
    if (response.friendship[0].status) {
        return {
            status: dbResStatus.Ok,
            friendshipStatus: response.friendship[0].status as FriendshipStatus
        }
    }
    return {
        status: dbResStatus.Error
    }
}

/**
 * 
 * @param friendshipId 
 * @returns 
 */
export const acceptFriendship = async (
    clientId: string,
    friendshipId: string,
): Promise<{
    status: dbResStatus,
    friendshipStatus?: FriendshipStatus,
    to?: string
}> => {
    const response = await chain("mutation")({
        update_friendship: [{
            where: {
                id: { _eq: friendshipId },
                _or: [
                    { clientId1: { _eq: clientId } },
                    { clientId2: { _eq: clientId } }
                ],
            },
            _set: {
                status: FriendshipStatusEnum.Accepted
            }
        }, {
            returning: {
                id: true,
                status: true,
                client1: {
                    username: true,
                    id: true
                },
                client2: {
                    username: true,
                    id: true
                }
            }
        }]
    }, { operationName: "acceptFriendship" });
    if (response.update_friendship?.returning[0].id) {
        return {
            status: dbResStatus.Ok,
            friendshipStatus: response.update_friendship?.returning[0].status as FriendshipStatus,
            to: response.update_friendship?.returning[0].client1.id === clientId ? response.update_friendship?.returning[0].client2.username as string : response.update_friendship?.returning[0].client1.username as string
        }
    }
    return {
        status: dbResStatus.Error
    }
}

/**
 * 
 * @param id 
 * @param status 
 * @returns 
 */
export const putFriendshipStatus = async (
    clientId: string,
    id: string,
    status: FriendshipStatusEnum
): Promise<{
    status: dbResStatus,
    friendshipStatus?: FriendshipStatus
}> => {
    const response = await chain("mutation")({
        update_friendship: [{
            where: {
                id: { _eq: id },
                _or: [
                    { clientId1: { _eq: clientId } },
                    { clientId2: { _eq: clientId } }
                ]
            },
            _set: {
                status
            }
        }, {
            returning: {
                id: true,
                status: true
            }
        }]
    }, { operationName: "putFriendshipStatus" });
    if (response.update_friendship?.returning[0].id) {
        return {
            status: dbResStatus.Ok,
            friendshipStatus: response.update_friendship?.returning[0].status as FriendshipStatus
        }
    }
    return {
        status: dbResStatus.Error,
    }
}

/**
 * 
 * @param clientId 
 * @param friendshipStatus 
 * @param limit 
 * @param offset 
 * @returns 
 */
export const getFriendships = async (
    clientId: string,
    friendshipStatus: FriendshipStatusEnum,
    limit?: number,
    offset?: number,
): Promise<{
    status: dbResStatus,
    friendships?: FriendshipType[]
}> => {
    const response = await chain("query")({
        friendship: [{
            where: {
                _or: [
                    { clientId1: { _eq: clientId } },
                    { clientId2: { _eq: clientId } }
                ],
                status: { _eq: friendshipStatus }
            },
            limit,
            offset,
            order_by: [{
                updatedAt: order_by.desc
            }]
        }, {
            id: true,
            clientId1: true,
            clientId2: true,
            status: true,
            updatedAt: true,
            createdAt: true
        }]
    }, { operationName: "getFriendships" });
    if (Array.isArray(response.friendship)) {
        return {
            status: dbResStatus.Ok,
            friendships: response.friendship as FriendshipType[]
        }
    }
    return {
        status: dbResStatus.Error
    }
}

export const getAcceptFriendships = async (
    clientId: string,
): Promise<{
    status: dbResStatus,
    friendships?: AcceptFriendship[]
}> => {
    const response = await chain("query")({
        friendship: [{
            where: {
                _or: [
                    { clientId1: { _eq: clientId } },
                    { clientId2: { _eq: clientId } }
                ],
                status: { _eq: FriendshipStatusEnum.Accepted }
            },
            order_by: [{
                updatedAt: order_by.desc
            }],
        }, {
            id: true,
            clientId1: true,
            clientId2: true,
            status: true,
            updatedAt: true,
            createdAt: true,
            chats: [{
                limit: 1,
                order_by: [{
                    updatedAt: order_by.desc,
                    sendAt: order_by.desc
                }],
            }, {
                id: true,
                message: true,
                updatedAt: true,
                friendshipId: true,
                senderId: true,
                sendAt: true,
            }]
        }]
    }, { operationName: "getAcceptFriendships" });
    if (Array.isArray(response.friendship)) {
        return {
            status: dbResStatus.Ok,
            friendships: response.friendship as AcceptFriendship[]
        }
    }
    return {
        status: dbResStatus.Error
    }
}