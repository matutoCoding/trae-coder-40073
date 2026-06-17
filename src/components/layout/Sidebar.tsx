import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Box,
  Cog,
  Zap,
  Wrench,
  FlaskConical,
  Hammer,
  Settings,
  ChevronLeft,
  ChevronRight,
  Package,
  Layers,
} from 'lucide-react';

interface MenuItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    title: '工作台',
    items: [
      { to: '/dashboard', label: '数据概览', icon: LayoutDashboard },
    ],
  },
  {
    title: '报价管理',
    items: [
      { to: '/quotation', label: '报价单', icon: FileText },
    ],
  },
  {
    title: '模架管理',
    items: [
      { to: '/moldbase', label: '模架清单', icon: Layers },
    ],
  },
  {
    title: '加工管理',
    items: [
      { to: '/machining', label: '加工任务', icon: Cog },
    ],
  },
  {
    title: '电极管理',
    items: [
      { to: '/electrode', label: '电极调度', icon: Zap },
    ],
  },
  {
    title: '装配管理',
    items: [
      { to: '/assembly', label: '装配进度', icon: Box },
    ],
  },
  {
    title: '试模维修',
    items: [
      { to: '/trymold', label: '试模记录', icon: FlaskConical },
      { to: '/repair', label: '维修工单', icon: Hammer },
    ],
  },
  {
    title: '系统',
    items: [
      { to: '/settings', label: '系统设置', icon: Settings },
    ],
  },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
}

const Sidebar = ({ collapsed: externalCollapsed, onToggle }: SidebarProps) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed = externalCollapsed ?? internalCollapsed;

  const handleToggle = () => {
    const next = !collapsed;
    setInternalCollapsed(next);
    onToggle?.(next);
  };

  return (
    <aside
      className={`relative flex flex-col h-full transition-all duration-300 ease-in-out ${
        collapsed ? 'w-[64px]' : 'w-[240px]'
      }`}
      style={{
        background: 'linear-gradient(180deg, #1E3A5F 0%, #172C4A 50%, #0F1E35 100%)',
      }}
    >
      <div
        className={`flex items-center h-[60px] px-4 border-b border-white/10 ${
          collapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-accent/90 flex items-center justify-center shadow-lg shadow-accent/30">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-base leading-tight">MES Pro</span>
              <span className="text-primary-300/70 text-[10px] leading-tight">模具管理系统</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-9 h-9 rounded-lg bg-accent/90 flex items-center justify-center shadow-lg shadow-accent/30">
            <Package className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin">
        {menuGroups.map((group) => (
          <div key={group.title}>
            {!collapsed && (
              <div className="sidebar-group-title">{group.title}</div>
            )}
            {collapsed && <div className="h-2" />}
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-2">
        <button
          onClick={handleToggle}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-primary-100/80 hover:bg-white/10 hover:text-white transition-all"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <span className="text-sm">收起菜单</span>
              <ChevronLeft className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
