import { Chain } from "@paybox/zeus";
import { HASURA_URL, JWT } from "../config";
import { dbResStatus, getClientId } from "../types/client";
import { AccountType, BitcoinKey, EthKey, HASURA_ADMIN_SERCRET, Network, SolKey, WalletKeys } from "@paybox/common";


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
    account?: AccountType
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
            id: true,
            eth: {
                publicKey: true,
                goerliEth: true,
                kovanEth: true,
                mainnetEth: true,
                rinkebyEth: true,
                ropstenEth: true,
                sepoliaEth: true,
            },
            sol: {
                publicKey: true,
                devnetSol: true,
                mainnetSol: true,
                testnetSol: true,
            },
            walletId: true,
            bitcoin: {
                publicKey: true,
                mainnetBtc: true,
                regtestBtc: true,
                textnetBtc: true,
            },
            name: true,
            clientId: true
        }]
    }, { operationName: "createAccount" });
    if (response.insert_account_one?.id) {
        return {
            status: dbResStatus.Ok,
            account: response.insert_account_one as AccountType
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
                id: { _eq: id }
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
                eth: {
                    publicKey: true,
                    goerliEth: true,
                    kovanEth: true,
                    mainnetEth: true,
                    rinkebyEth: true,
                    ropstenEth: true,
                    sepoliaEth: true,
                },
                sol: {
                    publicKey: true,
                    devnetSol: true,
                    mainnetSol: true,
                    testnetSol: true,
                },
                bitcoin: {
                    publicKey: true,
                    mainnetBtc: true,
                    regtestBtc: true,
                    textnetBtc: true,
                },
            }
        }]
    }, { operationName: "updateName" });
    if (response.update_account?.returning[0]?.id) {
        return {
            status: dbResStatus.Ok,
            account: response.update_account.returning[0] as AccountType
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
                id: { _eq: accountId }
            }
        }, returning],
    }, { operationName: "getPrivate" });
    //@ts-ignore
    if (response.account[0][network]?.privateKey) {
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
                id: { _eq: accountId },
                eth: {
                    accountId: { _eq: accountId }
                },
                sol: {
                    accountId: { _eq: accountId }
                },
                bitcoin: {
                    accountId: { _eq: accountId }
                }
            }
        }, {
            returning: {
                walletId: true
            }
        }]
    }, { operationName: "deleteAccount" });
    if (Array.isArray(response.delete_account?.returning)) {
        return {
            status: dbResStatus.Ok
        }
    }
    return {
        status: dbResStatus.Error
    }
}

/**
 * 
 * @param accountId 
 * @returns 
 */
export const getAccount = async (
    accountId: string
): Promise<{
    status: dbResStatus,
    account?: AccountType
}> => {
    const response = await chain("query")({
        account: [{
            limit: 1,
            where: {
                id: { _eq: accountId }
            }
        }, {
            id: true,
            eth: {
                publicKey: true,
                goerliEth: true,
                kovanEth: true,
                mainnetEth: true,
                rinkebyEth: true,
                ropstenEth: true,
                sepoliaEth: true,
            },
            sol: {
                publicKey: true,
                devnetSol: true,
                mainnetSol: true,
                testnetSol: true,
            },
            walletId: true,
            bitcoin: {
                publicKey: true,
                mainnetBtc: true,
                regtestBtc: true,
                textnetBtc: true,
            },
            name: true,
            clientId: true
        }]
    }, { operationName: "getAccount" });
    if (response.account[0].id) {
        return {
            status: dbResStatus.Ok,
            account: response.account[0] as AccountType
        }
    }
    return {
        status: dbResStatus.Error
    }
}

/**
 * 
 * @param clientId 
 * @param walletId 
 * @param network 
 * @param name 
 * @param keys 
 * @returns 
 */
export const importAccount = async (
    clientId: string,
    walletId: string,
    network: Network,
    name: string,
    keys: WalletKeys,
): Promise<{
    status: dbResStatus,
    account?: AccountType
}> => {
    const response = await chain("mutation")({
        insert_account_one: [{
            object: {
                clientId,
                walletId,
                name,
                [network]: {
                    data: keys
                }
            }
        }, {
            id: true,
            eth: {
                publicKey: true,
                goerliEth: true,
                kovanEth: true,
                mainnetEth: true,
                rinkebyEth: true,
                ropstenEth: true,
                sepoliaEth: true,
            },
            sol: {
                publicKey: true,
                devnetSol: true,
                mainnetSol: true,
                testnetSol: true,
            },
            walletId: true,
            bitcoin: {
                publicKey: true,
                mainnetBtc: true,
                regtestBtc: true,
                textnetBtc: true,
            },
            name: true,
            clientId: true
        }]
    }, { operationName: "importAccountSecret" });
    if (response.insert_account_one?.id) {
        return {
            status: dbResStatus.Ok,
            account: response.insert_account_one as AccountType
        }
    }
    return {
        status: dbResStatus.Error
    }
}

/**
 * 
 * @param clientId 
 * @param walletId 
 * @param name 
 * @param keys 
 * @returns 
 */
export const addAccountPhrase = async (
    clientId: string,
    walletId: string,
    name: string,
    keys: (WalletKeys & { network: Network })[]
): Promise<{
    status: dbResStatus,
    account?: AccountType
}> => {
    let solKeys = keys.filter(({ network }) => network == Network.Sol);
    let ethKeys = keys.filter(({ network }) => network == Network.Eth);
    let solData = {}
    let ethData = {}
    if(solKeys.length > 0) {
        solData = {privateKey: solKeys[0].privateKey, publicKey: solKeys[0].publicKey}
    }
    if(ethKeys.length == 0) {
        ethData = {privateKey: ethKeys[0].privateKey, publicKey: ethKeys[0].publicKey}
    }
    const response = await chain("mutation")({
        insert_account_one: [{
            object: {
                clientId,
                name,
                walletId,
                sol: {
                    data: solData
                },
                eth: {
                    data: ethData
                }
            }
        }, {
            id: true,
            eth: {
                publicKey: true,
                goerliEth: true,
                kovanEth: true,
                mainnetEth: true,
                rinkebyEth: true,
                ropstenEth: true,
                sepoliaEth: true,
            },
            sol: {
                publicKey: true,
                devnetSol: true,
                mainnetSol: true,
                testnetSol: true,
            },
            walletId: true,
            bitcoin: {
                publicKey: true,
                mainnetBtc: true,
                regtestBtc: true,
                textnetBtc: true,
            },
            name: true,
            clientId: true
        }]
    }, {operationName: "addAccountPhrase"});
    if (response.insert_account_one?.id) {
        return {
            status: dbResStatus.Ok,
            account: response.insert_account_one as AccountType
        }
    }
    return {
        status: dbResStatus.Error
    }
}