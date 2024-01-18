import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials"
import { use } from "react";
import { BACKEND_URL, Client } from "@paybox/common";
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
    })
  ],

  callbacks: {

    async jwt({ token, trigger, user, session }) {
      if (trigger == "update") {
        if (session.jwt || session.id) {
          token.id = session.id,
            token.jwt = session.jwt,
            token.firstname = session.firstname,
            token.lastname = session.lastname,
            token.username = session.username,
            token.email = session.email,
            token.chain = session.chain,
            token.mobile = session.mobile
        }
      }

      if (user) {
        console.log("jwt", user);
        //@ts-ignore
        if (token.jwt) {
          return token
        }



        /**
         * create client for provider
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
      console.log(token, "from session token")
      console.log(newSession, "from session")
      console.log(session, "from session")
      if (trigger == "update") {
        if (newSession?.jwt || newSession?.id) {
          //@ts-ignore
          session.id = newSession.id;
          //@ts-ignore
          session.jwt = newSession.jwt;
          //@ts-ignore
          session.firstname = newSession.firstname;
          //@ts-ignore
          session.lastname = newSession.lastname;
          //@ts-ignore
          session.username = newSession.username;
          //@ts-ignore
          session.email = newSession.email;
          //@ts-ignore
          session.chain = newSession.chain;
          //@ts-ignore
          session.mobile = newSession.mobile;
        }
      }
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
      return session;
    }
  }
};