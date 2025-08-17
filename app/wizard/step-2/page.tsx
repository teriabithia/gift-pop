"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useWizard } from "@/contexts/wizard-context"

const ageRanges = ["0-5", "6-12", "13-17", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"]

const interests = [
  "Sports",
  "Technology",
  "Fashion",
  "Books",
  "Music",
  "Art & Crafts",
  "Cooking",
  "Gaming",
  "Travel",
  "Photography",
  "Fitness",
  "Beauty",
]

export default function WizardStep2() {
  const router = useRouter()
  const { data, updateData } = useWizard()
  const [ageRange, setAgeRange] = useState(data.ageRange || "")
  const [selectedInterests, setSelectedInterests] = useState<string[]>(data.interests)

  const handleInterestChange = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests((prev) => prev.filter((i) => i !== interest))
    } else {
      setSelectedInterests((prev) => [...prev, interest])
    }
  }

  const handleNext = () => {
    updateData({
      ageRange: ageRange || undefined,
      interests: selectedInterests,
    })
    router.push("/wizard/step-3")
  }

  const handlePrevious = () => {
    updateData({
      ageRange: ageRange || undefined,
      interests: selectedInterests,
    })
    router.push("/wizard/step-1")
  }

  return (
    <div className="min-h-screen py-4 px-4 bg-indigo-50">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Step 2 of 3</span>
              <span className="text-sm font-medium text-gray-600">66%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                style={{ width: "66%" }}
              />
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Tell us more about them</h1>
            <p className="text-base text-gray-600">Help us understand their preferences and interests</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">
                Age Range <span className="text-gray-400 text-sm font-normal">(optional)</span>
              </h2>
              <div className="grid grid-cols-5 gap-2">
                {ageRanges.map((age) => (
                  <button
                    key={age}
                    onClick={() => setAgeRange(age)}
                    className={`p-2 border-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      ageRange === age
                        ? "border-purple-500 text-purple-600 bg-purple-50"
                        : "border-gray-200 text-gray-700 hover:border-gray-300 bg-white"
                    }`}
                  >
                    {age}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-900">
                Interests <span className="text-gray-400 text-sm font-normal">(optional, select multiple)</span>
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {interests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => handleInterestChange(interest)}
                    className={`p-2 border-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedInterests.includes(interest)
                        ? "border-purple-500 text-purple-600 bg-purple-50"
                        : "border-gray-200 text-gray-700 hover:border-gray-300 bg-white"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handlePrevious} className="px-6 py-2 text-sm bg-transparent">
                Previous
              </Button>
              <Button onClick={handleNext} className="px-6 py-2 text-sm bg-purple-600 hover:bg-purple-700">
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
