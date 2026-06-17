import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  User,
  ChevronDown,
  LogOut,
  Settings as SettingsIcon,
  UserCircle,
  Home,
  FileText,
  Layers,
  Cog,
  Zap,
  Box,
  FlaskConical,
  Hammer,
  Settings,
} from 'lucide-react';

const pathMap: Record<string, { label: string; icon?: React.ComponentType<{ className?: string }> }> = {
  dashboard: { label: '数据概览', icon: Home },
  quotation: { label: '报价管理', icon: FileText },
  moldbase: { label: '模架管理', icon: Layers },
  machining: { label: '加工管理', icon: Cog },
  electrode: { label: '电极管理', icon: Zap },
  assembly: { label: '装配管理', icon: Box },
  trymold: { label: '试模记录', icon: FlaskConical },
  repair: { label: '维修工单', icon: Hammer },
  settings: { label: '系统设置', icon: Settings },
};

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbItems = [
    { label: '首页', path: '/dashboard', icon: undefined as React.ComponentType<{ className?: string }> | undefined },
    ...pathSegments.map((seg, idx) => {
      const mapped = pathMap[seg];
      return {
        label: mapped?.label || seg,
        path: '/' + pathSegments.slice(0, idx + 1).join('/'),
        icon: mapped?.icon,
      };
    }),
  ];

  const notifications = [
    { id: 1, title: '加工任务 #M2024001 已完成', time: '5分钟前', type: 'success' },
    { id: 2, title: '报价单 Q2024012 待审批', time: '30分钟前', type: 'warning' },
    { id: 3, title: '电极 E-1023 已入库', time: '2小时前', type: 'info' },
    { id: 4, title: '模架 MB-0056 装配延期预警', time: '3小时前', type: 'danger' },
  ];

  return (
    <header className="h-[60px] bg-white border-b border-neutral-200/80 flex items-center px-6 gap-6 shrink-0 shadow-sm">
      <nav className="breadcrumb">
        {breadcrumbItems.map((item, idx) => {
          const isLast = idx === breadcrumbItems.length - 1;
          const Icon = item.icon;
          return (
            <div key={idx} className="flex items-center gap-2">
              {idx > 0 && <ChevronDown className="breadcrumb-separator w-3 h-3 rotate-[-90deg]" />}
              {isLast ? (
                <span className="breadcrumb-current flex items-center gap-1.5">
                  {Icon && <Icon className="w-4 h-4" />}
                  {item.label}
                </span>
              ) : (
                <span
                  className="breadcrumb-link flex items-center gap-1.5"
                  onClick={() => navigate(item.path)}
                >
                  {idx === 0 && <Home className="w-4 h-4" />}
                  {idx > 0 && Icon && <Icon className="w-4 h-4" />}
                  {item.label}
                </span>
              )}
            </div>
          );
        })}
      </nav>

      <div className="flex-1 max-w-md ml-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="搜索订单、模架、任务..."
            className="input pl-9 bg-neutral-50 focus:bg-white"
          />
        </div>
      </div>

      <div className="relative" ref={notifRef}>
        <button
          onClick={() => {
            setShowNotifications(!showNotifications);
            setShowUserMenu(false);
          }}
          className="relative w-9 h-9 rounded-lg flex items-center justify-center text-neutral-600 hover:bg-neutral-100 hover:text-primary-700 transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger animate-pulse-slow" />
        </button>

        {showNotifications && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-dropdown border border-neutral-200/80 z-50 animate-slide-down overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
              <span className="font-semibold text-neutral-800">通知中心</span>
              <span className="text-xs text-primary-600 cursor-pointer hover:underline">全部已读</span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="px-4 py-3 border-b border-neutral-50 hover:bg-neutral-50 cursor-pointer transition-colors"
                >
                  <div className="flex gap-2">
                    <span
                      className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                        n.type === 'success'
                          ? 'bg-success'
                          : n.type === 'warning'
                          ? 'bg-warning'
                          : n.type === 'danger'
                          ? 'bg-danger'
                          : 'bg-info'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-800 leading-snug">{n.title}</p>
                      <p className="text-xs text-neutral-400 mt-1">{n.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-2.5 bg-neutral-50 text-center">
              <span className="text-xs text-primary-600 cursor-pointer hover:underline">查看全部通知</span>
            </div>
          </div>
        )}
      </div>

      <div className="relative" ref={userMenuRef}>
        <button
          onClick={() => {
            setShowUserMenu(!showUserMenu);
            setShowNotifications(false);
          }}
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-neutral-100 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
            <User className="w-4 h-4" />
          </div>
          <div className="text-left leading-tight">
            <p className="text-sm font-medium text-neutral-800">张工程师</p>
            <p className="text-[11px] text-neutral-500">系统管理员</p>
          </div>
          <ChevronDown className="w-4 h-4 text-neutral-400" />
        </button>

        {showUserMenu && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-dropdown border border-neutral-200/80 z-50 animate-slide-down overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-800">张工程师</p>
                  <p className="text-xs text-neutral-500">admin@mespro.com</p>
                </div>
              </div>
            </div>
            <div className="py-1.5">
              <button className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
                <UserCircle className="w-4 h-4 text-neutral-500" />
                个人资料
              </button>
              <button className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors">
                <SettingsIcon className="w-4 h-4 text-neutral-500" />
                账号设置
              </button>
            </div>
            <div className="border-t border-neutral-100 py-1.5">
              <button className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-danger hover:bg-danger-light/50 transition-colors">
                <LogOut className="w-4 h-4" />
                退出登录
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
