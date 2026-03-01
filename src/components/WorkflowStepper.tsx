import { CheckCircle2 } from 'lucide-react';
import { cn } from './ui/utils';

interface Step {
  id: string;
  label: string;
  number: number;
}

interface WorkflowStepperProps {
  currentStep: string;
  onStepClick?: (stepId: string) => void;
}

const steps: Step[] = [
  { id: 'overview', label: 'Upload Data', number: 1 },
  { id: 'modeling', label: 'Build Models', number: 2 },
  { id: 'scenarios', label: 'Test Scenarios', number: 3 },
  { id: 'insights', label: 'Insights & Report', number: 4 },
];

export default function WorkflowStepper({ currentStep, onStepClick }: WorkflowStepperProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = step.id === currentStep;
          const isClickable = index <= currentIndex;

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <button
                onClick={() => isClickable && onStepClick?.(step.id)}
                disabled={!isClickable}
                className={cn(
                  'flex flex-col items-center gap-1.5 transition-all relative',
                  isClickable && 'cursor-pointer hover:opacity-80',
                  !isClickable && 'cursor-not-allowed opacity-40'
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all relative z-10',
                  isCurrent && 'bg-blue-600 text-white ring-4 ring-blue-100',
                  isCompleted && !isCurrent && 'bg-green-600 text-white',
                  !isCompleted && !isCurrent && 'bg-slate-200 text-slate-500'
                )}>
                  {isCompleted ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <span>{step.number}</span>
                  )}
                </div>
                <span className={cn(
                  'text-xs font-medium whitespace-nowrap',
                  isCurrent && 'text-blue-900',
                  isCompleted && !isCurrent && 'text-slate-700',
                  !isCompleted && !isCurrent && 'text-slate-400'
                )}>
                  {step.label}
                </span>
              </button>
              
              {index < steps.length - 1 && (
                <div className={cn(
                  'flex-1 h-0.5 mx-2 -mt-8',
                  index < currentIndex ? 'bg-green-600' : 'bg-slate-200'
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { steps };