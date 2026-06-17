import { cn } from '../../lib/utils';

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  required?: boolean;
  options: SelectOption[];
  placeholder?: string;
  wrapperClassName?: string;
}

const Select = ({
  label,
  error,
  required,
  options,
  placeholder,
  wrapperClassName,
  className,
  id,
  value,
  ...props
}: SelectProps) => {
  const selectId = id || props.name;
  return (
    <div className={cn(wrapperClassName)}>
      {label && (
        <label
          htmlFor={selectId}
          className={cn('label', required && 'label-required')}
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        value={value}
        className={cn(
          'select',
          error && 'border-danger focus:border-danger focus:ring-danger/20',
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
};

export default Select;
