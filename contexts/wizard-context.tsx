"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { WizardData } from "@/lib/types"

interface WizardContextType {
  data: WizardData
  updateData: (updates: Partial<WizardData>) => void
  resetData: () => void
}

const WizardContext = createContext<WizardContextType | undefined>(undefined)

const initialData: WizardData = {
  relationship: "",
  gender: undefined,
  ageRange: undefined,
  interests: [],
  budgetRange: undefined,
  specialPreferences: undefined,
}

export function WizardProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<WizardData>(initialData)

  const updateData = (updates: Partial<WizardData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }

  const resetData = () => {
    setData(initialData)
  }

  return <WizardContext.Provider value={{ data, updateData, resetData }}>{children}</WizardContext.Provider>
}

export function useWizard() {
  const context = useContext(WizardContext)
  if (context === undefined) {
    throw new Error("useWizard must be used within a WizardProvider")
  }
  return context
}
