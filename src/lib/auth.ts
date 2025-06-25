import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { UserRole } from '@/types'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Demo kullanıcılar - Supabase hazır olduğunda kaldırılacak
        const users = [
          {
            id: "1",
            email: "admin@example.com",
            password: "admin123",
            name: "Admin User",
            role: "admin" as UserRole
          },
          {
            id: "2", 
            email: "manager@example.com",
            password: "manager123",
            name: "Manager User",
            role: "manager" as UserRole
          },
          {
            id: "3",
            email: "user@example.com", 
            password: "user123",
            name: "Regular User",
            role: "user" as UserRole
          }
        ]

        const user = users.find(user => 
          user.email === credentials.email && 
          user.password === credentials.password
        )

        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        }

        return null
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
    error: "/error"
  },
  secret: process.env.NEXTAUTH_SECRET
}

declare module "next-auth" {
  interface User {
    id: string
    email: string
    name: string
    role: UserRole
  }

  interface Session {
    user: User
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
  }
}
