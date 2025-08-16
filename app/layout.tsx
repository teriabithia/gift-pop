import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { ListsProvider } from "@/contexts/lists-context"
import { WizardProvider } from "@/contexts/wizard-context"
import { Navigation } from "@/components/navigation"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "GiftPop - Find the Perfect Gift",
  description: "AI-powered gift recommendations to help you find the perfect gift for any occasion.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="font-sans">
        <AuthProvider>
          <ListsProvider>
            <WizardProvider>
              <Navigation />
              <main className="pt-16">{children}</main>
              <Toaster />
            </WizardProvider>
          </ListsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
