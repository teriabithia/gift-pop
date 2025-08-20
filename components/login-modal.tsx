"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react"

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLoginSuccess?: () => void
}

export function LoginModal({ open, onOpenChange, onLoginSuccess }: LoginModalProps) {
  const { login, register, isLoading, googleLogin, resetPassword } = useAuth()
  const { toast } = useToast()
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [registerData, setRegisterData] = useState({ email: "", password: "", name: "" })
  const [resetEmail, setResetEmail] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(loginData.email, loginData.password)
      onOpenChange(false)
      onLoginSuccess?.()
      toast({
        title: "Welcome back!",
        description: "You've been successfully logged in.",
      })
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      })
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await register(registerData.email, registerData.password, registerData.name)
      onOpenChange(false)
      onLoginSuccess?.()
      toast({
        title: "Welcome to GiftPop!",
        description: "Your account has been created successfully.",
      })
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Please try again with different details.",
        variant: "destructive",
      })
    }
  }

  const handleGoogleLogin = async () => {
    try {
      // Google登录会重定向，不需要在这里显示成功toast
      // toast会在AuthContext中用户状态变化时显示
      await googleLogin()
      onOpenChange(false)
      onLoginSuccess?.()
    } catch (error) {
      toast({
        title: "Google login failed",
        description: "Please try again or use email login.",
        variant: "destructive",
      })
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await resetPassword(resetEmail)
      toast({
        title: "Reset email sent!",
        description: "Check your email for password reset instructions.",
      })
      setShowForgotPassword(false)
      setResetEmail("")
    } catch (error) {
      toast({
        title: "Reset failed",
        description: "Please check your email address and try again.",
        variant: "destructive",
      })
    }
  }

  if (showForgotPassword) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-sm rounded-2xl border-gray-100 shadow-[0_25px_50px_rgba(0,0,0,0.25)] p-8">
          <DialogHeader className="text-center pb-2">
            <DialogTitle className="text-lg font-bold text-gray-900">Reset Password</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Enter your email address and we'll send you a reset link.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleForgotPassword} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="reset-email" className="text-xs font-medium text-gray-900">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="Enter your email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="pl-9 h-10 rounded-xl border-gray-200 text-sm focus:ring-2 focus:ring-purple-primary focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="submit" className="flex-1 h-9 text-sm" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-9 text-sm"
                onClick={() => setShowForgotPassword(false)}
              >
                Back
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm rounded-2xl border-gray-100 shadow-[0_25px_50px_rgba(0,0,0,0.25)] p-8">
        <DialogHeader className="text-center pb-2">
          <DialogTitle className="text-xl font-bold text-gray-900">Welcome to GiftPop</DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Sign in to save your gift lists and get personalized recommendations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Button
            variant="secondary"
            className="w-full h-10 text-sm font-medium border-2 border-gray-200 hover:border-gray-300"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full bg-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500 font-medium tracking-wide">Or continue with email</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-xl p-1 h-9">
            <TabsTrigger value="login" className="rounded-lg text-sm font-medium">
              Login
            </TabsTrigger>
            <TabsTrigger value="register" className="rounded-lg text-sm font-medium">
              Register
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-3 mt-3">
            <form onSubmit={handleLogin} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="login-email" className="text-xs font-medium text-gray-900">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="pl-9 h-10 rounded-xl border-gray-200 text-sm focus:ring-2 focus:ring-purple-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="login-password" className="text-xs font-medium text-gray-900">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="pl-9 pr-9 h-10 rounded-xl border-gray-200 text-sm focus:ring-2 focus:ring-purple-primary focus:border-transparent"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 rounded-lg hover:bg-gray-100"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="link"
                  className="px-0 text-xs text-purple-primary hover:text-purple-primary-dark h-auto"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot password?
                </Button>
              </div>
              <Button type="submit" className="w-full h-10 text-sm font-medium" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-3 mt-3">
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="register-name" className="text-xs font-medium text-gray-900">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    className="pl-9 h-10 rounded-xl border-gray-200 text-sm focus:ring-2 focus:ring-purple-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="register-email" className="text-xs font-medium text-gray-900">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="Enter your email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="pl-9 h-10 rounded-xl border-gray-200 text-sm focus:ring-2 focus:ring-purple-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="register-password" className="text-xs font-medium text-gray-900">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="register-password"
                    type={showRegisterPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="pl-9 pr-9 h-10 rounded-xl border-gray-200 text-sm focus:ring-2 focus:ring-purple-primary focus:border-transparent"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 rounded-lg hover:bg-gray-100"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  >
                    {showRegisterPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full h-10 text-sm font-medium" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
