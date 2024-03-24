import { NotifTopics, dbResStatus } from "@paybox/common";
import { getClientFriendship } from "./db/friendship";
import { getUsername } from "./db/client";
import { notify } from "./notifier";

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