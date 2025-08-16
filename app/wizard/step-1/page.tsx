"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useWizard } from "@/contexts/wizard-context"

const relationships = [
  "Mother",
  "Father",
  "Sister",
  "Brother",
  "Daughter",
  "Son",
  "Grandmother",
  "Grandfather",
  "Wife",
  "Husband",
  "Girlfriend",
  "Boyfriend",
  "Friend",
  "Colleague",
  "Teacher",
  "Boss",
  "Other",
]

const genders = ["Male", "Female", "Non-binary", "Prefer not to say"]

export default function WizardStep1() {
  const router = useRouter()
  const { data, updateData } = useWizard()
  const [relationship, setRelationship] = useState(data.relationship)
  const [gender, setGender] = useState(data.gender || "")

  const handleNext = () => {
    if (!relationship) return

    updateData({
      relationship,
      gender: gender || undefined,
    })
    router.push("/wizard/step-2")
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-indigo-50">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-base font-medium text-gray-600">Step 1 of 3</span>
              <span className="text-base font-medium text-gray-600">33%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                style={{ width: "33%" }}
              />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Who are you shopping for?</h1>
            <p className="text-lg text-gray-600">Tell us about your relationship to help us find the perfect gift</p>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Relationship <span className="text-red-error">*</span>
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {relationships.map((rel) => (
                  <button
                    key={rel}
                    onClick={() => setRelationship(rel)}
                    className={`p-3 border-2 rounded-xl text-base font-medium transition-all duration-200 ${
                      relationship === rel
                        ? "border-purple-500 text-purple-600 bg-purple-50"
                        : "border-gray-200 text-gray-700 hover:border-gray-300 bg-white"
                    }`}
                  >
                    {rel}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Gender <span className="text-gray-400 text-base font-normal">(optional)</span>
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {genders.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`p-3 border-2 rounded-xl text-base font-medium transition-all duration-200 ${
                      gender === g
                        ? "border-purple-500 text-purple-600 bg-purple-50"
                        : "border-gray-200 text-gray-700 hover:border-gray-300 bg-white"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <Button variant="outline" disabled className="px-6 py-2 text-base bg-transparent">
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={!relationship}
                className="px-6 py-2 text-base bg-purple-600 hover:bg-purple-700"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
