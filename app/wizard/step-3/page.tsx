"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useWizard } from "@/contexts/wizard-context"
import { Sparkles } from "lucide-react"

const budgetRanges = ["Under $25", "$25 - $50", "$50 - $100", "$100 - $200", "$200 - $500", "Over $500"]

export default function WizardStep3() {
  const router = useRouter()
  const { data, updateData } = useWizard()
  const [budgetRange, setBudgetRange] = useState(data.budgetRange || "")
  const [specialPreferences, setSpecialPreferences] = useState(data.specialPreferences || "")

  const handleGetResults = () => {
    updateData({
      budgetRange: budgetRange || undefined,
      specialPreferences: specialPreferences || undefined,
    })
    router.push("/recommendations")
  }

  const handlePrevious = () => {
    updateData({
      budgetRange: budgetRange || undefined,
      specialPreferences: specialPreferences || undefined,
    })
    router.push("/wizard/step-2")
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-indigo-50">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-base font-medium text-gray-600">Step 3 of 3</span>
              <span className="text-base font-medium text-gray-600">100%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                style={{ width: "100%" }}
              />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Final details</h1>
            <p className="text-lg text-gray-600">Let us know your budget and any special preferences</p>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Budget Range <span className="text-gray-400 text-base font-normal">(optional)</span>
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {budgetRanges.map((budget) => (
                  <button
                    key={budget}
                    onClick={() => setBudgetRange(budget)}
                    className={`p-3 border-2 rounded-xl text-base font-medium transition-all duration-200 ${
                      budgetRange === budget
                        ? "border-purple-500 text-purple-600 bg-purple-50"
                        : "border-gray-200 text-gray-700 hover:border-gray-300 bg-white"
                    }`}
                  >
                    {budget}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Special Preferences <span className="text-gray-400 text-base font-normal">(optional)</span>
              </h2>
              <Textarea
                placeholder="Any specific preferences, allergies, dislikes, or special considerations? For example: 'They love eco-friendly products' or 'No tech gadgets please'"
                value={specialPreferences}
                onChange={(e) => setSpecialPreferences(e.target.value)}
                className="min-h-[100px] resize-none text-base p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500"
              />
              <p className="text-sm text-gray-500">
                The more details you provide, the better our recommendations will be!
              </p>
            </div>

            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={handlePrevious} className="px-6 py-2 text-base bg-transparent">
                Previous
              </Button>
              <Button onClick={handleGetResults} className="px-6 py-2 text-base bg-purple-600 hover:bg-purple-700">
                <Sparkles className="mr-2 h-4 w-4" />
                Get Results
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
