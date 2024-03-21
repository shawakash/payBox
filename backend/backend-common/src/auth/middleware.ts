import { NextFunction, Request, Response } from "express";
import {
  clearCookie,
  setJWTCookie,
  validateJwt,
  validatePassword,
} from "./util";
import {
  PasswordValid,
  VALID_CACHE_EXPIRE,
  dbResStatus,
  responseStatus,
} from "@paybox/common";
import { getPassword, queryValid } from "../db/client";
import { RedisBase } from "../redis";


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
    return res.status(403).json({
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
 * @returns
 */
export const checkPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
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
      const isCorrectPass = await validatePassword(password, hashPassword);
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
export const isValidated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //@ts-ignore
    const id = req.id;
    if (id) {

      const validCache = await RedisBase.getInstance().getIdFromKey(`valid:${id}`);
      if (validCache === 'true') {
        return res
          .status(200)
          .json({ msg: "Client Phone Number is validated 😊", status: responseStatus.Ok });
      }

      const {status, valid} = await queryValid(id);
      if (status == dbResStatus.Error) {
        return res
          .status(503)
          .json({ msg: "Database Error", status: responseStatus.Error });
      }
      if (valid) {
        return res
          .status(200)
          .json({ msg: "Client Phone Number is validated 😊", status: responseStatus.Ok });
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

/**
 * 
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
export const checkValidation = async (
  req: Request, 
  res: Response,
  next: NextFunction
) => {
  try {
    //@ts-ignore
    const id = req.id;
    if(id) {
      const validCache = await RedisBase.getInstance().getIdFromKey(`valid:${id}`);
      if (!validCache) {
        const {status, valid} = await queryValid(id);
        if (status == dbResStatus.Error) {
          return res
            .status(503)
            .json({ msg: "Database Error", status: responseStatus.Error });
        }
        if (!valid) {
          return res
          .status(200)
          .json({ msg: "Please verify your number or email first.", status: responseStatus.Error });
        }
        await RedisBase.getInstance().cacheIdUsingKey(`valid:${id}`, 'true', VALID_CACHE_EXPIRE);
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
