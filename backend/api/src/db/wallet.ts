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
                id: {_eq: walletId},
                clientId: {_eq: clientId}
            }
        }, {
            secretPhase: true
        }]
    });
    if(response.wallet[0].secretPhase) {
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
                walletId: {_eq: walletId}
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
    }, {operationName: "getAccounts"});
    if(response.account[0].id) {
        return {
            status: dbResStatus.Ok,
            accounts: response.account as AccountType[]
        }
    }
    return {
        status: dbResStatus.Error
    }
}