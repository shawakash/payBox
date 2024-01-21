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
export const createAddress = async(
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
                    {eth: {_eq: eth}},
                    {sol: {_eq: sol}}
                ]
            },
        }, {
            id: true
        }]
    }, {operationName: "conflictAddress"});
    if(response) {
        return {
            ...response,
            status: dbResStatus.Ok
        }
    }
    return {
        status: dbResStatus.Error
    }
}