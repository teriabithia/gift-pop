interface WizardProgressProps {
  currentStep: number
  totalSteps: number
}

export function WizardProgress({ currentStep, totalSteps }: WizardProgressProps) {
  const progressPercentage = (currentStep / totalSteps) * 100

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between mb-4">
        <span className="text-lg font-medium text-gray-600">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-lg font-medium text-gray-600">{Math.round(progressPercentage)}%</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  )
}
