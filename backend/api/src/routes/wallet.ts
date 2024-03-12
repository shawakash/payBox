import { Router } from "express";
import { checkPassword } from "../auth/middleware";
import {
  SecretValid,
  WalletAccountGet,
  dbResStatus,
  responseStatus,
} from "@paybox/common";
import { delWallet, getAccounts, getSecretPhase, getWallets } from "../db/wallet";
import { cache } from "..";

export const walletRouter = Router();

walletRouter.get("/secret", checkPassword, async (req, res) => {
  try {
    //@ts-ignore
    const id = req.id;
    const { walletId } = SecretValid.parse(req.body);

    const query = await getSecretPhase(walletId, id);
    if (query.status == dbResStatus.Error || query.secret == undefined) {
      return res
        .status(503)
        .json({ msg: "Database Error", status: responseStatus.Error });
    }
    return res.status(200).json({
      status: responseStatus.Ok,
      secret: query.secret,
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

walletRouter.get("/accounts", async (req, res) => {
  try {
    //@ts-ignore
    const id = req.id;
    if (id) {
      const { walletId } = WalletAccountGet.parse(req.query);

      // Cache
      const cacheWallet = await cache.wallet.getWallet(walletId);
      if (cacheWallet?.accounts) {
        return res.status(200).json({
          accounts: cacheWallet.accounts,
          status: responseStatus.Ok,
        });
      }
      const query = await getAccounts(walletId);
      if (query.status == dbResStatus.Error || query.accounts == undefined) {
        return res
          .status(503)
          .json({ msg: "Database Error", status: responseStatus.Error });
      }
      // Cache
      await cache.wallet.cacheWallet(walletId, {
        clientId: id,
        id: walletId,
        accounts: query.accounts,
      });
      return res.status(200).json({
        accounts: query.accounts,
        status: responseStatus.Ok,
      });
    }
    return res
      .status(500)
      .json({ status: responseStatus.Error, msg: "Jwt error" });
  } catch (error) {}
});

walletRouter.delete("/", async (req, res) => {
  try {
    //@ts-ignore
    const id = req.id;
    if (id) {
      const { walletId } = SecretValid.parse(req.query);
      await cache.deleteHash(walletId);

      const deleteSecret = await delWallet(walletId, id);
      if (deleteSecret.status == dbResStatus.Error) {
        return res
          .status(503)
          .json({ msg: "Database Error", status: responseStatus.Error });
      }
      return res
        .status(200)
        .json({ status: responseStatus.Ok, msg: "Deleted" });
    }
    return res
      .status(500)
      .json({ status: responseStatus.Error, msg: "Jwt error" });
  } catch (error) {
    return res
      .status(500)
      .json({ status: responseStatus.Error, msg: "Jwt error" });
  }
});

walletRouter.get("/", async (req, res) => {
  try {
    //@ts-ignore
    const id = req.id;
    const query = await getWallets(id);
    if (query.status == dbResStatus.Error || query.wallets == undefined) {
      return res
        .status(503)
        .json({ msg: "Database Error", status: responseStatus.Error });
    }
    return res.status(200).json({
      wallets: query.wallets,
      status: responseStatus.Ok,
    });

  } catch (error) {
    console.error(error)
    return res
    .status(500)
    .json({ status: responseStatus.Error, msg: "Jwt error" });
  }
});