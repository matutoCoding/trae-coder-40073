import { cn } from '../../lib/utils';

type TagVariant = 'gray' | 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

interface TagProps {
  variant?: TagVariant;
  children: React.ReactNode;
  className?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const variantClasses: Record<TagVariant, string> = {
  gray: 'tag-gray',
  primary: 'tag-primary',
  accent: 'tag-accent',
  success: 'tag-success',
  warning: 'tag-warning',
  danger: 'tag-danger',
  info: 'tag-info',
};

const Tag = ({ variant = 'gray', children, className, icon: Icon }: TagProps) => {
  return (
    <span className={cn(variantClasses[variant], className)}>
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
};

export default Tag;
