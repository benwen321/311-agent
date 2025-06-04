import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "../generated/prisma"

const prisma = new PrismaClient()

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    })
  ],
  callbacks: {
    async session({ session, user }) {
      if (session?.user && user) {
        // Fetch user with role from database
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            role: true,
            department: true,
            name: true,
            email: true
          }
        })
        
        if (dbUser) {
          session.user.id = dbUser.id
          session.user.role = dbUser.role
          session.user.department = dbUser.department
        }
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.department = user.department
      }
      return token
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error"
  }
})