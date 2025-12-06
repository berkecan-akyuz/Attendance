import { Check } from "lucide-react";

interface ProgressStepsProps {
  currentStep: number;
  steps: string[];
}

export function ProgressSteps({ currentStep, steps }: ProgressStepsProps) {
  return (
    <div className="flex items-center justify-between max-w-3xl mx-auto">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        const isUpcoming = stepNumber > currentStep;

        return (
          <div key={index} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isCompleted
                    ? "bg-green-500 text-white"
                    : isCurrent
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{stepNumber}</span>
                )}
              </div>
              <div className="mt-2 text-center">
                <p
                  className={`${
                    isCurrent ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {step}
                </p>
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-4 transition-all ${
                  isCompleted ? "bg-green-500" : "bg-gray-200"
                }`}
              ></div>
            )}
          </div>
        );
      })}
    </div>
  );
}
