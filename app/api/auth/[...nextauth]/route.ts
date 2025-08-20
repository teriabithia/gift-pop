import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "../../../../lib/prisma"
import bcrypt from "bcryptjs"

const handler = NextAuth({
  // 暂时移除PrismaAdapter，使用JWT策略
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
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
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (!user || !(user as any).password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, (user as any).password)

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: (user as any).image,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],

  pages: {
    signIn: "/",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // 手动处理Google用户创建或更新
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })

          if (!existingUser) {
            // 创建新用户
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                provider: "google",
                providerId: account.providerAccountId,
              }
            })
            console.log("Created new Google user:", user.email)
          } else {
            console.log("Google user already exists:", user.email)
          }
          return true
        } catch (error) {
          console.error("Error handling Google sign in:", error)
          return false
        }
      }
      return true
    },
    async session({ session, user }) {
      if (user && session.user) {
        (session.user as any).id = user.id
        session.user.email = user.email
        session.user.name = user.name
        session.user.image = user.image
        console.log("Session callback - User session created:", { 
          id: (session.user as any).id, 
          email: session.user.email 
        })
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
})

export { handler as GET, handler as POST }

// 修复Edge运行时问题 - bcrypt和prisma需要Node.js环境
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
