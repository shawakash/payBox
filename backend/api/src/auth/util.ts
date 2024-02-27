import type { Request, Response } from "express";
import { importPKCS8, importSPKI, jwtVerify, SignJWT } from "jose";
import bcryptjs from "bcryptjs";
import { AUTH_JWT_PRIVATE_KEY, AUTH_JWT_PUBLIC_KEY, GMAIL, TWILLO_NUMBER } from "../config";
import {
  Address,
  CLIENT_URL,
  ChainAccountPrivate,
  JWT_ALGO,
  SALT_ROUNDS,
  getOtpTemplate,
} from "@paybox/common";
import * as qr from "qrcode";
import fs from "fs";
import * as bip39 from "bip39";
import { SolOps } from "../sockets/sol";
import { EthOps } from "../sockets/eth";
// import ed from "ed25519-hd-key";
// import * as ed25519 from 'ed25519';

import * as speakeasy from 'speakeasy';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { transporter, twillo } from "..";

/**
 * @param jwt
 * @returns
 */
export const validateJwt = async (jwt: string) => {
  const publicKey = await importSPKI(AUTH_JWT_PUBLIC_KEY, JWT_ALGO);
  return await jwtVerify(jwt, publicKey, {
    issuer: "shawakash",
    audience: "payBox",
  });
};

/**
 *
 * @param res
 * @param cookieName
 */
export const clearCookie = (res: Response, cookieName: string) => {
  res.clearCookie(cookieName);
};

export const setJWTCookie = async (
  req: Request,
  res: Response,
  userId: string,
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
  cookieValue: string,
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
    const hashedPassword = await bcryptjs.hash(password, SALT_ROUNDS);
    return hashedPassword;
  } catch (error) {
    throw new Error("Error hashing password");
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
  hashPassword: string,
): Promise<boolean> => {
  try {
    const isMatch = await bcryptjs.compare(password, hashPassword);
    return isMatch;
  } catch (error) {
    throw new Error("Error hashing password");
  }
};
/**
 *
 * @param payload
 * @param path
 * @returns true if the qr code is generated successfully else false
 */
export const generateQRCode = async (
  payload: Partial<Address> & { id: string },
  id: string,
): Promise<null | string> => {
  try {
    const path = generateUniqueImageName(id);
    const redirectUrl = `${CLIENT_URL}/txn/send?sol=${payload.sol}&eth=${payload.eth}&bitcoin=${payload.bitcoin}&usdc=${payload.usdc}`;
    // const qrCodeDataURL = await qr.toDataURL(redirectUrl);
    if (!fs.existsSync(path)) {
      await qr.toFile(path, redirectUrl);
      console.log(`QR code generated successfully and saved at: ${path}`);
      return path;
    } else {
      const uniquePath = generateUniqueImageName(`${id}_new`);
      await qr.toFile(uniquePath, JSON.stringify(redirectUrl));
      console.log(`QR code generated successfully and saved at: ${uniquePath}`);
      return uniquePath;
    }
  } catch (error) {
    console.error("Error generating QR code:", error);
    return null;
  }
};

export const generateUniqueImageName = (id: string): string => {
  const timestamp: number = Date.now();
  const imageName: string = `./codes/${id.slice(5)}_${timestamp
    .toString()
    .slice(5)}.png`;
  return imageName;
};

export const generateSeed = (strength: number): string => {
  const mnemonic: string = bip39.generateMnemonic(strength);
  return mnemonic;
};

export const getAccountOnPhrase = async (
  secretPhrase: string,
  count: number,
): Promise<ChainAccountPrivate[]> => {
  try {
    const solAccounts = await new SolOps().fromPhrase(secretPhrase, count);
    const ethAccounts = new EthOps().fromPhrase(secretPhrase, count);
    return [...solAccounts, ...ethAccounts];
  } catch (error) {
    console.log(error);
    return [];
  }
};

/**
 * 
 * @returns Opt
 */
export const genOtp = (digits: number, time: number): number => {
  const otp = speakeasy.totp({
    secret: speakeasy.generateSecret().base32,
    digits: digits,
    encoding: 'base32',
    step: time
  });
  return Number(otp);
}

/**
 * 
 * @param length 
 * @returns 
 */
export const genRand = (length: number): string => {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * 
 * @param name 
 * @param email 
 * @param otp 
 */
export const sendOTP = async (
  name: string,
  mobile: number,
  email: string,
  otp: number,
) => {
  const template = getOtpTemplate(name, otp, GMAIL);
  const mailOptions = {
    from: GMAIL,
    to: email,
    subject: 'PayBox Email Verification',
    html: template
  };

  try {
    await twillo.messages.create({
      body: `PayBox Verifcation OTP: ${otp}`,
      from: TWILLO_NUMBER,
      to: `+91${mobile}` as string,
    });
    await transporter.sendMail(mailOptions);
    console.log('OTP sent successfully to', email);
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
}