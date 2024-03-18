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
  ACCOUNT_CACHE_EXPIRE,
  WALLET_CACHE_EXPIRE,
  PHRASE_ACCOUNT_CACHE_EXPIRE,
} from "@paybox/common";
import { Router } from "express";
import {
  createAccount,
  deleteAccount,
  getPrivate,
  updateAccountName,
  getAccount,
  getAccounts,
  putImgUrl,
  genRand,
  genUUID,
  validatePassword,
  checkPassword
} from "@paybox/backend-common";
import { importFromPrivate, addAccountPhrase, getWalletForAccountCreate } from "@paybox/backend-common";
import { cache } from "..";
import {
  generateSeed,
  getAccountOnPhrase,
  getPutSignUrl,
  updateKey,
} from "../auth/util";
import { getPassword } from "@paybox/backend-common";
import { accountCreateRateLimit,  } from "../auth/middleware";
import { getSecretPhase } from "@paybox/backend-common";
import { SolOps } from "../sockets/sol";
import { EthOps } from "../sockets/eth";
import { INFURA_PROJECT_ID, R2_CLIENT_BUCKET_NAME } from "../config";

export const accountRouter = Router();

accountRouter.post("/", accountCreateRateLimit, async (req, res) => {
  try {
    //@ts-ignore
    const id = req.id;
    if (id) {
      const { name, imgUrl } = AccountCreateQuery.parse(req.query);

      /**
       * Create an public and private key
       */
      const query = await getWalletForAccountCreate(id);
      if (query.status == dbResStatus.Error || query.id == undefined || query.secretPhase == undefined) {
        return res
          .status(503)
          .json({ msg: "Database Error", status: responseStatus.Error });
      }
      const solKeys = await (new SolOps()).createAccount(query.secretPhase);
      const ethKeys = (new EthOps()).createAccount(query.secretPhase);
      const mutation = await createAccount(
        id,
        query.id,
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
        
        // change the key of the image
        if(imgUrl) {
          const key = (new URL(imgUrl)).pathname.split('/')[1];
          const newTAG = await updateKey(R2_CLIENT_BUCKET_NAME, key, mutation.account?.id);
          await putImgUrl(mutation.account.id, `https://${R2_CLIENT_BUCKET_NAME}.cloudflarestorage.com/${mutation.account?.id}`);
        }

      /**
       * Cache
       */
      await cache.account.cacheAccount<AccountType>(
        mutation.account.id,
        mutation.account,
        ACCOUNT_CACHE_EXPIRE
      );
        console.log(mutation.account);
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
      await cache.deleteHash(accountId);
      await cache.deleteHash(mutation.account.walletId);

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
      await cache.account.cacheAccount<AccountType>(accountId, query.account, ACCOUNT_CACHE_EXPIRE);

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
          keys = await (new SolOps()).fromSecret(secretKey);
        case Network.Eth:
          keys = (new EthOps).fromSecret(secretKey);
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
      await cache.wallet.cacheWallet(mutation.wallet.id, mutation.wallet, WALLET_CACHE_EXPIRE);
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
      await cache.wallet.fromPhrase(secretPhrase, accounts, PHRASE_ACCOUNT_CACHE_EXPIRE);
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
      await cache.wallet.cacheWallet(mutation.wallet.id, mutation.wallet, WALLET_CACHE_EXPIRE);
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

// to get all the account of a specific client
accountRouter.get('/all', async (req, res) => {
  try {
    //@ts-ignore
    const id = req.id;

    // const cacheAccs = await cache.account.getAccounts(`accs:${id}`);
    // if (cacheAccs) {
    //   return res.status(302).json({
    //     accounts: cacheAccs,
    //     status: responseStatus.Ok,
    //   });
    // }

    const {status, accounts} = await getAccounts(id);
    if(status == dbResStatus.Error || !accounts) {
      return res
          .status(503)
          .json({ msg: "Database Error", status: responseStatus.Error });
    }


    // cacheit
    await cache.account.cacheAccounts(`accs:${id}`, accounts, ACCOUNT_CACHE_EXPIRE);

    return res
            .status(200)
            .json({accounts, status: responseStatus.Ok});

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: responseStatus.Error,
      msg: "Internal error",
      error: error,
    });
  }
});

// To get the total number of accounts
accountRouter.get('/defaultMetadata', async (req, res) => {
  try {
    //@ts-ignore
    const id = req.id;

    const randomKey = genUUID();

    // generate a put sign url
    const putUrl = await getPutSignUrl(R2_CLIENT_BUCKET_NAME, randomKey, 600);
    if(!putUrl) {
      return res
          .status(503)
          .json({ msg: "Error in generating put sign url", status: responseStatus.Error });
    }

    //query
    const {status, accounts} = await getAccounts(id);
    if(status == dbResStatus.Error || !accounts) {
      return res
          .status(503)
          .json({ msg: "Database Error", status: responseStatus.Error });
    }

    return res
            .status(200)
            .json({
              number: accounts.length,
              putUrl,
              status: responseStatus.Ok
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

accountRouter.get('/getPutImgUrl', async (req, res) => {
  try {
    //@ts-ignore
    const id = req.id;

    const randomKey = genUUID();

    // generate a put sign url
    const putUrl = await getPutSignUrl(R2_CLIENT_BUCKET_NAME, randomKey, 600);
    if(!putUrl) {
      return res
          .status(503)
          .json({ msg: "Error in generating put sign url", status: responseStatus.Error });
    }

    return res
            .status(200)
            .json({putUrl, status: responseStatus.Ok});
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: responseStatus.Error,
      msg: "Internal error",
      error: error,
    });
  }
});