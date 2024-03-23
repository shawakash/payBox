import { dbResStatus } from "@paybox/common";
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
    const {status, username} = await getUsername(from);
    if(status === dbResStatus.Error || !username) {
        return;
    }

    await notify(
        to,
        `Friend Request`,
        `New Friend request from ${username}`,
        `/popup.html#/notifications?title="Notifications"&props=%7B%7D&nav=tab`,
    );
}