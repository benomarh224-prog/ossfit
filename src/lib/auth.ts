import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { allowRequest, requestIp } from "@/lib/rate-limit";
import { isSessionCurrent } from "@/lib/account-security";
import { loginPortalAllowsRole } from "@/lib/login-access";
import { SESSION_MAX_AGE } from "@/lib/session-policy";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: SESSION_MAX_AGE },
  jwt: { maxAge: SESSION_MAX_AGE },
  pages: {
    signIn: "/",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        portal: { label: "Portal", type: "hidden" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;
        if (credentials.password.length > 256 || credentials.email.length > 254) return null;
        const headers = new Headers(Object.entries(req.headers ?? {}).map(([key, value]): [string, string] => [key, Array.isArray(value) ? value.join(",") : String(value ?? "")]));
        if (!await allowRequest("login", requestIp(headers), 30, 15 * 60 * 1000)) return null;
        const email = credentials.email.toLowerCase().trim();
        const user = await db.user.findUnique({
          where: { email },
          include: { clientProfile: true },
        });
        if (!user || !user.password) return null;
        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;
        if (!loginPortalAllowsRole(user.role, credentials.portal)) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
          sessionVersion: user.sessionVersion,
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
        token.sessionVersion = (user as any).sessionVersion;
      }
      // Check revocation before refreshing role and onboarding data.
      if (token.id) {
        const u = await db.user.findUnique({
          where: { id: token.id as string },
          include: { clientProfile: true },
        });
        if (u && isSessionCurrent(token.sessionVersion, u.sessionVersion)) {
          token.role = u.role;
          token.email = u.email;
          token.onboarded = u.clientProfile?.onboarded ?? false;
        } else {
          token.id = undefined;
          token.role = undefined;
          token.email = undefined;
          token.onboarded = false;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id ?? "";
        (session.user as any).role = token.role ?? "";
        (session.user as any).onboarded = token.onboarded;
        session.user.sessionVersion = token.sessionVersion ?? 0;
        session.user.email = token.email ?? "";
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
      sessionVersion: number;
      onboarded?: boolean;
    };
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    onboarded?: boolean;
    sessionVersion?: number;
  }
}
