import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { authOptions } from "./util";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
