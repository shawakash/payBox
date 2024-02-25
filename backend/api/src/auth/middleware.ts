import { NextFunction, Request, Response } from "express";
import { clearCookie, setJWTCookie, validateJwt, validatePassword } from "./util";
import {
  AccountGetPrivateKey,
  AddressFormPartial,
  GetQrQuerySchema,
  Network,
  PasswordValid,
  TxnSendQuery,
  dbResStatus,
  responseStatus,
} from "@paybox/common";
import { cache, ethTxn, solTxn } from "..";
import { getAddressByClient } from "../db/qrcode";
import { Address } from "web3";
import { getPassword } from "../db/client";

/**
 *
 * @param req
 * @param res
 * @param next
 * @returns id
 */
export const extractClientId = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let jwt = "";

  // Header takes precedence
  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.split(" ")[0] === "Bearer") {
    jwt = authHeader.split(" ")[1];
  } else if (req.cookies.jwt) {
    jwt = req.cookies.jwt;
  } else if (req.query.jwt) {
    jwt = req.query.jwt as string;
  }

  if (jwt) {
    try {
      const payloadRes = await validateJwt(jwt);
      if (payloadRes.payload.sub) {
        // Extend cookie or set it if not set
        await setJWTCookie(req, res, payloadRes.payload.sub);
        // Set id on request
        //@ts-ignore
        req.id = payloadRes.payload.sub;
        // Set jwt  on request
        //@ts-ignore
        req.jwt = jwt;
      }
    } catch {
      clearCookie(res, "jwt");
      return res
        .status(403)
        .json({ msg: "Auth error", status: responseStatus.Error });
    }
  } else {
    return res
      .status(403)
      .json({
        msg: "No authentication token found",
        status: responseStatus.Error,
      });
  }
  next();
};

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  //@ts-ignore
  req.authHeader = req.headers.authorization;
  next();
};

/**
 *
 * @param req
 * @param res
 * @param next
 * @returns middleware
 */
export const txnCheckAddress = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    //@ts-ignore
    const id = req.id;
    if (id) {
      try {
        const { network, from, to, cluster } = TxnSendQuery.parse(req.query);
        if (network == Network.Eth) {
          const sender = await ethTxn.checkAddress(from);
          const receiver = await ethTxn.checkAddress(to);
          if (!sender && !receiver) {
            return res
              .status(400)
              .json({
                status: responseStatus.Error,
                msg: "No such eth address",
              });
          }
        }
        if (network == Network.Sol) {
          const sender = await solTxn.checkAddress(from);
          const receiver = await solTxn.checkAddress(to);
          if (!sender && !receiver) {
            return res
              .status(400)
              .json({
                status: responseStatus.Error,
                msg: "No such solana address",
              });
          }
        }
      } catch (error) {
        console.log(error);
        return res
          .status(403)
          .json({
            msg: "Address Validation error",
            status: responseStatus.Error,
          });
      }
    } else {
      return res
        .status(500)
        .json({ status: responseStatus.Error, msg: "Jwt error" });
    }
    next();
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
};

export const checkAddress = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    //@ts-ignore
    const id = req.id;
    if (id) {
      try {
        const { eth, sol } = AddressFormPartial.parse(req.body);
        // if (eth) {
        //   const ethTxn = new EthTxnLogs(EthNetwok.sepolia, INFURA_PROJECT_ID, eth);
        //   const isAddress = await ethTxn.checkAddress();
        //   console.log(isAddress);
        //   if (!isAddress) {
        //     return res.status(400).json({ status: responseStatus.Error, msg: "No such etherum address" });
        //   }
        // }
        if (sol != undefined) {
          const isAddress = await solTxn.checkAddress(sol);
          if (!isAddress) {
            return res
              .status(400)
              .json({
                status: responseStatus.Error,
                msg: "No such solana address",
              });
          }
        }
      } catch (error) {
        console.log(error);
        return res
          .status(403)
          .json({
            msg: "Address Validation error",
            status: responseStatus.Error,
          });
      }
    } else {
      return res
        .status(500)
        .json({ status: responseStatus.Error, msg: "Jwt error" });
    }
    next();
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
};

export const hasAddress = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    //@ts-ignore
    const { id } = GetQrQuerySchema.parse(req.query);
    if (id) {
      try {
        const isCached = await cache.clientCache.getClientCache(id);
        if (!isCached?.address) {
          const getAddress = await getAddressByClient(id);
          if (!getAddress.address?.id) {
            return res
              .status(400)
              .json({
                msg: "Please add your address first",
                status: responseStatus.Error,
              });
          }
          await cache.address.cacheAddress(
            id,
            getAddress.address as Partial<Address> & {
              id: string;
              clientId: string;
            },
          );
          //@ts-ignore
          req.address = getAddress.address;
        }
        if (isCached?.address) {
          //@ts-ignore
          req.address = isCached.address;
        }
        next();
      } catch (error) {
        console.log(error);
        return res
          .status(403)
          .json({
            msg: "Please add address first",
            status: responseStatus.Error,
          });
      }
    } else {
      return res
        .status(500)
        .json({ status: responseStatus.Error, msg: "Jwt error" });
    }
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
};

/**
 * 
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
export const checkPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //@ts-ignore
    const id = req.id;
    if (id) {
      const { password } = PasswordValid.parse(req.body);
      // Password Check
      const { status, hashPassword } = await getPassword(id);
      if (status == dbResStatus.Error || hashPassword == undefined) {
        return res
          .status(503)
          .json({ msg: "Database Error", status: responseStatus.Error });
      }
      const isCorrectPass = await validatePassword(
        password,
        hashPassword
      );
      if (!isCorrectPass) {
        return res
          .status(401)
          .json({ msg: "Wrong Password", status: responseStatus.Error });
      }
    } else {
      return res
        .status(500)
        .json({ status: responseStatus.Error, msg: "Jwt error" });
    }
    next();
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
};
