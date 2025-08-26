import { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt" // 使用JWT策略以兼容CredentialsProvider
  },
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

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: (user as any).image, // Type assertion for image field
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

  cookies: { // 显式配置cookies以确保JWT正常工作
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },

  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          })
          
          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                provider: "google",
                providerId: account.providerAccountId,
              }
            })
          }
          return true
        } catch (error) {
          console.error("Error handling Google sign in:", error)
          return false
        }
      }
      return true
    },
    
    async jwt({ token, user, account }: any) {
      if (user) {
        // 对于Google登录，需要通过email查找数据库中的真实用户ID
        if (account?.provider === "google") {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { email: user.email! }
            })
            if (dbUser) {
              token.id = dbUser.id // 使用数据库中的用户ID
              console.log("JWT callback - Google user, using DB ID:", dbUser.id)
            } else {
              console.error("JWT callback - Google user not found in DB:", user.email)
            }
          } catch (error) {
            console.error("JWT callback - Error fetching user:", error)
          }
        } else {
          // 对于credentials登录，直接使用用户ID
          token.id = user.id
          console.log("JWT callback - Credentials user, using user ID:", user.id)
        }
      }
      return token
    },
    
    async session({ session, token }: any) {
      if (token && session.user) {
        // 如果token中没有正确的用户ID，通过email查找数据库用户
        if (!token.id || typeof token.id === 'string' && token.id.length > 20) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { email: session.user.email! }
            })
            if (dbUser) {
              (session.user as any).id = dbUser.id
              console.log("Session callback - Found DB user by email:", { 
                id: dbUser.id, 
                email: session.user.email 
              })
            } else {
              console.error("Session callback - No DB user found for:", session.user.email)
            }
          } catch (error) {
            console.error("Session callback - Error fetching user:", error)
          }
        } else {
          (session.user as any).id = token.id // 使用token中的用户ID
          console.log("Session callback - Using token ID:", { 
            id: token.id, 
            email: session.user.email 
          })
        }
      }
      return session
    }
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

// 运行时配置
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
