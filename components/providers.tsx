"use client"

import { SessionProvider } from "next-auth/react"
import { AuthProvider } from "@/contexts/auth-context"
import { ListsProvider } from "@/contexts/lists-context"
import { WizardProvider } from "@/contexts/wizard-context"
import { type ReactNode } from "react"

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <AuthProvider>
        <ListsProvider>
          <WizardProvider>
            {children}
          </WizardProvider>
        </ListsProvider>
      </AuthProvider>
    </SessionProvider>
  )
}
