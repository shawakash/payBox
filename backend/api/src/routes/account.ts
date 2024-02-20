import { AccountCreateQuery, AccountDelete, AccountGetPrivateKey, AccountGetQuery, AccountNameQuery, dbResStatus, responseStatus, AccountType } from "@paybox/common";
import { Router } from "express";
import { SolOps } from "../sockets/sol";
import { EthOps } from "../sockets/eth";
import { createAccount, deleteAccount, getPrivate, updateAccountName, getAccount } from "../db/account";
import { cache } from "..";
import { validatePassword } from "../auth/util";
import { getPassword } from "../db/client";
import { checkPassword } from "../auth/middleware";

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
            if (mutation.status == dbResStatus.Error || mutation.account == undefined) {
                return res
                    .status(503)
                    .json({ msg: "Database Error", status: responseStatus.Error });
            }
            console.log(mutation);

            /**
             * Cache
             */
            await cache.cacheAccount(mutation.account.id, mutation.account);

            return res.status(200).json({
                account: mutation.account,
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
        if (id) {
            const { name, accountId } = AccountNameQuery.parse(req.query);
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

accountRouter.post('/privateKey', checkPassword, async (req, res) => {
    try {
        //@ts-ignore
        const id = req.id;
        if (id) {
            const { network, accountId } = AccountGetPrivateKey.parse(req.body);

            const query = await getPrivate(accountId, network);
            if (query.status == dbResStatus.Error || query.privateKey == undefined) {
                return res
                    .status(503)
                    .json({ msg: "Database Error", status: responseStatus.Error });
            }
            return res.status(200).json({
                status: responseStatus.Ok,
                privateKey: query.privateKey
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

accountRouter.delete('/', async (req, res) => {
    try {
        //@ts-ignore
        const id = req.id;
        if (id) {
            const { accountId } = AccountDelete.parse(req.query);
            const mutation = await deleteAccount(accountId);
            if (mutation.status == dbResStatus.Error) {
                return res
                    .status(503)
                    .json({ msg: "Database Error", status: responseStatus.Error });
            }
            
            //Cache delete
            await cache.deleteHash(accountId);

            return res
                .status(200)
                .json({
                    msg: "Account deleted",
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

accountRouter.get('/', async (req, res) => {
    try {
        //@ts-ignore
        const id = req.id;
        if(id) {
            const {accountId} = AccountGetQuery.parse(req.query);

            /**
             * Cache
             */
            const account = await cache.getAccount(accountId);
            if(account?.id) {
                return res
                    .status(200)
                    .json({
                        account,
                        status: responseStatus.Ok
                    });
            }

            const query = await getAccount(accountId);
            if(query.status == dbResStatus.Error || query.account == undefined) {
                return res
                    .status(503)
                    .json({ msg: "Database Error", status: responseStatus.Error });
            }

            /**
             * Cache
             */
            await cache.cacheAccount(accountId, query.account);

            return res
                .status(200)
                .json({
                    account: query.account,
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