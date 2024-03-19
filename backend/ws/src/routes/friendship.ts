import { Router } from "express";
import { RequestFriendshipValid, dbResStatus, responseStatus } from "@paybox/common";
import { requestFriendship } from "@paybox/backend-common";

export const friendshipRouter = Router();

friendshipRouter.post('/request', async (req, res) => {
    try {
        //@ts-ignore
        const id = req.id;

        const { username } = RequestFriendshipValid.parse(req.query);

        const { status, id: friendshipId, friendshipStatus } = await requestFriendship(id, username);
        if (status === dbResStatus.Error || !friendshipId) {
            return res
                .status(503)
                .json({ msg: "Database Error", status: responseStatus.Error });
        }

        return res.status(200).json({
            status: responseStatus.Ok,
            friendshipId,
            friendshipStatus,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: responseStatus.Error,
            msg: "Internal error",
            error: error,
        });
    }
});