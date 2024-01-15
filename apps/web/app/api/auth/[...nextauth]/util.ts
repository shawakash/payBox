import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
    providers: [
      GitHubProvider({
        clientId: process.env.GITHUB_ID ?? "",
        clientSecret: process.env.GITHUB_SECRET ?? "",
      }),
      GoogleProvider({
        clientId: process.env.GOOGLE_ID ?? "",
        clientSecret: process.env.GOOGLE_SECRET ?? ""
      }),
    ],
  };