import { Chain } from "@paybox/zeus";
import { dbResStatus, HASURA_ADMIN_SERCRET, HASURA_URL, JWT } from "@paybox/common";
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
    }, {operationName: "getClientId2"});

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
    if(checkFriendshipRes.friendship.length > 0) {
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

/**
 * 
 * @param friendshipId 
 * @returns 
 */
export const acceptFriendship = async (
    friendshipId: string,
): Promise<{
    status: dbResStatus,
    friendshipStatus?: FriendshipStatus
}> => {
    const response = await chain("mutation")({
        update_friendship_by_pk: [{
            _set: {
                status: "accepted"
            },
            pk_columns: {
                id: friendshipId
            }
        }, {
            status: true,
            id: true
        }]
    }, { operationName: "acceptFriendship" });
    if(response.update_friendship_by_pk?.id) {
        return {
            status: dbResStatus.Ok,
            friendshipStatus: response.update_friendship_by_pk.status as FriendshipStatus
        }
    }
    return {
        status: dbResStatus.Error
    }    
}