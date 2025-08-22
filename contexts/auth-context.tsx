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
    // 如果正在认证过程中，保持loading状态
    if (status === "loading") {
      setIsLoading(true)
      return
    }
    
    // 如果认证完成，停止loading
    if (status === "authenticated" || status === "unauthenticated") {
      setIsLoading(false)
    }
    
    // 强制刷新 session，特别是在页面加载时
    if (status === "unauthenticated" && !session) {
      getSession().catch(console.error)
    }
  }, [status, session])

  // 只在必要时更新session
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    
    // 只在loading状态持续较长时间时才强制更新
    if (status === "loading") {
      timeoutId = setTimeout(async () => {
        try {
          await update()
        } catch (error) {
          console.error("Failed to force update session:", error)
        }
      }, 5000) // 增加到5秒，减少频繁更新
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [status, update])

  // 检查URL参数，处理Google登录回调（只在组件挂载时执行一次）
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const error = urlParams.get('error')
    const callbackUrl = urlParams.get('callbackUrl')
    
    // 如果有错误，显示错误信息
    if (error) {
      console.error("Auth error from URL:", error)
      toast({
        title: "Login Error",
        description: "There was an error during login. Please try again.",
        variant: "destructive",
      })
    }
    
    // 如果是登录回调，强制更新session
    if (callbackUrl && status === "loading") {
      update().catch(console.error)
    }
  }, []) // 只在组件挂载时执行一次

  // Debug: Log session data (只在开发环境下显示)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (session?.user) {
        console.log("AuthContext - User data:", {
          id: (session.user as any).id,
          email: session.user.email,
          name: session.user.name,
          image: session.user.image
        })
      }
    }
  }, [session])



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
      setIsLoading(true)
      // 使用callbackUrl确保重定向回当前页面
      await signIn("google", { 
        callbackUrl: window.location.href,
        redirect: true 
      })
    } catch (error) {
      setIsLoading(false)
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

  // Debug: Log transformed user data (只在开发环境下显示)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && user) {
      console.log("AuthContext - Transformed user:", user)
    }
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
