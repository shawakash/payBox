import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials"
import { use } from "react";
import { BACKEND_URL, Client, responseStatus } from "@paybox/common";
import { headers } from "next/headers";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
      profile(profile) {
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          username: profile.login,
          image: profile.avatar_url
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID ?? "",
      clientSecret: process.env.GOOGLE_SECRET ?? "",
      profile(profile) {
        const username = profile.email.toString().split("@")[0];
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          username: username
        }
      }
    }),
    CredentialsProvider({
      credentials: {},
      async authorize(_credentials, req) {
        (req.body);
        const response = await fetch(`${BACKEND_URL}/client/`, {
          method: "post",
          headers: {
            "Content-type": "application/json"
          },
          body: JSON.stringify(req.body),
          cache: "no-store"
        }).then(res => res.json());
        if (response.status == responseStatus.Error) {
          return null;
        }
        const user = {
          id: response.id,
          jwt: response.jwt,
          firstname: req.body?.firstname,
          lastname: req.body?.lastname,
          username: req.body?.username,
          email: req.body?.email,
          chain: response.chain,
          mobile: req.body?.mobile
        }

        if (user.jwt) {
          return user;
        }
        return null;
      }
    })
  ],

  callbacks: {

    async jwt({ token, trigger, user, session }) {

      if (user) {

        /**
         * For credential provider
         */
        //@ts-ignore
        if (user.jwt) {
          //@ts-ignore
          token.id = user.id;
          //@ts-ignore
          token.jwt = user.jwt;
          //@ts-ignore
          token.firstname = user.firstname;
          //@ts-ignore
          token.lastname = user.lastname;
          //@ts-ignore
          token.username = user.username;
          //@ts-ignore
          token.email = user.email;
          //@ts-ignore
          token.chain = user.chain;
          //@ts-ignore
          token.mobile = user.mobile;
        }
        //@ts-ignore
        if (token.jwt) {
          return token
        }



        /**
         * create client for third-party provider
         */
        //@ts-ignore
        const body = {
          //@ts-ignore
          username: user.username || "",
          firstname: user.name?.split(" ")[0] || "",
          lastname: user.name?.split(" ")[1] || "",
          email: user.email || "",
          password: user.id.toString() || ""
        };
        const response = await fetch(`${BACKEND_URL}/client/providerAuth`, {
          method: "post",
          headers: {
            "Content-type": "application/json"
          },
          body: JSON.stringify(body)
        }).then(res => res.json());
        token.jwt = response.jwt;
        token.id = response.id;
        token.firstname = user.name?.split(" ")[0];
        token.lastname = user.name?.split(" ")[1];
        token.email = response.email;
        token.mobile = response.mobile;
        token.chain = response.chain;

        /**
         * Fetch the jwt
         */
        return {
          ...token,
          id: response.id,
          jwt: response.jwt,
          firstname: response.firstname,
          lastname: response.lastname,
          username: response.username,
          email: response.email,
          chain: response.chain,
          mobile: response.mobile
        }

      }
      return token;
    },
    async session({ user, session, token, trigger, newSession }) {
      /**
       * \Add the jwt from token to user
       */
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          jwt: token.jwt,
          firstname: token.firstname,
          lastname: token.lastname,
          username: token.username,
          email: token.email,
          chain: token.chain,
          mobile: token.mobile
        }
      }
    }
  }
};