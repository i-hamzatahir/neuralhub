import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/lib/auth/auth.config";
import { createAuditLog } from "@/lib/auth/audit";
import { verifyPassword } from "@/lib/auth/password";
import { generateUniqueUsername } from "@/lib/auth/tokens";
import { prisma } from "@/lib/db/prisma";
import { loginSchema } from "@/lib/validations/auth";

declare module "next-auth" {
  interface JWT {
    sessionVersion?: number;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const normalizedEmail = email.toLowerCase();

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!user || !user.passwordHash) {
          await createAuditLog({
            action: "LOGIN_FAILED",
            metadata: { email: normalizedEmail, reason: "user_not_found" },
          });
          return null;
        }

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) {
          await createAuditLog({
            action: "LOGIN_FAILED",
            userId: user.id,
            metadata: { email: normalizedEmail, reason: "invalid_password" },
          });
          return null;
        }

        if (!user.emailVerified) {
          return null;
        }

        await createAuditLog({
          action: "LOGIN",
          userId: user.id,
          metadata: { method: "credentials" },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image ?? user.avatar,
          role: user.role,
          username: user.username,
          sessionVersion: user.sessionVersion,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider !== "credentials" && user.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (dbUser) {
          await prisma.user.update({
            where: { id: dbUser.id },
            data: {
              emailVerified: new Date(),
              image: user.image ?? dbUser.image,
              avatar: user.image ?? dbUser.avatar,
              name: user.name ?? dbUser.name,
            },
          });
        }

        await createAuditLog({
          action: "LOGIN",
          userId: dbUser?.id ?? user.id,
          metadata: { method: account?.provider },
        });
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role =
          (user as { role?: string }).role ??
          (
            await prisma.user.findUnique({
              where: { id: user.id! },
              select: { role: true, username: true },
            })
          )?.role ??
          "USER";
        token.username =
          (user as { username?: string }).username ??
          (
            await prisma.user.findUnique({
              where: { id: user.id! },
              select: { username: true },
            })
          )?.username ??
          "";
        token.sessionVersion =
          (user as { sessionVersion?: number }).sessionVersion ?? 0;
      }

      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, username: true, sessionVersion: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.username = dbUser.username;
          if (
            typeof token.sessionVersion === "number" &&
            dbUser.sessionVersion !== token.sessionVersion
          ) {
            return null;
          }
          token.sessionVersion = dbUser.sessionVersion;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as typeof session.user.role;
        session.user.username = token.username as string;
      }
      return session;
    },
    authorized: authConfig.callbacks?.authorized,
  },
  events: {
    async signOut(message) {
      if ("token" in message && message.token?.id) {
        await createAuditLog({
          action: "LOGOUT",
          userId: message.token.id as string,
        });
      }
    },
    async createUser({ user }) {
      if (!user.email) return;

      const username = await generateUniqueUsername(user.email.split("@")[0]);

      await prisma.user.update({
        where: { id: user.id! },
        data: {
          username,
          emailVerified: new Date(),
          avatar: user.image,
          image: user.image,
        },
      });

      await prisma.userSettings.create({
        data: { userId: user.id! },
      });
    },
  },
});
