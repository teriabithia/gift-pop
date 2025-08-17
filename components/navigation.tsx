"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { LoginModal } from "./login-modal"
import { Gift, LogOut, User } from "lucide-react"

export function Navigation() {
  const { user, logout } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 backdrop-blur-lg bg-white/95">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 font-bold text-2xl text-purple-primary">
              <div className="p-2 bg-purple-primary/10 rounded-2xl">
                <Gift className="h-6 w-6" />
              </div>
              GiftPop
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/popular"
                className="text-gray-700 hover:text-purple-primary transition-colors duration-200 font-medium"
              >
                Popular Gifts
              </Link>
              <Link
                href="/occasions"
                className="text-gray-700 hover:text-purple-primary transition-colors duration-200 font-medium"
              >
                Gifts by Occasions
              </Link>
              <Link
                href="/faq"
                className="text-gray-700 hover:text-purple-primary transition-colors duration-200 font-medium"
              >
                FAQ
              </Link>
              {user && (
                <Link
                  href="/my-lists"
                  className="text-gray-700 hover:text-purple-primary transition-colors duration-200 font-medium"
                >
                  My Lists
                </Link>
              )}
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-3 p-2 rounded-2xl hover:bg-gray-50">
                      <Avatar className="h-10 w-10 ring-2 ring-purple-primary/20">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                        <AvatarFallback className="bg-purple-primary/10 text-purple-primary font-semibold">
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:inline font-medium text-gray-900">{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-2xl border-gray-100 shadow-lg">
                    <DropdownMenuItem
                      onClick={logout}
                      className="flex items-center gap-3 p-3 rounded-xl text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => setShowLoginModal(true)} size="lg" className="shadow-lg">
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </>
  )
}
