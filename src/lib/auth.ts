import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";

const providers: NextAuthOptions["providers"] = [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    authorization: {
      params: {
        scope:
          "openid email profile https://www.googleapis.com/auth/calendar.events",
        access_type: "offline",
        prompt: "consent",
      },
    },
  }),
];

// Dev-only credentials provider for testing without Google OAuth
if (process.env.NODE_ENV !== "production") {
  providers.push(
    CredentialsProvider({
      id: "dev-login",
      name: "Dev Login",
      credentials: {
        email: { label: "Email", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        // Find or create dev user
        const user = await prisma.user.upsert({
          where: { googleId: "dev-test-user" },
          update: {},
          create: {
            email: credentials.email,
            name: "Test User",
            googleId: "dev-test-user",
            image: null,
            googleTokens: undefined,
          },
        });
        return { id: user.googleId, email: user.email, name: user.name };
      },
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ account, profile, credentials }) {
      // Dev credentials login — user already created by authorize()
      if (account?.provider === "dev-login") return true;

      if (!account || !profile?.email) return false;

      // Upsert user on every sign-in
      await prisma.user.upsert({
        where: { googleId: account.providerAccountId },
        update: {
          name: profile.name,
          image: (profile as { picture?: string }).picture,
          email: profile.email,
          googleTokens: JSON.stringify({
            access_token: account.access_token,
            expiry_date: account.expires_at
              ? account.expires_at * 1000
              : undefined,
            // Only store refresh_token if present (Google only sends on consent)
            ...(account.refresh_token && {
              refresh_token: account.refresh_token,
            }),
          }),
        },
        create: {
          email: profile.email,
          name: profile.name,
          image: (profile as { picture?: string }).picture,
          googleId: account.providerAccountId,
          googleTokens: JSON.stringify({
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expiry_date: account.expires_at
              ? account.expires_at * 1000
              : undefined,
          }),
        },
      });

      return true;
    },

    async jwt({ token, account, profile, user }) {
      // On initial sign-in, set sub to Google provider ID so session callback
      // can look up user by googleId
      if (account) {
        if (account.provider === "dev-login") {
          // For dev credentials, the authorize() returns { id: googleId }
          token.sub = user?.id ?? "dev-test-user";
          token.email = user?.email ?? "testuser@chapter-agent.dev";
        } else {
          token.sub = account.providerAccountId;
          token.email = profile?.email ?? "";
        }
      }
      return token;
    },

    async session({ session, token }) {
      const user = await prisma.user.findUnique({
        where: { googleId: token.sub },
        select: { id: true, email: true, name: true, image: true },
      });

      if (user) {
        session.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      }

      return session;
    },
  },
};
