import { Router } from "express";
import {
    CheckFriendshipValid,
    RequestFriendshipValid,
    dbResStatus,
    responseStatus,
    PutStatusValid,
    GetFriendships,
    FriendshipStatusEnum,
    NotifTopics
} from "@paybox/common";
import {
    acceptFriendship,
    checkFriendship,
    getAcceptFriendships,
    getFriendships,
    putFriendshipStatus,
    requestFriendship
} from "@paybox/backend-common";
import { NotifWorker } from "../workers/friendship";

export const friendshipRouter = Router();

friendshipRouter.post('/request', async (req, res) => {
    try {
        //@ts-ignore
        const id = req.id;

        const { username } = RequestFriendshipValid.parse(req.query);

        const { status, id: friendshipId, friendshipStatus, msg } = await requestFriendship(id, username);
        if (status === dbResStatus.Error || !friendshipId) {
            return res
                .status(503)
                .json({ msg: "Database Error", status: responseStatus.Error });
        }

        if (msg) {
            return res
                .status(200)
                .json({
                    status: responseStatus.Ok,
                    friendshipId,
                    friendshipStatus,
                    msg
                });
        }

        await NotifWorker.getInstance().publishOne({
            topic: "notif",
            message: [{
                key: id,
                value: JSON.stringify({
                    from: id,
                    to: username,
                    type: NotifTopics.FriendRequest,
                }),
                partition: 0
            }],

        })

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

friendshipRouter.get('/check', async (req, res) => {
    try {
        //@ts-ignore
        const id = req.id;

        const { friendshipId } = CheckFriendshipValid.parse(req.query);

        const { status, friendshipStatus } = await checkFriendship(friendshipId, id);
        if (status === dbResStatus.Error) {
            return res
                .status(503)
                .json({ msg: "Database Error", status: responseStatus.Error });
        }
        if (!friendshipStatus) {
            return res
                .status(401)
                .json({ msg: "No such friendship", status: responseStatus.Error });
        }

        return res
            .status(200)
            .json({
                status: responseStatus.Ok,
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

friendshipRouter.put('/accept', async (req, res) => {
    try {
        //@ts-ignore
        const id = req.id;

        const { friendshipId } = CheckFriendshipValid.parse(req.query);

        const { status, friendshipStatus, to } = await acceptFriendship(id, friendshipId);
        if (status === dbResStatus.Error) {
            return res
                .status(503)
                .json({ msg: "Database Error", status: responseStatus.Error });
        }

        await NotifWorker.getInstance().publishOne({
            topic: "notif",
            message: [{
                key: id,
                value: JSON.stringify({
                    from: id,
                    to,
                    friendshipId,
                    type: NotifTopics.FriendRequestAccepted,
                }),
                partition: 0
            }],
        })

        return res
            .status(200)
            .json({
                status: responseStatus.Ok,
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

friendshipRouter.put('/', async (req, res) => {
    try {
        //@ts-ignore
        const id = req.id;

        const { friendshipId, friendshipStatus } = PutStatusValid.parse(req.query);
        const query = await putFriendshipStatus(id, friendshipId, friendshipStatus);
        if (query.status === dbResStatus.Error) {
            return res
                .status(503)
                .json({ msg: "Database Error", status: responseStatus.Error });
        }

        if(query.friendshipStatus === FriendshipStatusEnum.Rejected) {
            await NotifWorker.getInstance().publishOne({
                topic: "notif",
                message: [{
                    key: id,
                    value: JSON.stringify({
                        from: id,
                        to: query.to,
                        friendshipId,
                        type: NotifTopics.FriendRequestRejected,
                    }),
                    partition: 0
                }],
    
            })
        }

        return res
            .status(200)
            .json({
                status: responseStatus.Ok,
                friendshipStatus: query.friendshipStatus,
                id: friendshipId,
                msg: "Friendship status updated",
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


friendshipRouter.get('/', async (req, res) => {
    try {
        //@ts-ignore
        const id = req.id;

        const { friendshipStatus } = GetFriendships.parse(req.query);
        const { status, friendships } = await getFriendships(id, friendshipStatus);
        if (status === dbResStatus.Error) {
            return res
                .status(503)
                .json({ msg: "Database Error", status: responseStatus.Error });
        }

        // TODO: CACHE
        return res
            .status(200)
            .json({
                status: responseStatus.Ok,
                friendships,
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


friendshipRouter.get('/accept', async (req, res) => {
    try {
        //@ts-ignore
        const id = req.id;

        const { status, friendships } = await getAcceptFriendships(id);
        if (status === dbResStatus.Error) {
            return res
                .status(503)
                .json({ msg: "Database Error", status: responseStatus.Error });
        }

        // TODO: CACHE
        return res
            .status(200)
            .json({
                status: responseStatus.Ok,
                friendships,
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