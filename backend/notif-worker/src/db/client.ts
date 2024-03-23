import { Chain } from "@paybox/zeus";
import { HASURA_URL, JWT } from "../config";
import { HASURA_ADMIN_SERCRET, NotifSubType, dbResStatus } from "@paybox/common";

const chain = Chain(HASURA_URL, {
    headers: {
        Authorization: `Bearer ${JWT}`,
        "x-hasura-admin-secret": HASURA_ADMIN_SERCRET,
    },
});


export const getUsername = async (
    id: string
): Promise<{
    status: dbResStatus;
    username?: string;
}> => {
    const response = await chain("query")({
        client: [{
            where: {
                id: { _eq: id }
            }
        }, {
            username: true
        }]
    }, { operationName: "getUsername" });
    if (Array.isArray(response.client)) {
        return {
            status: dbResStatus.Ok,
            username: response.client[0].username as string
        }
    }
    return {
        status: dbResStatus.Error
    }
};