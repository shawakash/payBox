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
    }),
    CredentialsProvider({
      credentials: {
      },
      async authorize(_credentials, req) {
        const user = {
          name: req.body?.name,
          email: req.body?.email,
          id: req.body?.id,
          jwt: req.body?.jwt
        }
  
        // If no error and we have user data, return it
        if (user) {
          return user
        }
        // Return null if user data could not be retrieved
        return null
      }
    })
  ],
  pages: {
    signIn: '/signin'
  },
  callbacks: {
    async signIn({user, account, profile}) {
      try {
        //@ts-ignore
        if(user.jwt) {
          return true
        }
        if(user.email) {
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
          //@ts-ignore
          user.username = response.username;
          //@ts-ignore
          user.firstname = response.firstname;
          //@ts-ignore
          user.jwt = response.jwt;
          user.id = response.id;
          return true;
        }
        return true; 
        
      } catch (error) {
        console.log(error);
        return true;
      }
    },
    // jwt({ token, trigger, session }) {
    //   if (trigger === "update" && session?.name) {
    //     // Note, that `session` can be any arbitrary object, remember to validate it!
    //     token.name = session.name;
    //     token.email = session.email;
    //   }
    //   return token
    // }
    // async session({user, session}) {
    //   //@ts-ignore
    //   if(user.jwt) {
    //     return session;
    //   }
    //   const response = await fetch(`${BACKEND_URL}/client?email=${user.email}`, {

    //   })
    //   return session;
    // }
  }
  };