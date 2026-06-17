import { cn } from '../../lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  required?: boolean;
  wrapperClassName?: string;
}

const Textarea = ({
  label,
  error,
  required,
  wrapperClassName,
  className,
  id,
  ...props
}: TextareaProps) => {
  const textareaId = id || props.name;
  return (
    <div className={cn(wrapperClassName)}>
      {label && (
        <label
          htmlFor={textareaId}
          className={cn('label', required && 'label-required')}
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          'textarea',
          error && 'border-danger focus:border-danger focus:ring-danger/20',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
};

export default Textarea;
