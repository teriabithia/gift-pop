"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User, AuthState } from "@/lib/types"

interface ExtendedAuthState extends AuthState {
  googleLogin: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<ExtendedAuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const savedUser = localStorage.getItem("giftpop-user")
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error("Failed to parse saved user:", error)
        localStorage.removeItem("giftpop-user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock login validation
      if (email === "demo@giftpop.com" && password === "password") {
        const mockUser: User = {
          id: "1",
          email,
          name: "Demo User",
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        }
        setUser(mockUser)
        localStorage.setItem("giftpop-user", JSON.stringify(mockUser))
      } else {
        throw new Error("Invalid credentials")
      }
    } catch (error) {
      throw new Error("Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock registration - replace with real authentication
      const mockUser: User = {
        id: Date.now().toString(),
        email,
        name,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      }
      setUser(mockUser)
      localStorage.setItem("giftpop-user", JSON.stringify(mockUser))
    } catch (error) {
      throw new Error("Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  const googleLogin = async () => {
    setIsLoading(true)
    try {
      // Simulate Google OAuth flow
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const mockGoogleUser: User = {
        id: "google_" + Date.now(),
        email: "user@gmail.com",
        name: "Google User",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=google",
      }
      setUser(mockGoogleUser)
      localStorage.setItem("giftpop-user", JSON.stringify(mockGoogleUser))
    } catch (error) {
      throw new Error("Google login failed")
    } finally {
      setIsLoading(false)
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
    setUser(null)
    localStorage.removeItem("giftpop-user")
  }

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
