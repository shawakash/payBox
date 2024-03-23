import { insertSub } from "@paybox/backend-common";
import { NOTIF_CACHE_EXPIRE, NotifSubType, SubscibeValid, dbResStatus, responseStatus } from "@paybox/common";
import { Router } from "express";
import { Redis } from "..";

export const notifyRouter = Router();

notifyRouter.post('/subscribe', async (req, res) => {
    try {
        //@ts-ignore
        const id = req.id;

        //TODO: check for endpoint, if present return that

        if (id) {
            const { auth, endpoint, expirationTime, p256dh } = SubscibeValid.parse(req.body);
            const { status, id: subId } = await insertSub(auth, endpoint, expirationTime, p256dh, id);
            if (status === dbResStatus.Error || !subId) {
                return res
                    .status(500)
                    .json({ message: "Failed to insert subscription", status: responseStatus.Error })
            }

            await Redis.getRedisInst().notif.cacheNotifSub<NotifSubType>(`notif:${id}`, {
                auth,
                endpoint,
                expirationTime,
                p256dh,
                clientId: id,
                id: subId,
            }, NOTIF_CACHE_EXPIRE);

            return res.status(200).json({
                message: "Notif Subscription inserted",
                status: responseStatus.Ok,
                id: subId
            });

        }
        return res
            .status(500)
            .json({ status: responseStatus.Error, msg: "Jwt error" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: responseStatus.Error,
            msg: "Internal error",
            error: error,
        });
    }
});