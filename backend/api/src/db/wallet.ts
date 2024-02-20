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