import {
  AccountCreateQuery,
  AccountDelete,
  AccountGetPrivateKey,
  AccountGetQuery,
  AccountNameQuery,
  dbResStatus,
  responseStatus,
  AccountType,
  ImportAccountSecret,
  Network,
  WalletKeys,
  GetAccount,
  ImportAccount,
  ChainAccount,
  SECRET_PHASE_STRENGTH,
} from "@paybox/common";
import { Router } from "express";
import { SolOps } from "../sockets/sol";
import { EthOps } from "../sockets/eth";
import {
  createAccount,
  deleteAccount,
  getPrivate,
  updateAccountName,
  getAccount,
} from "../db/account";
import { importFromPrivate, addAccountPhrase } from "../db/wallet";
import { cache } from "..";
import {
  generateSeed,
  getAccountOnPhrase,
  validatePassword,
} from "../auth/util";
import { getPassword } from "../db/client";
import { checkPassword } from "../auth/middleware";
import { getSecretPhase } from "../db/wallet";

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
      const query = await getSecretPhase(walletId, id);
      if (query.status == dbResStatus.Error || query.secret == undefined) {
        return res
          .status(503)
          .json({ msg: "Database Error", status: responseStatus.Error });
      }
      const solKeys = await new SolOps().createAccount(query.secret);
      const ethKeys = new EthOps().createAccount(query.secret);
      const mutation = await createAccount(
        id,
        walletId,
        name,
        solKeys,
        ethKeys,
      );
      if (
        mutation.status == dbResStatus.Error ||
        mutation.account == undefined
      ) {
        return res
          .status(503)
          .json({ msg: "Database Error", status: responseStatus.Error });
      }
      console.log(mutation);

      /**
       * Cache
       */
      await cache.account.cacheAccount<AccountType>(
        mutation.account.id,
        mutation.account,
      );

      return res.status(200).json({
        account: mutation.account,
        status: responseStatus.Ok,
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

accountRouter.patch("/updateName", async (req, res) => {
  try {
    //@ts-ignore
    const id = req.id;
    if (id) {
      const { name, accountId } = AccountNameQuery.parse(req.query);
      const mutation = await updateAccountName(name, accountId);
      if (
        mutation.status == dbResStatus.Error ||
        mutation.account == undefined
      ) {
        return res
          .status(503)
          .json({ msg: "Database Error", status: responseStatus.Error });
      }

      /**
       * Cache
       */
      await cache.account.cacheAccount<AccountType>(
        mutation.account.id,
        mutation.account,
      );

      return res.status(200).json({
        msg: "Name updated 😊",
        status: responseStatus.Ok,
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

accountRouter.post("/privateKey", checkPassword, async (req, res) => {
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
        privateKey: query.privateKey,
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

accountRouter.delete("/", async (req, res) => {
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

      return res.status(200).json({
        msg: "Account deleted",
        status: responseStatus.Ok,
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

accountRouter.get("/", async (req, res) => {
  try {
    //@ts-ignore
    const id = req.id;
    if (id) {
      const { accountId } = AccountGetQuery.parse(req.query);

      /**
       * Cache
       */
      const account = await cache.account.getAccount<AccountType>(accountId);
      if (account?.id) {
        return res.status(200).json({
          account,
          status: responseStatus.Ok,
        });
      }

      const query = await getAccount(accountId);
      if (query.status == dbResStatus.Error || query.account == undefined) {
        return res
          .status(503)
          .json({ msg: "Database Error", status: responseStatus.Error });
      }

      /**
       * Cache
       */
      await cache.account.cacheAccount<AccountType>(accountId, query.account);

      return res.status(200).json({
        account: query.account,
        status: responseStatus.Ok,
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

accountRouter.post("/private", async (req, res) => {
  try {
    //@ts-ignore
    const id = req.id;
    if (id) {
      const { secretKey, name, network } = ImportAccountSecret.parse(req.query);
      let keys = {} as WalletKeys;
      switch (network) {
        case Network.Sol:
          keys = await new SolOps().fromSecret(secretKey);
        case Network.Eth:
          keys = new EthOps().fromSecret(secretKey);
        case Network.Bitcoin:
        case Network.USDC:
          break;
        default:
          break;
      }
      if (!keys.privateKey || !keys.publicKey) {
        return res
          .status(500)
          .json({ status: responseStatus.Error, msg: "Network not supported" });
      }
      const seed = generateSeed(SECRET_PHASE_STRENGTH);
      const mutation = await importFromPrivate(id, seed, network, name, keys);
      if (
        mutation.status == dbResStatus.Error ||
        mutation.wallet?.id == undefined
      ) {
        return res
          .status(503)
          .json({ msg: "Database Error", status: responseStatus.Error });
      }

      /**
       * Cache
       */
      await cache.wallet.cacheWallet(mutation.wallet.id, mutation.wallet);
      return res.status(200).json({
        wallet: mutation.wallet,
        status: responseStatus.Ok,
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

accountRouter.get("/fromPhrase", async (req, res) => {
  try {
    //@ts-ignore
    const id = req.id;
    if (id) {
      const { secretPhrase, count } = GetAccount.parse(req.body);
      const accounts = await getAccountOnPhrase(secretPhrase, count);
      if (!accounts) {
        return res
          .status(500)
          .json({ status: responseStatus.Error, msg: "Invalid phrase" });
      }
      // cache
      await cache.wallet.fromPhrase(secretPhrase, accounts);
      return res.status(200).json({
        //@ts-ignore
        accounts: accounts.map(({ privateKey, ...account }) => account),
        status: responseStatus.Ok,
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

accountRouter.post("/import", async (req, res) => {
  try {
    //@ts-ignore
    const id = req.id;
    if (id) {
      const { name, keys } = ImportAccount.parse(req.body);
      /**
       * Cache
       */
      const cacheAccount = await cache.wallet.getFromPhrase(keys);
      if (cacheAccount == null) {
        return res.status(500).json({
          status: responseStatus.Error,
          msg: "Internal Error in Caching",
        });
      }
      const solCount = cacheAccount.filter(
        ({ network }: { network: Network }) => network === Network.Sol,
      ).length;
      const ethCount = cacheAccount.filter(
        ({ network }: { network: Network }) => network === Network.Eth,
      ).length;
      if (solCount > 1 || ethCount > 1) {
        return res.status(500).json({
          status: responseStatus.Error,
          msg: "Account should contain only one eth and one sol",
        });
      }

      /**
       * Mutation
       */
      const seed = generateSeed(SECRET_PHASE_STRENGTH);
      const mutation = await addAccountPhrase(id, name, seed, cacheAccount);
      if (
        mutation.status == dbResStatus.Error ||
        mutation.wallet?.id == undefined
      ) {
        return res
          .status(503)
          .json({ msg: "Database Error", status: responseStatus.Error });
      }

      /**
       * Cache
       */
      await cache.wallet.cacheWallet(mutation.wallet.id, mutation.wallet);
      return res.status(200).json({
        wallet: mutation.wallet,
        status: responseStatus.Ok,
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
