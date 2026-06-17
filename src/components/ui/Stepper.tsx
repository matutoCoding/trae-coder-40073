import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';

export interface StepItem {
  key: string;
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface StepperProps {
  steps: StepItem[];
  currentStep: number;
  direction?: 'horizontal' | 'vertical';
  className?: string;
}

const Stepper = ({ steps, currentStep, direction = 'horizontal', className }: StepperProps) => {
  if (direction === 'vertical') {
    return (
      <div className={cn('flex flex-col gap-0', className)}>
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx < currentStep;
          const isActive = idx === currentStep;
          const isLast = idx === steps.length - 1;
          return (
            <div key={step.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'stepper-circle',
                    isCompleted
                      ? 'bg-success text-white border-success'
                      : isActive
                      ? 'bg-primary-700 text-white border-primary-700 shadow-md shadow-primary-700/30'
                      : 'bg-white text-neutral-500 border-neutral-300'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : Icon ? (
                    <Icon className="w-4 h-4" />
                  ) : (
                    idx + 1
                  )}
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      'w-0.5 flex-1 my-1 min-h-[32px] transition-colors',
                      isCompleted ? 'bg-success' : 'bg-neutral-200'
                    )}
                  />
                )}
              </div>
              <div className={cn('pb-6', isLast && 'pb-0')}>
                <p
                  className={cn(
                    'text-sm font-semibold',
                    isActive ? 'text-primary-700' : isCompleted ? 'text-neutral-800' : 'text-neutral-500'
                  )}
                >
                  {step.title}
                </p>
                {step.description && (
                  <p className={cn(
                    'text-xs mt-1',
                    isActive ? 'text-primary-600' : 'text-neutral-400'
                  )}>
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('flex items-start justify-between', className)}>
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isCompleted = idx < currentStep;
        const isActive = idx === currentStep;
        const isLast = idx === steps.length - 1;
        return (
          <div key={step.key} className="stepper-node">
            {!isLast && (
              <div
                className={cn(
                  'stepper-line',
                  idx < currentStep ? 'bg-success' : 'bg-neutral-200'
                )}
              />
            )}
            <div
              className={cn(
                'stepper-circle',
                isCompleted
                  ? 'bg-success text-white border-success'
                  : isActive
                  ? 'bg-primary-700 text-white border-primary-700 shadow-md shadow-primary-700/30 scale-110'
                  : 'bg-white text-neutral-500 border-neutral-300'
              )}
            >
              {isCompleted ? (
                <Check className="w-4 h-4" />
              ) : Icon ? (
                <Icon className="w-4 h-4" />
              ) : (
                idx + 1
              )}
            </div>
            <div className="mt-3 text-center">
              <p
                className={cn(
                  'text-sm font-semibold',
                  isActive ? 'text-primary-700' : isCompleted ? 'text-neutral-800' : 'text-neutral-500'
                )}
              >
                {step.title}
              </p>
              {step.description && (
                <p className={cn(
                  'text-xs mt-1 max-w-[120px]',
                  isActive ? 'text-primary-600' : 'text-neutral-400'
                )}>
                  {step.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Stepper;
