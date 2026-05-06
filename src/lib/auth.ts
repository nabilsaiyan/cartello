import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { signInSchema } from "@/lib/validations"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/sign-in",
  },
  providers: [
    Google({ allowDangerousEmailAccountLinking: true }),
    GitHub({ allowDangerousEmailAccountLinking: true }),
    Credentials({
      async authorize(credentials) {
        const parsed = signInSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        })
        if (!user?.password) return null

        const valid = await bcrypt.compare(parsed.data.password, user.password)
        if (!valid) return null

        return user
      },
    }),
  ],
  callbacks: {
    jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role
      }
      if (account?.provider === "google" && profile) {
        const p = profile as { name?: string; picture?: string }
        if (p.name) token.name = p.name
        if (p.picture) token.picture = p.picture
      }
      if (account?.provider === "github" && profile) {
        const p = profile as { name?: string; login?: string; avatar_url?: string }
        token.name = p.name ?? p.login ?? token.name
        token.picture = p.avatar_url ?? token.picture
      }
      return token
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        if (token.picture) session.user.image = token.picture as string
      }
      return session
    },
  },
})
