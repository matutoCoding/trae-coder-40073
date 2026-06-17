import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart3,
  Activity,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import Button from '@/components/ui/Button';
import Tag from '@/components/ui/Tag';
import ProgressBar from '@/components/ui/ProgressBar';
import StatCard from '@/components/ui/StatCard';
import { seedProjects } from '@/data/seed';
import { useTryMoldStore } from '@/store/trymold';
import { cn } from '@/lib/utils';

const generateHistory = (base: number, months: number) => {
  return Array.from({ length: months }, (_, i) => {
    const m = new Date();
    m.setMonth(m.getMonth() - (months - 1 - i));
    return {
      month: `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`,
      cycles: Math.round(base * (0.5 + Math.random() * 1.2 + i * 0.15)),
      inspection: Math.round(80 + Math.random() * 20 - i * 0.5),
    };
  });
};

export default function LifetimeDashboard() {
  const navigate = useNavigate();
  const { getProjectLifetimeStats, getAppliesByProject } = useTryMoldStore();

  const projectsWithStats = useMemo(() => {
    return seedProjects.map((proj) => {
      const stats = getProjectLifetimeStats().find(
        (s) => s.projectId === proj.id
      );
      const applies = getAppliesByProject(proj.id);
      const currentCycles =
        proj.currentCycles + (stats?.cycles || 0) + applies.length * 500;
      const designLife = proj.totalCycles || 500000;
      const pct = Math.min(100, Math.round((currentCycles / designLife) * 100));
      const history = generateHistory(
        Math.round(designLife / 60),
        6
      );
      const nextMaintenance =
        designLife * 0.25 - (currentCycles % Math.round(designLife * 0.25));
      const needMaintenance = nextMaintenance < 5000;

      return {
        ...proj,
        currentCycles,
        designLife,
        pct,
        history,
        nextMaintenance,
        needMaintenance,
        totalTries: applies.length + (stats?.totalTries || 0),
        passRate: stats?.passRate || 92,
      };
    });
  }, [getProjectLifetimeStats, getAppliesByProject]);

  const totalCycles = projectsWithStats.reduce(
    (sum, p) => sum + p.currentCycles,
    0
  );
  const totalDesign = projectsWithStats.reduce((sum, p) => sum + p.designLife, 0);
  const avgPassRate = Math.round(
    projectsWithStats.reduce((sum, p) => sum + p.passRate, 0) /
      projectsWithStats.length
  );
  const maintenanceCount = projectsWithStats.filter(
    (p) => p.needMaintenance
  ).length;

  const overallPct = Math.round((totalCycles / totalDesign) * 100);

  const statusMap: Record<
    string,
    { label: string; variant: 'gray' | 'primary' | 'accent' | 'success' | 'warning' | 'info' | 'danger' }
  > = {
    design: { label: '设计中', variant: 'gray' },
    machining: { label: '加工中', variant: 'primary' },
    assembly: { label: '装配中', variant: 'accent' },
    trymold: { label: '试模中', variant: 'warning' },
    completed: { label: '量产中', variant: 'success' },
    maintenance: { label: '保养中', variant: 'info' },
    scrapped: { label: '报废', variant: 'danger' },
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/trymold')}
          >
            返回
          </Button>
          <div>
            <h1 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary-700" />
              寿命统计看板
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              模具使用次数、寿命趋势与保养预警
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="全部模具累计模次"
          value={totalCycles.toLocaleString()}
          suffix={`/ 设计寿命 ${totalDesign.toLocaleString()}`}
          icon={Activity}
          color="primary"
        />
        <StatCard
          title="整体寿命使用率"
          value={`${overallPct}%`}
          suffix="已用模次/设计寿命"
          icon={Layers}
          color="accent"
        />
        <StatCard
          title="平均检验合格率"
          value={`${avgPassRate}%`}
          suffix="基于历史检验记录"
          icon={TrendingUp}
          color="success"
        />
        <StatCard
          title="待保养模具"
          value={maintenanceCount.toString()}
          suffix="接近下次保养周期"
          icon={AlertTriangle}
          color="warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {projectsWithStats.map((mold) => {
          const statusCfg =
            statusMap[mold.status] || statusMap.design;
          const strokeDasharray = 2 * Math.PI * 50;
          const strokeDashoffset =
            strokeDasharray - (mold.pct / 100) * strokeDasharray;
          const progressColor =
            mold.pct >= 90
              ? '#ef4444'
              : mold.pct >= 70
                ? '#E87722'
                : '#1E3A5F';

          return (
            <div
              key={mold.id}
              className={cn(
                'card p-5 transition-all',
                mold.needMaintenance &&
                  'ring-2 ring-warning/50 shadow-warning/10 shadow-lg'
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold text-primary-700">
                      {mold.projectNo}
                    </span>
                    <Tag variant={statusCfg.variant}>{statusCfg.label}</Tag>
                  </div>
                  <p className="text-sm text-neutral-600">{mold.moldName}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    客户：{mold.customerName}
                  </p>
                </div>

                <div className="relative w-28 h-28 flex-shrink-0">
                  <svg
                    className="w-full h-full -rotate-90"
                    viewBox="0 0 120 120"
                  >
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="10"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke={progressColor}
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className="text-2xl font-bold"
                      style={{ color: progressColor }}
                    >
                      {mold.pct}%
                    </span>
                    <span className="text-[10px] text-neutral-400">使用率</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-neutral-50">
                  <p className="text-xs text-neutral-500 mb-1">已用模次</p>
                  <p className="text-lg font-bold text-neutral-800 tabular-nums">
                    {mold.currentCycles.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-neutral-50">
                  <p className="text-xs text-neutral-500 mb-1">设计寿命</p>
                  <p className="text-lg font-bold text-neutral-800 tabular-nums">
                    {mold.designLife.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-neutral-50">
                  <p className="text-xs text-neutral-500 mb-1">试模次数</p>
                  <p className="text-lg font-bold text-neutral-800 tabular-nums">
                    {mold.totalTries}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">寿命进度</span>
                  <span className="font-medium tabular-nums">
                    {mold.currentCycles.toLocaleString()} /{' '}
                    {mold.designLife.toLocaleString()}
                  </span>
                </div>
                <ProgressBar
                  value={mold.pct}
                  color={
                    mold.pct >= 90
                      ? 'danger'
                      : mold.pct >= 70
                        ? 'warning'
                        : 'primary'
                  }
                />
              </div>

              <div className="h-40 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mold.history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 10 }}
                      stroke="#9CA3AF"
                    />
                    <YAxis tick={{ fontSize: 10 }} stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{
                        fontSize: '12px',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line
                      type="monotone"
                      dataKey="cycles"
                      name="模次"
                      stroke="#1E3A5F"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="inspection"
                      name="合格率%"
                      stroke="#E87722"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div
                className={cn(
                  'p-3 rounded-lg flex items-start gap-3',
                  mold.needMaintenance
                    ? 'bg-warning-light/50 border border-warning/20'
                    : 'bg-success-light/30 border border-success/20'
                )}
              >
                {mold.needMaintenance ? (
                  <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                ) : (
                  <Calendar className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      mold.needMaintenance ? 'text-warning' : 'text-success'
                    )}
                  >
                    {mold.needMaintenance
                      ? '保养预警 - 建议尽快安排'
                      : '下次保养'}
                  </p>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    预计剩余{' '}
                    <span className="font-semibold tabular-nums">
                      {mold.nextMaintenance.toLocaleString()}
                    </span>{' '}
                    模次
                    <span className="text-neutral-400 ml-1">
                      (每 {(mold.designLife * 0.25).toLocaleString()} 模次保养一次)
                    </span>
                  </p>
                  <p className="text-xs text-neutral-400 mt-1 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    平均合格率 {mold.passRate}% | 试模 {mold.totalTries} 次
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
