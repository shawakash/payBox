import { Router } from "express";
import { checkPassword } from "../auth/middleware";
import { SecretValid, dbResStatus, responseStatus } from "@paybox/common";
import { getSecretPhase } from "../db/wallet";

export const walletRouter = Router();

walletRouter.get("/secret", checkPassword, async (req, res) => {
    try {
        //@ts-ignore
        const id = req.id;
        const {walletId} = SecretValid.parse(req.body);

        const query = await getSecretPhase(walletId, id);
        if(query.status == dbResStatus.Error || query.secret == undefined) {
            return res
                .status(503)
                .json({msg: "Database Error", status: responseStatus.Error});
        }
        return res.status(200).json({
            status: responseStatus.Ok,
            secret: query.secret
        });
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({
                status: responseStatus.Error,
                msg: "Internal error",
                error: error,
            });
    }
});