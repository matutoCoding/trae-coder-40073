import { cn } from '../../lib/utils';

type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  label?: string;
  error?: string;
  required?: boolean;
  size?: InputSize;
  wrapperClassName?: string;
  leftIcon?: React.ComponentType<{ className?: string }>;
  rightIcon?: React.ComponentType<{ className?: string }>;
  prefixAddon?: React.ReactNode;
  suffixAddon?: React.ReactNode;
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'input-sm',
  md: '',
  lg: 'input-lg',
};

const Input = ({
  label,
  error,
  required,
  size = 'md',
  wrapperClassName,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  prefixAddon,
  suffixAddon,
  className,
  id,
  ...props
}: InputProps) => {
  const inputId = id || props.name;
  const hasLeftAddon = !!LeftIcon || !!prefixAddon;
  const hasRightAddon = !!RightIcon || !!suffixAddon;
  return (
    <div className={cn(wrapperClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className={cn('label', required && 'label-required')}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {LeftIcon && (
          <LeftIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        )}
        {prefixAddon && !LeftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500 pointer-events-none">
            {prefixAddon}
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            'input',
            sizeClasses[size],
            hasLeftAddon && 'pl-9',
            hasRightAddon && 'pr-14',
            error && 'border-danger focus:border-danger focus:ring-danger/20',
            className
          )}
          {...props}
        />
        {RightIcon && !suffixAddon && (
          <RightIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        )}
        {suffixAddon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500 pointer-events-none">
            {suffixAddon}
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
};

export default Input;
