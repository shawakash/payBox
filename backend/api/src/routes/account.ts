import { AccountCreateQuery, AccountNameQuery, dbResStatus, responseStatus } from "@paybox/common";
import { Router } from "express";
import { SolOps } from "../sockets/sol";
import { EthOps } from "../sockets/eth";
import { createAccount, updateAccountName } from "../db/account";
import { cache } from "..";

export const accountRouter = Router();

accountRouter.post("/", async (req, res) => {
    try {
        //@ts-ignore
        const id = req.id;
        if (id) {
            const { name, walletId } = AccountCreateQuery.parse(req.query);
            /**
             * Create an public and private key
             */
            const solKeys = (new SolOps()).createWallet();
            const ethKeys = (new EthOps()).createWallet();
            const mutation = await createAccount(id, walletId, name, solKeys, ethKeys);
            if (mutation.status == dbResStatus.Error || mutation.id == undefined) {
                return res
                    .status(503)
                    .json({ msg: "Database Error", status: responseStatus.Error });
            }
            console.log(mutation);

            /**
             * Cache
             */
            await cache.cacheAccount(mutation.id, {
                clientId: id,
                walletId,
                name,
                id: mutation.id,
                sol: solKeys,
                eth: ethKeys,
            });

            return res.status(200).json({
                account: {
                    clientId: id,
                    name,
                    walletId,
                    id: mutation.id,
                    sol: solKeys,
                    eth: ethKeys,
                },
                status: responseStatus.Ok
            });


        }
        return res
            .status(500)
            .json({ status: responseStatus.Error, msg: "Jwt error" });
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

accountRouter.patch('/updateName', async (req, res) => {
    try {
        //@ts-ignore
        const id = req.id;
        if(id) {
            const {name, accountId} = AccountNameQuery.parse(req.query);
            const mutation = await updateAccountName(name, accountId);
            if (mutation.status == dbResStatus.Error || mutation.account == undefined) {
                return res
                    .status(503)
                    .json({ msg: "Database Error", status: responseStatus.Error });
            }

            /**
             * Cache
             */
            await cache.cacheAccount(mutation.account.id, mutation.account);

            return res.status(200).json({
                msg: "Name updated 😊",
                status: responseStatus.Ok
            });
        }
        return res
            .status(500)
            .json({ status: responseStatus.Error, msg: "Jwt error" });
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