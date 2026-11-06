import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@repo/db";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "./email/resend";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      httpOptions: {
        timeout: 10000,
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      httpOptions: {
        timeout: 10000,
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("No user found with this email");
        }

        if (!user.password) {
          throw new Error("Please sign in with the provider you used to sign up (e.g. Google/GitHub)");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Incorrect password");
        }

        return {
          id: user.id,
          email: user.email,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("[NextAuth] Session callback token:", token);
      console.log("[NextAuth] Session callback original session:", session);
      if (token && session.user) {
        const userId = token.id || token.sub;
        // @ts-expect-error adding custom id to session
        session.user.id = userId;

        if (userId) {
          const dbUser = await prisma.user.findUnique({
            where: { id: userId as string },
            select: {
              emailVerified: true,
              plan: true,
              dayCutoffHour: true,
              hasCompletedOnboarding: true,
            },
          });
          session.user.emailVerified = dbUser?.emailVerified || null;
          session.user.plan = dbUser?.plan || 'STARTER';
          session.user.dayCutoffHour = dbUser?.dayCutoffHour ?? 0;
          session.user.hasCompletedOnboarding = Boolean(dbUser?.hasCompletedOnboarding);
        }
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      try {
        if (user.id) {
          await prisma.userGamification.create({
            data: {
              userId: user.id,
              totalXp: 0,
              level: 1,
              sparksBalance: 150,
            },
          });
        }

        if (user.email) {
          const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3001";
          await sendWelcomeEmail({
            email: user.email,
            name: user.name,
            verificationUrl: `${baseUrl}/dashboard`,
          });
        }
      } catch (err) {
        console.error("[NextAuth createUser Event Error]:", err);
      }
    },
  },
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
  },
  secret: process.env.NEXTAUTH_SECRET || "supersecret",
};
