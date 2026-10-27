import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email.toLowerCase().trim();
        const user = await db.user.findUnique({
          where: { email },
          include: { clientProfile: true },
        });
        if (!user || !user.password) return null;
        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
          onboarded: user.clientProfile?.onboarded ?? false,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.onboarded = (user as any).onboarded;
      }
      // refresh onboarding flag in case it changed after registration
      if (token.id) {
        const u = await db.user.findUnique({
          where: { id: token.id as string },
          include: { clientProfile: true },
        });
        if (u) {
          token.role = u.role;
          token.onboarded = u.clientProfile?.onboarded ?? false;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).onboarded = token.onboarded;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Extend the session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;
      onboarded?: boolean;
    };
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    onboarded?: boolean;
  }
}
