import React from "react";
import { cn } from "../ui/utils";
import { Check } from "lucide-react";

interface Step {
  number: number;
  label: string;
  path?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  completedSteps?: number[];
}

export function Stepper({ steps, currentStep, completedSteps = [] }: StepperProps) {
  return (
    <nav aria-label="Progresso do cadastro">
      {/* Desktop Horizontal Stepper */}
      <ol className="hidden lg:flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.number);
          const isCurrent = currentStep === step.number;
          const isPast = step.number < currentStep;
          
          return (
            <li
              key={step.number}
              className={cn(
                "flex flex-1 items-center",
                index !== steps.length - 1 && "relative"
              )}
            >
              <div className="flex flex-col items-center gap-2 flex-1">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all",
                    isCurrent &&
                      "border-[#1351B4] bg-[#1351B4] text-white shadow-lg scale-110",
                    (isCompleted || isPast) &&
                      !isCurrent &&
                      "border-green-600 bg-green-600 text-white",
                    !isCurrent &&
                      !isCompleted &&
                      !isPast &&
                      "border-gray-300 bg-white text-gray-500"
                  )}
                >
                  {isCompleted || isPast ? (
                    <Check className="h-6 w-6" />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium text-center max-w-[120px]",
                    isCurrent ? "text-[#1351B4]" : "text-gray-600"
                  )}
                >
                  {step.label}
                </span>
              </div>
              
              {index !== steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-full mx-2 transition-all",
                    isPast || isCompleted ? "bg-green-600" : "bg-gray-300"
                  )}
                  style={{ marginTop: "-36px" }}
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile/Tablet Compact Stepper */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-700">
            Etapa {currentStep} de {steps.length}
          </span>
          <span className="text-xs text-gray-500">
            {Math.round((currentStep / steps.length) * 100)}% concluído
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1351B4] transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
        
        {/* Current Step Label */}
        <p className="mt-3 text-sm font-medium text-[#1351B4]">
          {steps.find((s) => s.number === currentStep)?.label}
        </p>
      </div>
    </nav>
  );
}
