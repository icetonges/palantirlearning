// lib/auth.ts — NextAuth v5 configuration
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    // ── Google OAuth ──────────────────────────────────────────────────────────
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: { prompt: 'select_account' },
      },
    }),

    // ── Passphrase fallback ────────────────────────────────────────────────────
    Credentials({
      name: 'Passphrase',
      credentials: {
        passphrase: { label: 'Passphrase', type: 'password' },
      },
      async authorize(credentials) {
        if (credentials?.passphrase === process.env.PASSPHRASE) {
          return {
            id:    'owner',
            name:  'Platform Owner',
            email: process.env.OWNER_EMAIL!,
          }
        }
        return null
      },
    }),
  ],

  callbacks: {
    // Enforce owner-only access — only OWNER_EMAIL can authenticate
    async signIn({ user }) {
      return user.email === process.env.OWNER_EMAIL
    },

    async session({ session, token }) {
      if (session?.user) {
        session.user.isOwner = session.user.email === process.env.OWNER_EMAIL
      }
      return session
    },

    async jwt({ token, user }) {
      if (user) {
        token.isOwner = user.email === process.env.OWNER_EMAIL
      }
      return token
    },
  },

  pages: {
    signIn:  '/login',
    error:   '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge:   30 * 24 * 60 * 60, // 30 days
  },
})

// ─── Type augmentation ────────────────────────────────────────────────────────
declare module 'next-auth' {
  interface Session {
    user: {
      name?:    string | null
      email?:   string | null
      image?:   string | null
      isOwner?: boolean
    }
  }
}
