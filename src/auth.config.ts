import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByCredential } from "./lib/data/user";
import bcrypt from "bcryptjs";
import type { NextAuthConfig, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

export default {
  callbacks: {
    async session({session, token}: { session: Session; token?: JWT }){
        if(token){
            session.user.id = token.sub;
            session.user.name = token.name;
            session.user.username = token.username;
            session.user.email = token.email;
        }
        return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id?.toString();
        token.name =  user.firstName;
        token.username = user.username;
        token.email = user.email;
      }
      return token;
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const user = await getUserByCredential(credentials.username as string);
        if (!user || !user.password) return null;

        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (passwordsMatch){
            delete user.password;
            return user;
        }
        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;
