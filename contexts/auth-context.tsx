"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useRef } from "react"
import { useSession, signIn, signOut, getSession } from "next-auth/react"
import type { User, AuthState } from "@/lib/types"
import { toast } from "@/hooks/use-toast"

interface ExtendedAuthState extends AuthState {
  googleLogin: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
}

const AuthContext = createContext<ExtendedAuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status, update } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const previousUser = useRef<User | null>(null)

  useEffect(() => {
    if (status !== "loading") {
      setIsLoading(false)
    }
    // 如果正在认证过程中，保持loading状态
    if (status === "loading") {
      setIsLoading(true)
    }
    
    // 强制刷新 session，特别是在页面加载时
    if (status === "unauthenticated" && !session) {
      getSession().catch(console.error)
    }
  }, [status, session])

  // 添加一个定期检查 session 的机制
  useEffect(() => {
    const interval = setInterval(async () => {
      if (status === "unauthenticated" && !session) {
        try {
          await update()
        } catch (error) {
          console.error("Failed to update session:", error)
        }
      }
    }, 2000) // 每2秒检查一次

    return () => clearInterval(interval)
  }, [status, session, update])

  // Debug: Log session data
  useEffect(() => {
    console.log("AuthContext - Session status:", status)
    console.log("AuthContext - Session data:", session)
    if (session?.user) {
      console.log("AuthContext - User data:", {
        id: (session.user as any).id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image
      })
    }
  }, [session, status])



  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      if (!result?.ok) {
        throw new Error("Login failed")
      }
    } catch (error) {
      throw new Error("Invalid credentials")
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      // After successful registration, sign in the user
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  const googleLogin = async () => {
    try {
      // 直接重定向到Google登录，不使用async/await
      await signIn("google", { callbackUrl: window.location.origin })
    } catch (error) {
      throw new Error("Google login failed")
    }
  }

  const resetPassword = async (email: string) => {
    setIsLoading(true)
    try {
      // Simulate password reset email
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In a real app, this would send an email
      console.log(`Password reset email sent to: ${email}`)
    } catch (error) {
      throw new Error("Password reset failed")
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    signOut({ redirect: false })
  }

  // Transform NextAuth session to our User type
  const user: User | null = session?.user ? {
    id: (session.user as any).id || session.user.email || "",
    email: session.user.email || "",
    name: session.user.name || "",
    image: session.user.image || "",
  } : null

  // Debug: Log transformed user data
  useEffect(() => {
    console.log("AuthContext - Transformed user:", user)
  }, [user])

  // Show login success toast when user logs in
  useEffect(() => {
    // 如果之前没有用户，现在有用户了，说明刚刚登录成功
    if (!previousUser.current && user && status === "authenticated") {
      toast({
        title: "Welcome!",
        description: `Hello ${user.name || user.email}! You've successfully logged in.`,
      })
    }
    previousUser.current = user
  }, [user, status])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        register,
        googleLogin,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
