import { Router } from "express";
import { UpdateClientParser, ValidateUsername } from "../validations/client";
import { dbResStatus } from "../types/client";
import {
  Address,
  ChangePasswordValid,
  OtpValid,
  PasswordValid,
  SECRET_PHASE_STRENGTH,
  TOTP_DIGITS,
  TOTP_TIME,
  responseStatus,
} from "@paybox/common";
import {
  checkClient,
  conflictClient,
  createBaseClient,
  createClient,
  deleteClient,
  getClientByEmail,
  getClientById,
  getClientMetaData,
  updateMetadata,
  updatePassword,
  validateClient,
} from "../db/client";
import { cache, twillo } from "../index";
import {
  genOtp,
  genRand,
  generateSeed,
  setHashPassword,
  setJWTCookie,
  validatePassword,
} from "../auth/util";
import { checkPassword, extractClientId, isValidated } from "../auth/middleware";
import {
  Client,
  ClientSigninFormValidate,
  ClientSignupFormValidate,
} from "@paybox/common";
import { SolOps } from "../sockets/sol";
import { EthOps } from "../sockets/eth";
import { REDIS_SECRET, TWILLO_NUMBER } from "../config";
import { createWallet } from "../db/wallet";

export const clientRouter = Router();

clientRouter.post('/', async (req, res) => {
  try {
    const { username, email, firstname, lastname, mobile, password } =
      ClientSignupFormValidate.parse(req.body);

    const getClient = await conflictClient(username, email);
    if (getClient.client?.length) {
      return res
        .status(409)
        .json({ msg: "client already exist", status: responseStatus.Error });
    }

    // Add base client object
    const hashPassword = await setHashPassword(password);
    const client = await createBaseClient(
      username,
      email,
      firstname,
      lastname,
      hashPassword,
      Number(mobile),
    );
    if (client.status == dbResStatus.Error) {
      return res
        .status(503)
        .json({ msg: "Database Error", status: responseStatus.Error });
    }

    // Generate OTP
    const otp = genOtp(TOTP_DIGITS, TOTP_TIME);
    await twillo.messages.create({
      body: `Paybox OTP is: ${otp}`,
      from: TWILLO_NUMBER,
      to: `+91${mobile}` as string,
    });

    // Cache
    /**
    * Cache
    */
    await cache.clientCache.cacheClient(client.id as string, {
      firstname,
      email,
      username,
      lastname,
      mobile,
      id: client.id as string,
      //@ts-ignore
      address: client.address,
      password: hashPassword,
    });
    await cache.cacheIdUsingKey(otp, client.id as string);

    /**
     * Create a Jwt
     */
    let jwt: string;
    if (client.id) {
      jwt = await setJWTCookie(req, res, client.id as string);
    } else {
      return res.status(500).json({
        msg: "Error creating user account",
        status: responseStatus.Error,
      });
    }

    return res.status(200).json({ ...client, jwt, status: responseStatus.Ok });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error, status: responseStatus.Error });
  }
});

clientRouter.patch("/valid", extractClientId, isValidated, async (req, res) => {
  try {
    //@ts-ignore
    const id = req.id;
    if (id) {
      const { otp } = OtpValid.parse(req.query);

      const tempCache = await cache.getIdFromKey(otp.toString());
      if (!tempCache) {
        return res
          .status(404)
          .json({ msg: "Invalid otp 🥲", status: responseStatus.Error });
      }

      const seed = generateSeed(SECRET_PHASE_STRENGTH);
      const solKeys = await new SolOps().createWallet(seed);
      const ethKeys = new EthOps().createWallet(seed);

      const validate = await validateClient(id, seed, 'Account 1', solKeys, ethKeys);
      if (validate.status == dbResStatus.Error || validate.walletId == undefined || validate.account == undefined) {
        return res
          .status(503)
          .json({ status: responseStatus.Error, msg: "Database Error" });
      }
      if(validate.valid == false) {
        return res
          .status(503)
          .json({ status: responseStatus.Error, msg: "Error in validation" });
      }
      /**
       * Cache
       */
      await cache.wallet.cacheWallet(validate.walletId as string, {
        clientId: id,
        id: validate.walletId as string,
        secretPhase: seed,
        accounts: [
          {
            clientId: id as string,
            id: validate.account?.id as string,
            sol: validate.account?.sol,
            eth: validate.account?.eth,
            walletId: validate.walletId as string,
            name: "Account 1",
          },
        ],
      });
      await cache.cacheIdUsingKey(`valid:${id}`, 'true');
      
      return res
        .status(200)
        .json({
          msg: "Validation successful",
          walletId: validate.walletId,
          account: validate.account,
          valid: validate.valid,
          status: responseStatus.Ok
        });
    }
    return res
      .status(500)
      .json({ status: responseStatus.Error, msg: "Jwt error" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error, status: responseStatus.Error });
  }
});

