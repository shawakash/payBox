import { response, type Request, type Response } from "express";
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
// import ed from "ed25519-hd-key";
// import * as ed25519 from 'ed25519';

import * as speakeasy from 'speakeasy';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { cloud, transporter, twillo } from "..";
import { Readable } from "stream";
import { PutObjectCommand, GetObjectCommand, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { SolOps } from "../sockets/sol";
import { EthOps } from "../sockets/eth";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from 'uuid';

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
  bucketName: string,
  payload: Partial<Address>,
  id: string,
): Promise<Buffer | undefined> => {
  try {
    let redirectUrl = `${CLIENT_URL}/txn/send?`;
    if (payload.sol) {
      redirectUrl += `sol=${payload.sol}&`;
    }
    if (payload.eth) {
      redirectUrl += `eth=${payload.eth}&`;
    }
    if (payload.bitcoin) {
      redirectUrl += `&bitcoin=${payload.bitcoin}&`;
    }
    const buffer = await qr.toBuffer(redirectUrl);
    const ETag = await putObjectInR2<Buffer>(bucketName, `qr:${id.slice(5)}`, buffer, 'image/png');
    return buffer;

  } catch (error) {
    console.error("Error generating QR code:", error);
    return undefined;
  }
};

export const getUniqueImageName = (id: string): string => {
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
    const solAccounts = await (new SolOps()).fromPhrase(secretPhrase, count);
    const ethAccounts = (new EthOps()).fromPhrase(secretPhrase, count);
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
 * @returns 
 */
export const genUUID = (): string => {
  return uuidv4();
}

/**
 * 
 * @param name 
 * @param email 
 * @param otp 
 */
export const sendOTP = async (
  name: string,
  email: string,
  otp: number,
  mobile?: number,
) => {
  const template = getOtpTemplate(name, otp, GMAIL);
  const mailOptions = {
    from: GMAIL,
    to: email,
    subject: 'PayBox Email Verification',
    html: template
  };

  try {
    if (mobile !== undefined) {
      await twillo.messages.create({
        body: `PayBox Verifcation OTP: ${otp}`,
        from: TWILLO_NUMBER,
        to: `+91${mobile}` as string,
      });
    }
    await transporter.sendMail(mailOptions);
    console.log('OTP sent successfully to', email);
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
}

/**
 * 
 * @param bucketName 
 * @param fileName 
 * @param content 
 * @param contentType 
 */
export const putObjectInR2 = async <T extends string | Uint8Array | Buffer>(
  bucketName: string,
  fileName: string,
  content: T,
  contentType: string
): Promise<string | undefined> => {
  const mutate = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: content,
    ContentType: contentType,
    Metadata: {
      'Uploaded-By': 'payBox',
      'Upload-Date': new Date().toISOString(),
      'Content-Type': contentType,
      'owner': 'paybox'
    }
  });

  try {
    const { ETag } = await cloud.send(mutate);
    console.log(`File ${fileName} uploaded with ETag: ${ETag}`);
    return ETag;
  } catch (error) {
    console.error('Error uploading object:', error);
    throw error;
  }
}

/**
 * 
 * @param bucketName 
 * @param fileName 
 * @returns 
 */
export const getObjectFromR2 = async (
  bucketName: string,
  fileName: string
): Promise<{ code: Buffer, type: string } | undefined> => {

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: fileName
  });

  try {
    const { Body, ContentType } = await cloud.send(command);
    if (Body) {
      const chunks: Buffer[] = [];
      for await (const chunk of Body as Readable) {
        if (Buffer.isBuffer(chunk)) {
          chunks.push(chunk);
        } else {
          chunks.push(Buffer.from(chunk));
        }
      }
      console.log(`Get ${fileName} from R2`);
      return {
        code: Buffer.concat(chunks),
        type: ContentType as string
      };
    } else {
      console.log(`File ${fileName} not found in R2`);
      return undefined;
    }
  } catch (error) {
    console.error('Error getting object:', error);
    return undefined;
  }
}

/**
 * 
 * @param bucketName 
 * @param fileName 
 * @returns 
 */
export const getPutSignUrl = async (bucketName: string, fileName: string, expiresIn: number): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Metadata: {
      'Uploaded-By': 'payBox',
      // 'Upload-Date': new Date().toISOString(),
      'owner': 'paybox'
    }
  });

  try {
    const url = await getSignedUrl(cloud, command, { expiresIn });
    console.log(`Get signed url for ${fileName}`);
    return url;
  } catch (error) {
    console.error('Error getting signed url:', error);
    throw error;
  }
}

/**
 * 
 * @param bucketName 
 * @param key 
 * @param newKey 
 * @returns 
 */
export const updateKey = async (bucketName: string, key: string, newKey: string): Promise<string | undefined> => {
  const copyCommand = new CopyObjectCommand({
    Bucket: bucketName,
    CopySource: `${bucketName}/${key}`,
    Key: newKey,
    Metadata: {
      'Uploaded-By': 'payBox',
      // 'Upload-Date': new Date().toISOString(),
      'owner': 'paybox'
    }
  }) ;

  const deleteCommand = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key
  });

  try {
    const copy = await cloud.send(copyCommand);
    await cloud.send(deleteCommand);
    return copy.CopyObjectResult?.ETag;
  } catch (error) {
    console.error('Error updating the key:', error);
    throw error;
  }
}