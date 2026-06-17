import { cn } from '../../lib/utils';

type ButtonVariant = 'primary' | 'accent' | 'success' | 'danger' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ComponentType<{ className?: string }>;
  iconPosition?: 'left' | 'right';
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  accent: 'btn-accent',
  success: 'btn-success',
  danger: 'btn-danger',
  ghost: 'btn-ghost',
  outline: 'btn-outline',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
};

const Button = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  className,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(variantClasses[variant], sizeClasses[size], className)}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className={cn('w-4 h-4', size === 'lg' && 'w-5 h-5', size === 'sm' && 'w-3.5 h-3.5')} />}
      {children && <span>{children}</span>}
      {Icon && iconPosition === 'right' && <Icon className={cn('w-4 h-4', size === 'lg' && 'w-5 h-5', size === 'sm' && 'w-3.5 h-3.5')} />}
    </button>
  );
};

export default Button;
