import { Chain } from "@paybox/zeus";
import { HASURA_URL, JWT } from "../config";
import { dbResStatus, getClientId } from "../types/client";
import { Address, HASURA_ADMIN_SERCRET } from "@paybox/common";

const chain = Chain(HASURA_URL, {
    headers: {
        Authorization: `Bearer ${JWT}`,
        'x-hasura-admin-secret': HASURA_ADMIN_SERCRET,
    },
});

/**
 * 
 * @param eth 
 * @param sol 
 * @param clientId 
 * @param bitcoin 
 * @param usdc 
 * @returns The created address table row
 */
export const createAddress = async (
    eth: string,
    sol: string,
    clientId: string,
    bitcoin?: string,
    usdc?: string
): Promise<{
    status: dbResStatus,
    id?: unknown
}> => {
    const response = await chain("mutation")({
        insert_address_one: [{
            object: {
                eth,
                sol,
                bitcoin,
                usdc,
                client_id: clientId
            },
        }, {
            id: true
        }]
    }, { operationName: "createChain" });
    if (response.insert_address_one?.id) {
        return { ...response.insert_address_one, status: dbResStatus.Ok }
    }
    return {
        status: dbResStatus.Error
    }
};

/**
 * 
 * @param eth 
 * @param sol 
 * @param clientId 
 * @param bitcoin 
 * @param usdc 
 * @returns checks for conflciting adderss
 */
export const conflictAddress = async (
    eth: string,
    sol: string,
    clientId: string,
    bitcoin?: string,
    usdc?: string
): Promise<{
    status: dbResStatus,
    chain?: Address[]
}> => {
    const response = await chain("query")({
        address: [{
            where: {
                _or: [
                    { eth: { _eq: eth } },
                    { sol: { _eq: sol } }
                ]
            },
        }, {
            id: true
        }]
    }, { operationName: "conflictAddress" });
    if (response) {
        return {
            ...response,
            status: dbResStatus.Ok
        }
    }
    return {
        status: dbResStatus.Error
    }
};

/**
 * 
 * @param client_id 
 * @returns Address for the given client id
 */
export const getAddressByClientId = async (
    client_id: string
): Promise<{
    status: dbResStatus,
    address?: {
        bitcoin?: unknown,
        eth?: unknown,
        sol?: unknown,
        usdc?: unknown,
        id?: unknown
    }[]
}> => {
    const response = await chain("query")({
        address: [{
            where: {
                client_id: { _eq: client_id }
            },
            limit: 1
        }, {
            bitcoin: true,
            eth: true,
            usdc: true,
            sol: true,
            id: true,
        }]
    }, { operationName: "getAddressByClientId" });
    if (response.address[0].id) {
        return {
            ...response,
            status: dbResStatus.Ok,
        }
    }
    return {
        status: dbResStatus.Error
    }
};

/**
 * 
 * @param id 
 * @returns updates the address
 */
export const updateAddress = async (
    eth: string,
    sol: string,
    clientId: string,
    bitcoin?: string,
    usdc?: string
): Promise<{
    status: dbResStatus,
    id?: unknown
}> => {
    const response = await chain("mutation")({
        update_address: [{
            where: {
                client_id: { _eq: clientId }
            },
            _set: {
                bitcoin,
                eth,
                sol,
                usdc
            }
        }, {
            returning: {
                id: true
            }
        }]
    });
    if (response.update_address?.returning) {
        return {
            status: dbResStatus.Ok,
            ...response.update_address?.returning
        }
    }
    return {
        status: dbResStatus.Error
    }
}