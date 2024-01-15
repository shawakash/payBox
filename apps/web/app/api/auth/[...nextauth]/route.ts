import NextAuth, { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import GitHubProvider from "next-auth/providers/github";
import { importPKCS8, importSPKI, jwtVerify, SignJWT } from "jose";
import { AUTH_JWT_PRIVATE_KEY, AUTH_JWT_PUBLIC_KEY, JWT_ALGO } from "@paybox/common";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
  ],

  jwt: {

    // async decode(jwt: string) {
    //   const publicKey = await importSPKI(AUTH_JWT_PUBLIC_KEY, JWT_ALGO);
    //   const payload = await jwtVerify(jwt, publicKey, {
    //     issuer: "shawakash",
    //     audience: "payBox",
    //   })
    // },

    // async encode(
    //   req: Request,
    //   res: Response,
    //   userId: string
    // ) {
    //   const secret = await importPKCS8(AUTH_JWT_PRIVATE_KEY, JWT_ALGO);

    //   const jwt = await new SignJWT({
    //     sub: userId,
    //   })
    //     .setProtectedHeader({
    //       alg: JWT_ALGO
    //     })
    //     .setIssuer("shawakash")
    //     .setAudience("payBox")
    //     .setIssuedAt()
    //     .sign(secret);

    //   return jwt;
    // }


  },
};

export const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };