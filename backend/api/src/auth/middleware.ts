import { NextFunction, Request, Response } from "express";
import { clearCookie, setJWTCookie, validateJwt } from "./util";
import { responseStatus } from "../types/client";

export const extractClientId = async (
    req: Request, res: Response, next: NextFunction
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
        return res.status(403).json({ msg: "Auth error", status: responseStatus.Error });
      }
    } else {
      return res.status(403).json({ msg: "No authentication token found", status: responseStatus.Error });
    }
  
    next();
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  //@ts-ignore
  req.authHeader = req.headers.authorization;
  next();
};