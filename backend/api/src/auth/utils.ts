import bcrypt from 'bcrypt';
import type { Request, Response } from "express";
import { importPKCS8, importSPKI, jwtVerify, SignJWT } from "jose";

import { AUTH_JWT_PRIVATE_KEY, AUTH_JWT_PUBLIC_KEY } from "../config";
import { JWT_ALGO, SALT_ROUNDS } from "@paybox/common";


export const validateJwt = async (jwt: string) => {
  const publicKey = await importSPKI(AUTH_JWT_PUBLIC_KEY, JWT_ALGO);
  return await jwtVerify(jwt, publicKey, {
    issuer: "shawakash",
    audience: "payBox",
  });
};

export const clearCookie = (res: Response, cookieName: string) => {
  res.clearCookie(cookieName);
};

export const setJWTCookie = async (
  req: Request,
  res: Response,
  userId: string
) => {
  const secret = await importPKCS8(AUTH_JWT_PRIVATE_KEY, JWT_ALGO);

  const jwt = await new SignJWT({
    sub: userId,
  })
    .setProtectedHeader({ alg: JWT_ALGO })
    .setIssuer("shawakash")
    .setAudience("payBox")
    .setIssuedAt()
    .sign(secret);

  setCookieOnResponse(req, res, "jwt", jwt);

  return jwt;
};

export const setCookieOnResponse = (
  req: Request,
  res: Response,
  cookieName: string,
  cookieValue: string
) => {
  res.cookie(cookieName, cookieValue, {
    secure: true,
    httpOnly: true,
    sameSite: "strict",
    // Note: the leading . below is significant, as it enables us to use the
    // cookie on subdomains
    domain: req.hostname.includes("localhost") ? "localhost" : ".paybox.dev",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // approx 1 year
  });
};

/**
 * To create a hash password
 * @param password 
 * @returns 
 */
export const setHashPassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);

    const hashedPassword = await bcrypt.hash(password, salt);

    return hashedPassword;
  } catch (error) {
    throw new Error('Error hashing password');
  }
};

/**
 * 
 * @param password 
 * @param hashPassword 
 * @returns Boolean if the above is matched
 */
export const validatePassword = async (
  password: string,
  hashPassword: string
): Promise<boolean> => {
  try {
    const isMatch = await bcrypt.compare(password, hashPassword);
    return isMatch;
  } catch (error) {
    throw new Error('Error hashing password');
  }
}