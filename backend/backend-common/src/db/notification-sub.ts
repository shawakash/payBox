import { Chain } from "@paybox/zeus";
import { HASURA_URL, JWT } from "../config";
import { Address, HASURA_ADMIN_SERCRET, dbResStatus } from "@paybox/common";

const chain = Chain(HASURA_URL, {
    headers: {
        Authorization: `Bearer ${JWT}`,
        "x-hasura-admin-secret": HASURA_ADMIN_SERCRET,
    },
});

/**
 * 
 * @param auth 
 * @param endpoint 
 * @param expirationTime 
 * @param p256dh 
 * @param clientId 
 * @returns 
 */
export const insertSub = async (
    auth: string,
    endpoint: string,
    expirationTime: string | null,
    p256dh: string,
    clientId: string,
): Promise<{
    status: dbResStatus;
    id?: string;
}> => {

    const response = await chain("mutation")({
        insert_notification_subscription_one: [{
            object: {
                auth,
                endpoint,
                expirationTime,
                p256dh,
                clientId,
            }
        }, {
            id: true
        }]
    }, { operationName: "insertSub" });
    if (response.insert_notification_subscription_one?.id) {
        return {
            status: dbResStatus.Ok,
            id: response.insert_notification_subscription_one.id as string
        }
    }
    return {
        status: dbResStatus.Error,
    }
}