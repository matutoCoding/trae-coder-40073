import { useNavigate, Link } from 'react-router-dom';
import { Home, ArrowLeft, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50/50 via-white to-accent-50/30 p-6">
      <div className="text-center max-w-md">
        <div className="relative mb-8">
          <div className="text-[140px] md:text-[180px] font-black leading-none tracking-tight">
            <span className="bg-gradient-to-r from-primary-700 via-accent to-primary-500 bg-clip-text text-transparent">
              4
            </span>
            <span className="relative inline-block mx-2">
              <AlertCircle className="w-[110px] md:w-[140px] h-[110px] md:h-[140px] text-accent-600 animate-pulse" />
            </span>
            <span className="bg-gradient-to-r from-primary-500 via-primary-700 to-primary-600 bg-clip-text text-transparent">
              4
            </span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-neutral-800 mb-3">
          页面走丢了
        </h1>
        <p className="text-lg text-neutral-500 mb-8">
          您访问的页面不存在，或者已被移动、删除。<br />
          请检查您输入的地址是否正确，或返回首页继续浏览。
        </p>

        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            icon={ArrowLeft}
            onClick={() => navigate(-1)}
          >
            返回上一页
          </Button>
          <Link to="/">
            <Button icon={Home}>返回首页</Button>
          </Link>
        </div>

        <div className="mt-10 pt-6 border-t border-neutral-200">
          <p className="text-sm text-neutral-400 mb-3">快速导航</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { to: '/assembly', label: '装配管理' },
              { to: '/trymold', label: '试模管理' },
              { to: '/maintenance', label: '维修管理' },
              { to: '/settings', label: '系统设置' },
            ].map((nav) => (
              <Link
                key={nav.to}
                to={nav.to}
                className="px-3 py-1.5 text-sm rounded-md bg-white border border-neutral-200 text-neutral-600 hover:border-primary-300 hover:text-primary-700 hover:bg-primary-50/50 transition-all"
              >
                {nav.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
