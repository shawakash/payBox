import { NotifTopics, dbResStatus } from "@paybox/common";
import { getClientFriendship } from "./db/friendship";
import { getUsername } from "./db/client";
import { notify } from "./notifier";
import { getTxnDetails } from "./db/txn";

/**
 * 
 * @param to 
 * @param from 
 * @returns 
 */
export const notifyFriendRequest = async (
    to: string,
    from: string
) => {
    const { status, fromUsername, friendshipId } = await getClientFriendship(to, from);
    // con
    if (status === dbResStatus.Error || !fromUsername) {
        return;
    }

    await notify({
        to,
        body: `Friend Request from ${fromUsername}`,
        title: `Friend Request`,
        href: `/popup.html#/notifications?title="Notifications"&props=%7B%7D&nav=tab`,
        actions: [
            {
                action: 'accept',
                type: 'button',
                title: '👍 Accept Request',
            },
        ],
        image: "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg?size=338&ext=jpg&ga=GA1.1.735520172.1711238400&semt=ais",
        tag: NotifTopics.FriendRequest,
        vibrate: [200, 100, 200],
        payload: {
            friendshipId
        }
    });
};

/**
 * 
 * @param to 
 * @param from 
 * @param friendshipId 
 * @returns 
 */
export const notifyFriendRequestAccepted = async (
    to: string,
    from: string,
    friendshipId: string
) => {
    const { status, username } = await getUsername(from);
    if (status === dbResStatus.Error || !username) {
        return;
    }

    await notify({
        to,
        body: `Friend Request Accepted by ${username}`,
        title: `Friend Request Accepted`,
        href: `/popup.html#/notifications?title="Notifications"&props=%7B%7D&nav=tab`,
        image: "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg?size=338&ext=jpg&ga=GA1.1.735520172.1711238400&semt=ais",
        tag: NotifTopics.FriendRequestAccepted,
        vibrate: [200, 100, 200],
        payload: {
            friendshipId
        }
    });
}

/**
 * 
 * @param to 
 * @param from 
 * @param friendshipId 
 * @returns 
 */
export const notifyFriendRequestRejected = async (
    to: string,
    from: string,
    friendshipId: string
) => {
    const { status, username } = await getUsername(from);
    if (status === dbResStatus.Error || !username) {
        return;
    }

    await notify({
        to,
        body: `Friend Request Rejected by ${username}`,
        title: `Friend Request Rejected`,
        href: `/popup.html#/notifications?title="Notifications"&props=%7B%7D&nav=tab`,
        image: "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg?size=338&ext=jpg&ga=GA1.1.735520172.1711238400&semt=ais",
        tag: NotifTopics.FriendRequestRejected,
        vibrate: [200, 100, 200],
        payload: {
            friendshipId
        }
    });
}

/**
 * 
 * @param to 
 * @param from 
 * @param txnId 
 * @returns 
 */
export const notifyReceiveTxn = async (
    to: string,
    from: string,
    txnId: string
) => {
    const { status, username } = await getUsername(from);
    if (status === dbResStatus.Error || !username) {
        return;
    }

    const { amount, network, status: txnDetailsStatus } = await getTxnDetails(txnId, to);
    if (txnDetailsStatus === dbResStatus.Error || !amount || !network) {
        return;
    }

    await notify({
        to,
        body: `Received ${amount} ${network} from ${username}`,
        title: `Transaction Received`,
        href: getTxnHref(txnId),
        image: "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg?size=338&ext=jpg&ga=GA1.1.735520172.1711238400&semt=ais",
        tag: NotifTopics.TxnAccept,
        vibrate: [200, 100, 200],
        payload: {
            txnId
        }
    });
}

const getTxnHref = (txnId?: string,) => {
    if (!txnId) {
        return undefined;
    }
    return `/popup.html#/txn?props=%7B"id"%3A"${txnId}`;
};

/**
 * 
 * @param notifyTo 
 * @param paidTo 
 * @param txnId 
 * @returns 
 */
export const notifyPaid = async (
    notifyTo: string,
    paidTo: string,
    txnId: string
) => {
    const { status, username } = await getUsername(paidTo);
    if (status === dbResStatus.Error || !username) {
        return;
    }

    const { amount, network, status: txnDetailsStatus } = await getTxnDetails(txnId);
    if (txnDetailsStatus === dbResStatus.Error || !amount || !network) {
        return;
    }

    await notify({
        to: notifyTo,
        body: `Paid ${amount} ${network} to ${username}`,
        title: `Transaction Paid`,
        href: getTxnHref(txnId),
        image: "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg?size=338&ext=jpg&ga=GA1.1.735520172.1711238400&semt=ais",
        tag: NotifTopics.Paid,
        vibrate: [200, 100, 200],
        payload: {
            txnId
        }
    });
}