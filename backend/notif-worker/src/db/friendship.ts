import { Chain } from "@paybox/zeus";
import { HASURA_URL, JWT } from "../config";
import { HASURA_ADMIN_SERCRET, NotifSubType, dbResStatus } from "@paybox/common";

const chain = Chain(HASURA_URL, {
    headers: {
        Authorization: `Bearer ${JWT}`,
        "x-hasura-admin-secret": HASURA_ADMIN_SERCRET,
    },
});


/**
 * 
 * @param to 
 * @param fromUuid 
 * @returns 
 */
export const getClientFriendship = async (
    to: string,
    fromUuid: string
): Promise<{
    status: dbResStatus,
    fromUsername?: string;
    friendshipId?: string;
}> => {

    const friendship = await chain("query")({
        client: [{
            limit: 1,
            where: {
                id: { _eq: fromUuid }
            }
        }, {
            username: true,
            friendships: [{
                limit: 1,
                where: {
                    _or: [
                        {
                            client1: {
                                username: { _eq: to }
                            },
                            clientId2: { _eq: fromUuid }
                        },
                        {
                            client2: {
                                username: { _eq: to }
                            },
                            clientId1: { _eq: fromUuid }
                        }
                    ]
                }
            }, {
                id: true,
                status: true
            }]
        }]
    }, { operationName: "getFriendship" });
    if (Array.isArray(friendship.client) && friendship.client[0].friendships) {
        return {
            status: dbResStatus.Ok,
            fromUsername: friendship.client[0].username as string,
            friendshipId: friendship.client[0].friendships[0].id as string
        }
    }

    return {
        status: dbResStatus.Error
    }
}