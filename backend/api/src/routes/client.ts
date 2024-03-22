import { Router } from "express";
import { UpdateClientParser, ValidateUsername } from "../validations/client";
import { dbResStatus } from "../types/client";
import {
  ACCOUNT_CACHE_EXPIRE,
  AccountType,
  Address,
  CLIENT_CACHE_EXPIRE,
  ChangePasswordValid,
  OTP_CACHE_EXPIRE,
  OtpValid,
  PasswordValid,
  ResendOtpValid,
  SECRET_PHASE_STRENGTH,
  TOTP_DIGITS,
  TOTP_TIME,
  VALID_CACHE_EXPIRE,
  responseStatus,
} from "@paybox/common";
import {
  conflictClient,
  createBaseClient,
  createClient,
  deleteClient,
  getClientByEmail,
  getClientById,
  getClientMetaData,
  upadteMobileEmail,
  updateMetadata,
  updatePassword,
  validateClient,
  genRand,
  checkPassword, 
  extractClientId, 
  isValidated,
  validatePassword,
  setJWTCookie,
} from "@paybox/backend-common";
import { Redis } from "../index";
import {
  genOtp,
  generateSeed,
  sendOTP,
  setHashPassword,
} from "../auth/util";
import {  resendOtpLimiter } from "../auth/middleware";
import {
  Client,
  ClientSigninFormValidate,
  ClientSignupFormValidate,
} from "@paybox/common";
import { SolOps } from "../sockets/sol";
import { EthOps } from "../sockets/eth";

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


    /**
    * Cache
    */
    await Redis.getRedisInst().clientCache.cacheClient(client.id as string, {
      firstname,
      email,
      username,
      lastname,
      mobile,
      id: client.id as string,
      //@ts-ignore
      address: client.address,
      password: hashPassword,
      valid: client.valid || false,
    }, CLIENT_CACHE_EXPIRE);

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

    // Generate OTP
    const otp = genOtp(TOTP_DIGITS, TOTP_TIME);
    try {
      sendOTP(`${firstname}`, email, otp, Number(mobile));
      await Redis.getRedisInst().cacheIdUsingKey(otp.toString(), client.id as string, OTP_CACHE_EXPIRE);
    } catch (error) {
      console.log(error);
      return res.status(200).json({ ...client, jwt, msg: "Error in sending otp", status: responseStatus.Ok });
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

      const tempCache = await Redis.getRedisInst().getIdFromKey(otp.toString());
      if (!tempCache) {
        return res
          .status(404)
          .json({ msg: "Invalid otp 🥲", status: responseStatus.Error });
      }

      const seed = generateSeed(SECRET_PHASE_STRENGTH);
      const solKeys = await (new SolOps()).createWallet(seed);
      const ethKeys = (new EthOps()).createWallet(seed);

      const validate = await validateClient(id, seed, 'Account 1', solKeys, ethKeys);
      if (validate.status == dbResStatus.Error || validate.walletId == undefined || validate.account == undefined) {
        return res
          .status(503)
          .json({ status: responseStatus.Error, msg: "Database Error" });
      }
      if (validate.valid == false) {
        return res
          .status(503)
          .json({ status: responseStatus.Error, msg: "Error in validation" });
      }
      /**
       * Cache
      */
     await Redis.getRedisInst().wallet.handleValid({
      id: validate.walletId,
      clientId: id,
      accounts: [validate.account],
     }, id, validate.account);
      
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
 * Resend Otp
 */
clientRouter.patch("/resend", extractClientId, isValidated, resendOtpLimiter, async (req, res) => {
  try {
    //@ts-ignore
    const id = req.id;
    if (id) {
      const { mobile, email, name } = ResendOtpValid.parse(req.query);

      const otp = genOtp(TOTP_DIGITS, TOTP_TIME);
      try {
        await sendOTP(name, email, otp, Number(mobile));
        await Redis.getRedisInst().cacheIdUsingKey(otp.toString(), id, OTP_CACHE_EXPIRE);

        const { status } = await upadteMobileEmail(id, Number(mobile), email);
        if (status == dbResStatus.Error) {
          return res
            .status(503)
            .json({ status: responseStatus.Error, msg: "Database Error" });
        }

      } catch (error) {
        console.log(error);
        return res.status(200).json({ msg: "Error in sending otp", status: responseStatus.Ok });
      }
      return res.status(200).json({ msg: "Otp sent", status: responseStatus.Ok });
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
     * Cache check
     */
    const client =
      (await Redis.getRedisInst().clientCache.getClientFromKey(username)) ||
      (await Redis.getRedisInst().clientCache.getClientFromKey(email)) || (await getClientByEmail(email)).client;
    if (client) {
      let jwt;
      if (client.id) {
        jwt = await setJWTCookie(req, res, client.id as string);
      }

      /**
       * Check password
       */
      if(password) {
        const isCorrectPass = await validatePassword(
          password,
          client.password as string,
        );
        if (!isCorrectPass) {
          return res
            .status(401)
            .json({ msg: "Wrong Password", status: responseStatus.Error });
        }
      }

      /**
       * Cache
       */
      await Redis.getRedisInst().clientCache.cacheClient(client.id as string, client, CLIENT_CACHE_EXPIRE);

      return res
        .status(302)
        .json({ ...client, status: responseStatus.Ok, jwt });
    }

    const hashPassword = await setHashPassword(password);
    const mutation = await createBaseClient(username, email, firstname, lastname, hashPassword, Number(mobile));
    if (mutation.status == dbResStatus.Error || mutation?.id == undefined) {
      return res
        .status(503)
        .json({ status: responseStatus.Error, msg: "Database Error" });
    }

    /**
     * Create a Jwt
    */
    let jwt: string;
    if (mutation.id) {
      jwt = await setJWTCookie(req, res, mutation.id as string);
    } else {
      return res.status(500).json({
        msg: "Error creating user account",
        status: responseStatus.Error,
      });
    }

    await Redis.getRedisInst().clientCache.cacheClient(mutation.id as string, {
      firstname,
      email,
      username,
      lastname,
      mobile,
      id: mutation?.id as string,
      address: mutation?.address as Address,
      //@ts-ignore
      password: hashPassword || "",
      valid: mutation?.valid || false,
    }, CLIENT_CACHE_EXPIRE);

    // Generate OTP
    const otp = genOtp(TOTP_DIGITS, TOTP_TIME);
    try {
      sendOTP(`${firstname}`, email, otp);
      await Redis.getRedisInst().cacheIdUsingKey(otp.toString(), mutation.id as string, OTP_CACHE_EXPIRE);
    } catch (error) {
      console.log(error);
      return res.status(200).json({
        firstname,
        email,
        username,
        lastname,
        mobile,
        id: mutation?.id as string,
        address: mutation?.address as Address,
        valid: mutation?.valid || false,
        jwt, msg: "Error in sending otp",
        status: responseStatus.Ok
      });
    }

    return res
      .status(200)
      .json({
        firstname,
        email,
        username,
        lastname,
        mobile,
        id: mutation?.id as string,
        address: mutation?.address as Address,
        valid: mutation?.valid || false, jwt, status: responseStatus.Ok
      });
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
     * Query the db
     */
    const query = await getClientByEmail(email);
    if (query.status == dbResStatus.Error) {
      return res
        .status(503)
        .json({ status: responseStatus.Error, msg: "Database Error" });
    }
    if (!query.client?.id) {
      return res
        .status(404)
        .json({ msg: "Not found", status: responseStatus.Error });
    }

    /**
     * Password check
     */
    const isCorrectPass = await validatePassword(
      password,
      query.client.password as string,
    );
    if (!isCorrectPass) {
      return res
        .status(401)
        .json({ msg: "Wrong Password", status: responseStatus.Error });
    }

    /**
     * Cache
     */
    await Redis.getRedisInst().clientCache.cacheClient(
      query.client.id as string,
      query.client as Client,
      CLIENT_CACHE_EXPIRE,
    );

    /**
     * Create a Jwt
     */
    let jwt: string;
    if (query.client.id) {
      jwt = await setJWTCookie(req, res, query.client.id as string);
    } else {
      return res
        .status(500)
        .json({ msg: "Error creating jwt", status: responseStatus.Error });
    }
    return res
      .status(200)
      .json({ ...query.client, jwt, status: responseStatus.Ok });
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
      const cachedClient = await Redis.getRedisInst().clientCache.getClientCache(id);
      if (cachedClient) {
        return (
          res
            .status(302)
            //@ts-ignore
            .json({ ...cachedClient, status: responseStatus.Ok, jwt: req.jwt })
        );
      }
      const query = await getClientById<Client & { valid: boolean }>(id);
      if (query.status == dbResStatus.Error) {
        return res
          .status(503)
          .json({ status: responseStatus.Error, msg: "Database Error" });
      }
      if (!query.client?.id) {
        return res
          .status(404)
          .json({ msg: "Not found", status: responseStatus.Error });
      }
      await Redis.getRedisInst().clientCache.cacheClient(id, query.client as Client, CLIENT_CACHE_EXPIRE);
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
      const cachedUser = await Redis.getRedisInst().clientCache.getClientCache(id);
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

      if (!query.client?.id) {
        return res
          .status(404)
          .json({ msg: "Not found", status: responseStatus.Error });
      }
      await Redis.getRedisInst().clientCache.cacheClient(id, query.client as Client, CLIENT_CACHE_EXPIRE);
      return res
        .status(302)
        .json({ ...query.client, status: responseStatus.Ok });
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
    const id = req.id;
    if (id) {
      const updateUser = await updateMetadata(id, firstname, lastname);
      if (updateUser.status == dbResStatus.Error) {
        return res
          .status(503)
          .json({ status: responseStatus.Error, msg: "Database Error" });
      }
      await Redis.getInstance().deleteHash(id);
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
    const id = req.id;
    if (id) {
      const delete_user = await deleteClient(id);
      if (delete_user.status == dbResStatus.Error || delete_user?.email == undefined || delete_user?.username == undefined) {
        return res
          .status(503)
          .json({ status: responseStatus.Error, msg: "Database Error" });
      }
      await Redis.getRedisInst().clientCache.deleteCacheClient(id, delete_user.email, delete_user.username,);
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

        await Redis.getInstance().deleteHash(id);

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
