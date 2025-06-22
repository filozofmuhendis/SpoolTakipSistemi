import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from "./supabase";
import { UserRole } from '@/types'

// Initialize Supabase client
export const supabaseClient = supabase;

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

        try {
          // Supabase auth kontrolü
          const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          })

          if (authError) {
            console.error('Auth error:', authError)
            return null
          }

          if (!user?.id) {
            return null
          }

          // Profil bilgilerini al
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (profileError) {
            console.error('Profile error:', profileError)
            return null
          }

          if (!profile) {
            return null
          }

          return {
            id: user.id,
            email: user.email!,
            name: profile.name,
            role: profile.role as UserRole
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
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