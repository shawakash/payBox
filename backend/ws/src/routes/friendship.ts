import { Router } from "express";
import {
    CheckFriendshipValid,
    RequestFriendshipValid,
    dbResStatus,
    responseStatus,
    PutStatusValid,
    GetFriendships
} from "@paybox/common";
import {
    acceptFriendship,
    checkFriendship,
    getFriendships,
    putFriendshipStatus,
    requestFriendship
} from "@paybox/backend-common";

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

        // TODO: send notification to client with username
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

        const { status, friendshipStatus } = await acceptFriendship(id, friendshipId);
        if (status === dbResStatus.Error) {
            return res
                .status(503)
                .json({ msg: "Database Error", status: responseStatus.Error });
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