/**
 * Login/signup incase of providers
 */
clientRouter.post("/providerAuth", async (req, res) => {
  try {
    const { username, email, firstname, lastname, mobile, password } =
      ClientSignupFormValidate.parse(req.body);

    /**
     * Cache
     */
    const cachedClient =
      (await cache.clientCache.getClientFromKey(username)) ||
      (await cache.clientCache.getClientFromKey(email));
    if (cachedClient) {
      let jwt;
      if (cachedClient.id) {
        jwt = await setJWTCookie(req, res, cachedClient.id as string);
      }
      return res
        .status(302)
        .json({ ...cachedClient, status: responseStatus.Ok, jwt });
    }

    const hashPassword = await setHashPassword(password);
    const getClient = await checkClient(username, email);
    if (getClient.client?.length) {
      let jwt: string;
      if (getClient.client[0].id) {
        jwt = await setJWTCookie(req, res, getClient.client[0].id as string);
      } else {
        return res.status(500).json({
          msg: "Error creating user account",
          status: responseStatus.Error,
        });
      }
      await cache.clientCache.cacheClient(getClient.client[0].id as string, {
        firstname,
        email,
        username,
        lastname,
        mobile,
        id: getClient?.client[0].id as string,
        address: getClient.client[0].address as Address,
        //@ts-ignore
        password: hashPassword || "",
      });

      return res
        .status(200)
        .json({ ...getClient.client[0], jwt, status: responseStatus.Ok });
    }
    const seed = generateSeed(SECRET_PHASE_STRENGTH);
    const solKeys = await new SolOps().createWallet(seed);
    const ethKeys = new EthOps().createWallet(seed);
    const client = await createClient(
      username,
      email,
      firstname,
      lastname,
      hashPassword,
      Number(mobile),
      seed,
      solKeys,
      ethKeys,
    );
    if (
      client.status == dbResStatus.Error ||
      client.sol == undefined ||
      client.eth == undefined
    ) {
      return res
        .status(503)
        .json({ msg: "Database Error", status: responseStatus.Error });
    }

    /**
     * Cache
     */
    await cache.clientCache.cacheClient(client?.id as string, {
      firstname,
      email,
      username,
      lastname,
      mobile,
      id: client?.id as string,
      address: client?.address as Address,
      //@ts-ignore
      password: hashPassword || "",
    });

    if (client.walletId) {
      await cache.wallet.cacheWallet(client.walletId as string, {
        clientId: client.id as string,
        id: client.walletId as string,
        secretPhase: seed,
        accounts: [
          {
            clientId: client.id as string,
            id: client.accountId as string,
            sol: client.sol,
            eth: client.eth,
            walletId: client.walletId as string,
            name: "Account 1",
          },
        ],
      });
    }

    /**
     * Create a Jwt
     */
    let jwt: string;
    if (client?.id) {
      jwt = await setJWTCookie(req, res, client.id as string);
    } else {
      return res.status(500).json({
        msg: "Error creating user account",
        status: responseStatus.Error,
      });
    }

    return res.status(200).json({ ...client, jwt, status: responseStatus.Ok });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error, status: responseStatus.Error });
  }
});

/**
 * Login route
 */
clientRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = ClientSigninFormValidate.parse(req.body);

    /**
     * Cache
     */
    const cachedClient = await cache.clientCache.getClientFromKey(email);
    if (cachedClient) {
      let jwt;
      if (cachedClient.id) {
        jwt = await setJWTCookie(req, res, cachedClient.id as string);
      }
      console.log(cachedClient, "from cache");
      return res
        .status(302)
        .json({ ...cachedClient, status: responseStatus.Ok, jwt });
    }

    /**
     * Query the db
     */
    const query = await getClientByEmail(email);
    if (query.status == dbResStatus.Error) {
      return res
        .status(503)
        .json({ status: responseStatus.Error, msg: "Database Error" });
    }
    if (!query.client?.length) {
      return res
        .status(404)
        .json({ msg: "Not found", status: responseStatus.Error });
    }

    /**
     * Password check
     */
    const isCorrectPass = await validatePassword(
      password,
      query.client[0].password as string,
    );
    if (!isCorrectPass) {
      return res
        .status(401)
        .json({ msg: "Wrong Password", status: responseStatus.Error });
    }

    /**
     * Cache
     */
    await cache.clientCache.cacheClient(
      query.client[0].id as string,
      query.client[0] as Client,
    );

    /**
     * Create a Jwt
     */
    let jwt: string;
    if (query.client[0].id) {
      jwt = await setJWTCookie(req, res, query.client[0].id as string);
    } else {
      return res
        .status(500)
        .json({ msg: "Error creating jwt", status: responseStatus.Error });
    }
    return res
      .status(200)
      .json({ ...query.client[0], jwt, status: responseStatus.Ok });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error, status: responseStatus.Error });
  }
});

