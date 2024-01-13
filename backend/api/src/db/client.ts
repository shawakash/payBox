import { Chain } from "@paybox/zeus";
import { HASURA_URL, JWT } from "../config";
import { dbResStatus } from "../types/client";
import { HASURA_ADMIN_SERCRET } from "@paybox/common";

const chain = Chain(HASURA_URL, {
    headers: {
        Authorization: `Bearer ${JWT}`,
        'x-hasura-admin-secret': HASURA_ADMIN_SERCRET,
    },
});

export const createClient = async (): Promise<{
    id?: unknown,
    status: dbResStatus,
}> => {
    const response = await chain("mutation")({
        insert_client_one: [{
            object: {
                address: ["cs"],
                chain: { "dc": "Ds" },
                email: "as",
                firstname: "ds",
                lastname: "ds",
                mobile_number: 0,
                username: "ds"
            }
        }, {
            id: true
        }]
    }, { operationName: "createClient" }
    );
    if (response.insert_client_one?.id) {
        return { ...response.insert_client_one, status: dbResStatus.Ok }
    }
    return {
        status: dbResStatus.Error
    }
}

// And continue