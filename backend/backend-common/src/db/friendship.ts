import {Chain} from "@paybox/zeus";
import {dbResStatus, HASURA_ADMIN_SERCRET, HASURA_URL, JWT} from "@paybox/common";
import {FriendshipStatus} from "@paybox/common/src";

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
    }, {operationName: "requestFriendship"});
    if(response.insert_friendship_one?.id) {
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