import { importPKCS8, importSPKI, jwtVerify, SignJWT } from "jose";
import bcryptjs from "bcryptjs";
import { AUTH_JWT_PRIVATE_KEY, JWT_ALGO } from "@paybox/common";

export const createJwt = async (
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
    
    return jwt;
  };