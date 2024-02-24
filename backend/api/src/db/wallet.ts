import { Chain } from "@paybox/zeus";
import { HASURA_URL, JWT } from "../config";
import { dbResStatus, getClientId } from "../types/client";
import { AccountType, BitcoinKey, EthKey, HASURA_ADMIN_SERCRET, Network, SolKey, WalletKeys } from "@paybox/common";
import { accounts } from "web3/lib/commonjs/eth.exports";


const chain = Chain(HASURA_URL, {
    headers: {
        Authorization: `Bearer ${JWT}`,
        "x-hasura-admin-secret": HASURA_ADMIN_SERCRET,
    },
});


/**
 * 
 * @param walletId 
 * @param clientId 
 * @returns 
 */
export const getSecretPhase = async (
    walletId: string,
    clientId: string,
): Promise<{
    status: dbResStatus,
    secret?: string
}> => {
    const response = await chain("query")({
        wallet: [{
            limit: 1,
            where: {
                id: { _eq: walletId },
                clientId: { _eq: clientId }
            }
        }, {
            secretPhase: true
        }]
    });
    if (response.wallet[0].secretPhase) {
        return {
            status: dbResStatus.Ok,
            secret: response.wallet[0].secretPhase as string
        }
    }
    return {
        status: dbResStatus.Error
    }
};

/**
 * 
 * @param walletId 
 * @returns 
 */
export const getAccounts = async (
    walletId: string,
): Promise<{
    status: dbResStatus,
    accounts?: AccountType[]
}> => {
    const response = await chain("query")({
        account: [{
            where: {
                walletId: { _eq: walletId }
            },
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
    }, { operationName: "getAccounts" });
    if (response.account[0].id) {
        return {
            status: dbResStatus.Ok,
            accounts: response.account as AccountType[]
        }
    }
    return {
        status: dbResStatus.Error
    }
}

/**
 * 
 * @param walletId 
 * @param clientId 
 * @returns 
 */
export const delWallet = async (
    walletId: string,
    clientId: string
): Promise<{
    status: dbResStatus,
}> => {
    const response = await chain("mutation")({
        delete_wallet: [{
            where: {
                id: { _eq: walletId },
                clientId: { _eq: clientId },
                accounts: {
                    walletId: { _eq: walletId },
                    sol: {
                        account: {
                            walletId: { _eq: walletId }
                        }
                    },
                    eth: {
                        account: {
                            walletId: { _eq: walletId }
                        }
                    },
                }
            }
        }, {
            returning: {

            }
        }]
    });
    if (Array.isArray(response.delete_wallet?.returning)) {
        return {
            status: dbResStatus.Ok
        }
    }
    return {
        status: dbResStatus.Error
    }
}

export const createWallet = async (
    clientId: string,
    secretPhase: string,
    name: string,
    solKeys: WalletKeys,
    ethKeys: WalletKeys,
): Promise<{
    status: dbResStatus,
    id?: string
}> => {
    const response = await chain("mutation")({
        insert_wallet_one: [{
            object: {
                clientId,
                secretPhase,
                accounts: {
                    data: [{
                        name,
                        sol: {
                            data: solKeys
                        },
                        eth: {
                            data: ethKeys
                        },
                        clientId
                    }]
                }               
            }
        }, {
            id: true
        }]
    });
    if(response.insert_wallet_one?.id) {
        return {
            status: dbResStatus.Ok,
            id: response.insert_wallet_one.id as string
        }
    }
    return {
        status: dbResStatus.Error,
    }
}