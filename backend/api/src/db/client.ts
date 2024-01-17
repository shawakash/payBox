import { Chain } from "@paybox/zeus";
import { HASURA_URL, JWT } from "../config";
import { dbResStatus, getClientId } from "../types/client";
import { HASURA_ADMIN_SERCRET } from "@paybox/common";

const chain = Chain(HASURA_URL, {
    headers: {
        Authorization: `Bearer ${JWT}`,
        'x-hasura-admin-secret': HASURA_ADMIN_SERCRET,
    },
});

export const createClient = async (
    username: string,
    email: string,
    firstname: string | undefined,
    lastname: string | undefined,
    hashPassword: string,
    mobile?: number
): Promise<{
    id?: unknown,
    chain?: unknown,
    status: dbResStatus,
}> => {
    const response = await chain("mutation")({
        insert_client_one: [{
            object: {
                firstname,
                email,
                username,
                lastname,
                mobile,
                password: hashPassword
            },
        }, {
            id: true,
            chain: {
                bitcoin: true,
                eth: true,
                sol: true,
                usdc: true,
                id: true
            }
        }]
    }, { operationName: "createUser" }
    );

    if (response.insert_client_one?.id) {
        return { ...response.insert_client_one, status: dbResStatus.Ok }
    }
    return {
        status: dbResStatus.Error
    }
};

/**
 * 
 * @param email 
 * @returns Client using mail
 */
export const getClientByEmail = async (
    email: string,
): Promise<{
    status: dbResStatus,
    client?: {
        username?: unknown,
        email?: unknown,
        firstname?: unknown,
        lastname?: unknown,
        mobile?: unknown,
        id?: unknown,
        chain?: unknown,
        password?: unknown
    }[],
}> => {
    const response = await chain("query")({
        client: [{
            where: {
                email: { _eq: email },
            },
            limit: 1
        }, {
            email: true,
            username: true,
            firstname: true,
            lastname: true,
            mobile: true,
            password: true,
            id: true,
            chain: {
                bitcoin: true,
                eth: true,
                sol: true,
                usdc: true,
                id: true
            },
        }]
    }, { operationName: "getClientByEmail" }
    );
    if (response) {
        return {
            ...response,
            status: dbResStatus.Ok
        }
    }
    return {
        status: dbResStatus.Error
    }
}

export const conflictClient = async (
    username: string,
    email: string,
    mobile?: number
): Promise<{
    status: dbResStatus,
    client?: getClientId[]
}> => {
    const response = await chain("query")({
        client: [{
            where: {
                username: { _eq: username },
                email: { _eq: email },
                mobile: { _eq: mobile }
            },
            limit: 1,
        }, {
            id: true,
        }]
    },
        { operationName: "conflictClient" }
    );
    if (response) {
        return {
            ...response,
            status: dbResStatus.Ok
        }
    }
    return {
        status: dbResStatus.Error
    }
}

export const checkClient = async (
    username: string,
    email: string
): Promise<{
    client?: {
        username?: unknown,
        email?: unknown,
        firstname?: unknown,
        lastname?: unknown,
        mobile?: unknown,
        id?: unknown,
        chain?: unknown,
        password?: unknown
    }[],
    status: dbResStatus
}> => {
    const response = await chain("query")({
        client: [{
            where: {
                username: { _eq: username },
                email: { _eq: email }
            },
            limit: 1
        }, {
            email: true,
            username: true,
            firstname: true,
            lastname: true,
            id: true,
            chain: {
                bitcoin: true,
                eth: true,
                sol: true,
                usdc: true,
                id: true
            },
            mobile: true,
            password: true
        }]
    }, {operationName: "checkClient"});
    if (response.client.length) {
        return {
            ...response,
            status: dbResStatus.Ok
        }
    }
    return {
        status: dbResStatus.Error
    }
}

export const getClientMetaData = async (
    username: string
): Promise<{
    client?: {
        username?: unknown,
        email?: unknown,
        firstname?: unknown,
        lastname?: unknown,
        mobile?: unknown,
        id?: unknown,
        chain?: unknown,
    }[],
    status: dbResStatus
}> => {

    const response = await chain("query")({
        client: [{
            where: {
                username: { _like: username }
            },
            limit: 1
        }, {
            email: true,
            username: true,
            firstname: true,
            lastname: true,
            id: true,
            chain: {
                bitcoin: true,
                eth: true,
                sol: true,
                usdc: true,
                id: true
            },
            mobile: true
        }],
    }, { operationName: "getClient" }
    );
    if (response.client[0].id) {
        return {
            ...response,
            status: dbResStatus.Ok
        }
    }
    return {
        status: dbResStatus.Error
    }
};

export const updateMetadata = async (
    id: string,
    firstname: string,
    lastname: string
): Promise<{
    status: dbResStatus
}> => {
    const response = await chain("mutation")({
        update_client: [{
            where: {
                id: { _eq: id }
            },
            _set: {
                firstname,
                lastname
            }
        }, {
            returning: {
                firstname: true,
                lastname: true
            }
        }]
    }, { operationName: "updateMetadata" });
    if (response.update_client) {
        return {
            status: dbResStatus.Ok
        }
    }
    return {
        status: dbResStatus.Error
    }
};

export const getClientById = async (
    id: string
): Promise<{
    user?: {
        username?: unknown,
        email?: unknown,
        firstname?: unknown,
        lastname?: unknown,
        mobile?: unknown,
        id?: unknown,
        trips?: unknown
    }[],
    status: dbResStatus
}> => {
    const response = await chain("query")({
        client: [{
            where: {
                id: { _eq: id }
            },
            limit: 1
        }, {
            id: true,
            email: true,
            username: true,
            lastname: true,
            firstname: true,
            mobile: true,
            chain: {
                bitcoin: true,
                eth: true,
                sol: true,
                usdc: true,
                id: true
            }
        }]
    }, { operationName: "getClientById" });
    if (response.client[0].id) {
        return {
            ...response,
            status: dbResStatus.Ok
        }
    }
    return {
        status: dbResStatus.Error
    }
}

export const deleteClient = async (
    id: string
): Promise<{
    status: dbResStatus
}> => {
    const response = await chain("mutation")({
        delete_client: [{
            where: {
                id: { _eq: id }
            },
        }, {
            returning: {
                username: true
            }
        }]
    }, { operationName: "deleteClient" });

    if (response.delete_client?.returning[0].username) {
        return {
            status: dbResStatus.Ok
        }
    }

    return {
        status: dbResStatus.Error
    }
}



// And continue