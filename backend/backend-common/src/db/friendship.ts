import { Chain } from "@paybox/zeus";
import { dbResStatus, HASURA_ADMIN_SERCRET, HASURA_URL, JWT } from "@paybox/common";
import { FriendshipStatus } from "@paybox/common";

const chain = Chain(HASURA_URL, {
    headers: {
        Authorization: `Bearer ${JWT}`,
        "x-hasura-admin-secret": HASURA_ADMIN_SERCRET,
    },
});


export const requestFriendship = async (
    clientId1: string,
    clientId2: string,

): Promise<{
    status: dbResStatus,
    id?: string,
    friendshipStatus?: FriendshipStatus
}> => {
    const response = await chain("mutation")({
        insert_friendship_one: [{
            object: {
                clientId1,
                clientId2
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
    if(response.friendship.length === 0) {
        return {
            status: dbResStatus.Ok,
        }
    }
    if(response.friendship[0].status) {
        return {
            status: dbResStatus.Ok,
            friendshipStatus: response.friendship[0].status as FriendshipStatus
        }
    }
    return {
        status: dbResStatus.Error
    }
}