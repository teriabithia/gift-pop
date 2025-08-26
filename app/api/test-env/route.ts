import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID ? "✅ Loaded" : "❌ Missing",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? "✅ Loaded" : "❌ Missing",
    nextAuthSecret: process.env.NEXTAUTH_SECRET ? "✅ Loaded" : "❌ Missing",
    nextAuthUrl: process.env.NEXTAUTH_URL ? "✅ Loaded" : "❌ Missing",
    nodeEnv: process.env.NODE_ENV || "Not set",
    allEnvVars: {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + "...",
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET?.substring(0, 20) + "...",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET?.substring(0, 20) + "...",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    }
  })
}