/**
 * To validate jwt and get user
 */
clientRouter.get("/me", extractClientId, async (req, res) => {
  try {
    //@ts-ignore for first-time
    const id = req.id;
    if (id) {
      const cachedClient = await cache.clientCache.getClientCache(id);
      if (cachedClient) {
        return (
          res
            .status(302)
            //@ts-ignore
            .json({ ...cachedClient, status: responseStatus.Ok, jwt: req.jwt })
        );
      }
      const query = await getClientById(id);
      if (query.status == dbResStatus.Error) {
        return res
          .status(503)
          .json({ status: responseStatus.Error, msg: "Database Error" });
      }
      if (!query.client?.length) {
        return res
          .status(404)
          .json({ msg: "Not found", status: responseStatus.Error });
      }
      await cache.clientCache.cacheClient(id, query.client[0] as Client);
      return (
        res
          .status(302)
          //@ts-ignore
          .json({ ...query.client[0], status: responseStatus.Ok, jwt: req.jwt })
      );
    }
    return res
      .status(500)
      .json({ status: responseStatus.Error, msg: "Jwt error" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error, status: responseStatus.Error });
  }
});

/**
 * Get a user
 */
clientRouter.get("/:username", extractClientId, async (req, res) => {
  try {
    //@ts-ignore
    const id = req.id;
    if (id) {
      const { username } = ValidateUsername.parse(req.params);

      /**
       * Cache
       */
      const cachedUser = await cache.clientCache.getClientCache(id);
      if (cachedUser) {
        return (
          res
            .status(302)
            //@ts-ignore
            .json({ ...cachedUser, status: responseStatus.Ok, jwt: req.jwt })
        );
      }

      const query = await getClientMetaData(username);
      if (query.status == dbResStatus.Error) {
        return res
          .status(503)
          .json({ msg: "Database Error", status: responseStatus.Error });
      }

      if (!query.client?.length) {
        return res
          .status(404)
          .json({ msg: "Not found", status: responseStatus.Error });
      }
      await cache.clientCache.cacheClient(id, query.client[0] as Client);
      return res
        .status(302)
        .json({ ...query.client[0], status: responseStatus.Ok });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error, status: responseStatus.Error });
  }
});
/**
 * Update Metadata
 */
clientRouter.patch("/updateMetadata", extractClientId, async (req, res) => {
  try {
    const { firstname, lastname } = UpdateClientParser.parse(req.body);
    //@ts-ignore
    if (req.id) {
      //@ts-ignore
      const updateUser = await updateMetadata(req.id, firstname, lastname);
      if (updateUser.status == dbResStatus.Error) {
        return res
          .status(503)
          .json({ status: responseStatus.Error, msg: "Database Error" });
      }
      //@ts-ignore
      await cache.updateUserFields(req.id, {
        firstname,
        lastname,
      });
      return res
        .status(200)
        .json({ status: responseStatus.Ok, msg: "Metadata Updated" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error, status: responseStatus.Error });
  }
});

clientRouter.delete("/delete", extractClientId, async (req, res) => {
  try {
    //@ts-ignore
    if (req.id) {
      //@ts-ignore
      const delete_user = await deleteClient(req.id);
      if (delete_user.status == dbResStatus.Error) {
        return res
          .status(503)
          .json({ status: responseStatus.Error, msg: "Database Error" });
      }
      //@ts-ignore
      await cache.deleteHash(req.id);
      return res
        .status(200)
        .json({ status: responseStatus.Ok, msg: "User Deleted" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error, status: responseStatus.Error });
  }
});

clientRouter.patch(
  "/password",
  extractClientId,
  checkPassword,
  async (req, res) => {
    try {
      //@ts-ignore
      const id = req.id;
      if (id) {
        const { newPassword } = ChangePasswordValid.parse(req.body);
        const hashNewPassord = await setHashPassword(newPassword);
        const updatePass = await updatePassword(id, hashNewPassord);
        if (updatePass.status == dbResStatus.Error) {
          return res
            .status(503)
            .json({ status: responseStatus.Error, msg: "Database Error" });
        }
        return res
          .status(200)
          .json({ status: responseStatus.Ok, msg: "Password Updated" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error, status: responseStatus.Error });
    }
  },
);
