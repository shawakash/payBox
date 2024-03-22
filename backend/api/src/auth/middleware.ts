import { NextFunction, Request, Response } from "express";
import {
  getObjectFromR2,

} from "./util";
import {
  ADDRESS_CACHE_EXPIRE,
  AddressFormPartial,
  GetQrQuerySchema,
  Network,
  QrcodeQuery,
  TxnSendQuery,
  responseStatus,
} from "@paybox/common";
import { getAddressByClient } from "@paybox/backend-common";
import { Address } from "web3";
import { EthOps } from "../sockets/eth";
import { SolOps } from "../sockets/sol";
import rateLimit from "express-rate-limit";
import { R2_QRCODE_BUCKET_NAME } from "../config";
import { Redis } from "..";



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
          const sender = await (new EthOps()).checkAddress(from);
          const receiver = await (new EthOps()).checkAddress(to);
          if (!sender && !receiver) {
            return res.status(400).json({
              status: responseStatus.Error,
              msg: "No such eth address",
            });
          }
        }
        if (network == Network.Sol) {
          const sender = await (new SolOps()).checkAddress(from);
          const receiver = await (new SolOps()).checkAddress(to);
          if (!sender && !receiver) {
            return res.status(400).json({
              status: responseStatus.Error,
              msg: "No such solana address",
            });
          }
        }
      } catch (error) {
        console.log(error);
        return res.status(403).json({
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
    return res.status(500).json({
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
          const isAddress = await (new SolOps()).checkAddress(sol);
          if (!isAddress) {
            return res.status(400).json({
              status: responseStatus.Error,
              msg: "No such solana address",
            });
          }
        }
      } catch (error) {
        console.log(error);
        return res.status(403).json({
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
    return res.status(500).json({
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
        const isCached = await Redis.getRedisInst().clientCache.getClientCache(id);
        if (!isCached?.address) {
          const getAddress = await getAddressByClient(id);
          if (!getAddress.address?.id) {
            return res.status(400).json({
              msg: "Please add your address first",
              status: responseStatus.Error,
            });
          }
          await Redis.getRedisInst().address.cacheAddress(
            id,
            getAddress.address as Partial<Address> & {
              id: string;
              clientId: string;
            },
            ADDRESS_CACHE_EXPIRE
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
        return res.status(403).json({
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
    return res.status(500).json({
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
export const checkQrcode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //@ts-ignore
    const id = req.id;
    if (id) {
      const { accountId } = QrcodeQuery.parse(req.query);
      const fileName = `qr:${accountId.slice(5)}`;
      const body = await getObjectFromR2(R2_QRCODE_BUCKET_NAME, fileName);
      if (body?.code) {
        return res.status(200).json({
          status: responseStatus.Ok,
          qrCode: body.code,
          type: body.type,
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
    return res.status(500).json({
      status: responseStatus.Error,
      msg: "Internal error",
      error: error,
    });
  }
}

// Middleware to limit the number of requests to resend OTP
export const resendOtpLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: 1, // limit each client to 3 requests per windowMs
  message: {
    status: responseStatus.Error,
    msg: "Too many requests, please try again after 1 minute"
  },
  keyGenerator: function (req, res) {
    //@ts-ignore
    return req.id; // Use the client id as the key
  }
});


export const accountCreateRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 15 minutes
  max: 2,
  message: {
    status: responseStatus.Error,
    msg: "Too many requests, please try again after 5 minutes"
  },
  keyGenerator: function (req, res) {
    //@ts-ignore
    return req.id; // Use the client id as the key
  }
});