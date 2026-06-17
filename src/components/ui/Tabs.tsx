import { cn } from '../../lib/utils';

export interface TabItem {
  key: string;
  label: React.ReactNode;
  disabled?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (key: string) => void;
  variant?: 'line' | 'card';
  className?: string;
}

const Tabs = ({ tabs, activeTab, onChange, variant = 'line', className }: TabsProps) => {
  return (
    <div className={cn(className)}>
      <div
        className={cn(
          'flex items-center gap-0.5 border-b border-neutral-200',
          variant === 'card' && 'border-0 gap-2'
        )}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              disabled={tab.disabled}
              onClick={() => !tab.disabled && onChange(tab.key)}
              className={cn(
                'flex items-center gap-2 transition-all duration-150',
                variant === 'line' && (
                  isActive ? 'tab-active' : 'tab'
                ),
                variant === 'card' && [
                  'px-4 py-2 rounded-lg text-sm font-medium border transition-all',
                  isActive
                    ? 'bg-primary-700 text-white border-primary-700 shadow-sm'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-primary-700',
                  tab.disabled && 'opacity-50 cursor-not-allowed hover:bg-white hover:text-neutral-600',
                ],
                tab.disabled && variant === 'line' && 'opacity-50 cursor-not-allowed hover:text-neutral-600'
              )}
            >
              {Icon && <Icon className="w-4 h-4" />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Tabs;
