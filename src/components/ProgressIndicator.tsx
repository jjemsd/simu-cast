import { CheckCircle2 } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps?: number;
  onStepClick?: (step: number) => void;
  isGuest?: boolean;
}

export default function ProgressIndicator({ currentStep, totalSteps = 4, onStepClick, isGuest = false }: ProgressIndicatorProps) {
  const steps = [
    { number: 1, label: 'Data Preparation', shortLabel: 'Data' },
    { number: 2, label: 'Build Model', shortLabel: 'Model' },
    { number: 3, label: 'Test Scenarios', shortLabel: 'Scenarios' },
    { number: 4, label: 'Insights & Report', shortLabel: 'Report' },
  ];

  const handleStepClick = (stepNumber: number) => {
    // Guest users cannot go backwards
    if (isGuest && stepNumber < currentStep) {
      return;
    }
    // Regular users can only click on completed steps or current step
    if (stepNumber <= currentStep && onStepClick) {
      onStepClick(stepNumber);
    }
  };

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex items-center gap-3">
                {/* Step Circle */}
                <div
                  onClick={() => handleStepClick(step.number)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-all ${
                    step.number < currentStep
                      ? 'bg-teal-600 text-white shadow-md'
                      : step.number === currentStep
                      ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-900 shadow-lg font-bold'
                      : 'bg-slate-100 text-slate-400 border-2 border-slate-200'
                  } ${
                    // Allow clicking on completed steps for non-guest users
                    !isGuest && step.number <= currentStep && onStepClick
                      ? 'cursor-pointer hover:scale-110'
                      : isGuest && step.number < currentStep
                      ? 'cursor-not-allowed opacity-60'
                      : ''
                  }`}
                >
                  {step.number < currentStep ? (
                    <CheckCircle2 size={18} className="stroke-[2.5]" />
                  ) : (
                    step.number
                  )}
                </div>

                {/* Step Label */}
                <div className="hidden lg:block">
                  <p className={`text-xs ${
                    step.number === currentStep 
                      ? 'text-amber-600 font-medium' 
                      : step.number < currentStep
                      ? 'text-teal-600'
                      : 'text-slate-400'
                  }`}>
                    {step.number < currentStep ? 'Completed' : step.number === currentStep ? `Step ${step.number} of ${totalSteps}` : 'Pending'}
                  </p>
                  <p className={`text-sm font-medium ${
                    step.number === currentStep 
                      ? 'text-slate-900' 
                      : step.number < currentStep
                      ? 'text-slate-700'
                      : 'text-slate-400'
                  }`}>
                    {step.label}
                  </p>
                </div>

                {/* Mobile Short Label */}
                <div className="block lg:hidden">
                  <p className={`text-xs font-medium ${
                    step.number === currentStep 
                      ? 'text-slate-900' 
                      : step.number < currentStep
                      ? 'text-teal-600'
                      : 'text-slate-400'
                  }`}>
                    {step.shortLabel}
                  </p>
                </div>
              </div>

              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-3">
                  <div
                    className={`h-1 rounded-full transition-all ${
                      step.number < currentStep
                        ? 'bg-teal-600'
                        : 'bg-slate-200'
                    }`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}