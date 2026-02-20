import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        // Advanced Rate Limiting: IP + Email
        const { isRateLimited } = await import('./rateLimit');
        const ip = req?.headers?.['x-forwarded-for'] || req?.headers?.['x-real-ip'] || 'unknown';
        const limitKey = `login:${ip}:${credentials.email}`;

        // Sıkı limit: 1 dakikada 5 deneme
        const limited = await isRateLimited(limitKey, 5, 60);
        if (limited) {
          throw new Error("Çok fazla başarısız deneme. Lütfen 1 dakika bekleyin.");
        }

        const { recordLoginAttempt } = await import('./metrics');
        const start = Date.now();
        let success = false;
        let lastError: string | undefined;

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
            select: {
              id: true,
              email: true,
              password: true,
              role: true,
            }
          })

          if (!user || !user.password) {
            lastError = "User not found";
            throw new Error("Invalid credentials")
          }

          const isCorrectPassword = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isCorrectPassword) {
            lastError = "Wrong password";
            throw new Error("Invalid credentials")
          }

          success = true;
          return user
        } catch (error) {
          lastError = lastError || (error as Error).message;
          throw error;
        } finally {
          const latency = Date.now() - start;
          await recordLoginAttempt(success, latency, lastError);
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string // Custom field
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role // Custom field from User model
      }
      return token
    },
  },
}
