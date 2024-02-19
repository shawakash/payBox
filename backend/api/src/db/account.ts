import { Chain } from "@paybox/zeus";
import { HASURA_URL, JWT } from "../config";
import { dbResStatus, getClientId } from "../types/client";
import { HASURA_ADMIN_SERCRET, WalletKeys } from "@paybox/common";


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