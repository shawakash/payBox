import { Router } from "express";
import { dbResStatus, getChatsQueryValid, responseStatus } from "@paybox/common";
import { getChats } from "@paybox/backend-common";

export const chatRouter = Router();

chatRouter.get('/', async (req, res) => {
    try {
        //@ts-ignore
        const id = req.id;
        const { friendshipId } = getChatsQueryValid.parse(req.query);

        // query the db
        const { status, chats } = await getChats(friendshipId);
        if (status == dbResStatus.Error) {
            return res
                .status(503)
                .json({ msg: "Database Error", status: responseStatus.Error });
        }

        return res
            .status(200)
            .json({
                status: responseStatus.Ok,
                chats
            });

    } catch (error) {

    }
});