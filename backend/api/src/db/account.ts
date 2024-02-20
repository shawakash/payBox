import { Chain } from "@paybox/zeus";
import { HASURA_URL, JWT } from "../config";
import { dbResStatus, getClientId } from "../types/client";
import { AccountType, HASURA_ADMIN_SERCRET, Network, WalletKeys } from "@paybox/common";


const chain = Chain(HASURA_URL, {
    headers: {
        Authorization: `Bearer ${JWT}`,
        "x-hasura-admin-secret": HASURA_ADMIN_SERCRET,
    },
});


/**
 * 
 * @param clientId 
 * @param walletId 
 * @param name 
 * @param solKeys 
 * @param ethKeys 
 * @returns Promise<{
    status: dbResStatus,
    id?: string
}>
 */
export const createAccount = async (
    clientId: string,
    walletId: string,
    name: string,
    solKeys: WalletKeys,
    ethKeys: WalletKeys,
): Promise<{
    status: dbResStatus,
    id?: string
}> => {
    const response = await chain("mutation")({
        insert_account_one: [{
            object: {
                clientId,
                walletId,
                name,
                sol: {
                    data: {
                        publicKey: solKeys.publicKey,
                        privateKey: solKeys.privateKey
                    }
                },
                eth: {
                    data: {
                        publicKey: ethKeys.publicKey,
                        privateKey: ethKeys.privateKey
                    }
                }
            }
        }, {
            id: true
        }]
    }, { operationName: "createAccount" });
    if (response.insert_account_one?.id) {
        return {
            status: dbResStatus.Ok,
            id: response.insert_account_one.id as string
        }
    }
    return {
        status: dbResStatus.Error
    }
}

/**
 * 
 * @param name 
 * @param id 
 * @returns 
 */
export const updateAccountName = async (
    name: string,
    id: string
): Promise<{
    status: dbResStatus,
    account?: AccountType
}> => {
    const response = await chain("mutation")({
        update_account: [{
            where: {
                id: {_eq: id}
            },
            _set: {
                name
            }
        }, {
            returning: {
                id: true,
                clientId: true,
                name: true,
                walletId: true,
                sol: {
                    publicKey: true,
                    privateKey: true
                },
                eth: {
                    publicKey: true,
                    privateKey: true
                },
                bitcoin: {
                    publicKey: true,
                    privateKey: true
                },
            }
        }]
    }, {operationName: "updateName"});
    if(response.update_account?.returning[0]?.id) {
        return {
            status: dbResStatus.Ok,
            account: {
                id: response.update_account?.returning[0]?.id as string,
                clientId: response.update_account?.returning[0]?.clientId as string,
                name: response.update_account?.returning[0]?.name as string,
                walletId: response.update_account?.returning[0]?.walletId as string,
                sol: response.update_account?.returning[0]?.sol as WalletKeys,
                eth: response.update_account?.returning[0]?.eth as WalletKeys,
                bitcoin: response.update_account?.returning[0]?.bitcoin as WalletKeys,
            }
        }
    }
    return {
        status: dbResStatus.Error
    }    
}

/**
 * 
 * @param accountId 
 * @param network 
 * @returns 
 */
export const getPrivate = async (
    accountId: string,
    network: Network
): Promise<{
    status: dbResStatus,
    privateKey?: string
}> => {
    const returning = {
        [network]: {
            privateKey: true
        }
    }
    const response = await chain("query")({
        account: [{
            where: {
                id: {_eq: accountId}
            }           
        }, returning], 
    }, {operationName: "getPrivate"});
    //@ts-ignore
    if(response.account[0][network]?.privateKey) {
        return {
            status: dbResStatus.Ok,
            //@ts-ignore
            privateKey: response.account[0][network]?.privateKey
        }
    }
    return {
        status: dbResStatus.Error
    }
}

/**
 * Remove Account
 * 
 * @param accountId 
 * @returns 
 */

// Delete the sol eth and bitcoin first before deleting the account
export const deleteAccount = async (
    accountId: string
): Promise<{
    status: dbResStatus
}> => {
    const response = await chain("mutation")({
        delete_account: [{
            where: {
                id: {_eq: accountId},
                eth: {
                    accountId: {_eq: accountId}
                },
                sol: {
                    accountId: {_eq: accountId}
                },
                bitcoin: {
                    accountId: {_eq: accountId}
                }
            }
        }, {
            returning: {
                walletId: true
            }
        }]
    }, {operationName: "deleteAccount"});
    if(Array.isArray(response.delete_account?.returning)) {
        return {
            status: dbResStatus.Ok
        }
    }
    return {
        status: dbResStatus.Error
    }    
}