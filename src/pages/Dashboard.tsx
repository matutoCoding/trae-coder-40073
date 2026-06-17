import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  FileText,
  Box,
  Cpu,
  FlaskConical,
  Wrench,
  Boxes,
  Plus,
  Search,
  Settings,
  Activity,
  ChevronRight,
  Clock,
} from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import {
  useQuotationStore,
  useProjectStore,
  useMachiningStore,
  useTryMoldStore,
  useMaintenanceStore,
  useMoldBaseStore,
  type Quotation,
  type MoldProject,
  type CavityTask,
  type TryMoldApply,
  type RepairOrder,
  type MoldLedger,
} from '@/store';
import { formatCurrency } from '@/utils/currency';
import { projectStatusMap, quotationStatusMap } from '@/utils/status';
import dayjs from 'dayjs';

const PIE_COLORS = ['#6366f1', '#f59e0b', '#8b5cf6', '#06b6d4', '#10b981', '#64748b', '#ef4444'];

const Dashboard = () => {
  const navigate = useNavigate();

  const quotations = useQuotationStore((s) => s.quotations);
  const projects = useProjectStore((s) => s.projects);
  const cavityTasks = useMachiningStore((s) => s.cavityTasks);
  const wireCutTasks = useMachiningStore((s) => s.wireCutTasks);
  const tryMoldApplies = useTryMoldStore((s) => s.applies);
  const repairOrders = useMaintenanceStore((s) => s.repairOrders);
  const moldLedgers = useMaintenanceStore((s) => s.moldLedgers);

  const stats = useMemo(() => {
    const totalQuotationAmount = quotations
      .filter((q) => q.status === 'approved')
      .reduce((sum, q) => sum + q.quotationPrice, 0);

    const inProgressMolds = projects.filter(
      (p) => p.status !== 'completed' && p.status !== 'scrapped'
    ).length;

    const activeMachining = cavityTasks.filter(
      (t) => t.status === 'machining' || t.status === 'programming'
    ).length + wireCutTasks.filter((t) => t.status === 'processing').length;

    const pendingTryMold = tryMoldApplies.filter(
      (t) => t.status === 'pending' || t.status === 'approved' || t.status === 'ongoing'
    ).length;

    const underRepair = repairOrders.filter(
      (r) => r.status === 'repairing' || r.status === 'testing'
    ).length;

    const inStockMolds = moldLedgers.filter((l) => l.status === 'in_stock').length;

    return {
      totalQuotationAmount,
      inProgressMolds,
      activeMachining,
      pendingTryMold,
      underRepair,
      inStockMolds,
    };
  }, [quotations, projects, cavityTasks, wireCutTasks, tryMoldApplies, repairOrders, moldLedgers]);

  const projectStatusData = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach((p) => {
      counts[p.status] = (counts[p.status] || 0) + 1;
    });
    return Object.entries(counts).map(([key, value]) => ({
      name: projectStatusMap[key]?.label || key,
      value,
    }));
  }, [projects]);

  const monthlyTrendData = useMemo(() => {
    const months: string[] = [];
    const now = dayjs();
    for (let i = 5; i >= 0; i--) {
      months.push(now.subtract(i, 'month').format('YYYY-MM'));
    }
    return months.map((month) => {
      const monthQuotations = quotations.filter((q) =>
        dayjs(q.createdAt).format('YYYY-MM') === month
      );
      const quotationAmount = monthQuotations.reduce((s, q) => s + q.quotationPrice, 0);
      const approvedCount = monthQuotations.filter((q) => q.status === 'approved').length;
      return {
        month: now.subtract(months.indexOf(month), 'month').format('M月'),
        报价额: Math.round(quotationAmount / 10000),
        订单数: approvedCount,
      };
    });
  }, [quotations]);

  const recentActivities = useMemo(() => {
    type Activity = {
      id: string;
      time: string;
      type: 'quotation' | 'project' | 'machining' | 'trymold' | 'repair';
      title: string;
      desc: string;
    };
    const activities: Activity[] = [];

    quotations.slice(0, 3).forEach((q: Quotation) => {
      activities.push({
        id: `q-${q.id}`,
        time: q.createdAt,
        type: 'quotation',
        title: `报价单 ${q.quotationNo}`,
        desc: `${quotationStatusMap[q.status]?.label} - ${q.customerName}`,
      });
    });

    projects.slice(0, 3).forEach((p: MoldProject) => {
      activities.push({
        id: `p-${p.id}`,
        time: p.createdAt,
        type: 'project',
        title: `项目 ${p.projectNo}`,
        desc: `${projectStatusMap[p.status]?.label} - ${p.moldName}`,
      });
    });

    cavityTasks.slice(0, 2).forEach((t: CavityTask) => {
      activities.push({
        id: `c-${t.id}`,
        time: t.startDate,
        type: 'machining',
        title: `加工任务 ${t.projectNo}`,
        desc: `${t.partName} - 工序${t.currentProcess}/${t.processRoute.length}`,
      });
    });

    tryMoldApplies.slice(0, 2).forEach((t: TryMoldApply) => {
      activities.push({
        id: `tm-${t.id}`,
        time: t.planDate,
        type: 'trymold',
        title: `试模申请 ${t.projectNo}`,
        desc: `第${t.tryNo}次试模 - ${t.machineNo}`,
      });
    });

    repairOrders.slice(0, 2).forEach((r: RepairOrder) => {
      activities.push({
        id: `r-${r.id}`,
        time: r.applyDate,
        type: 'repair',
        title: `维修单 ${r.orderNo}`,
        desc: `${r.faultType} - ${r.projectNo}`,
      });
    });

    return activities
      .sort((a, b) => dayjs(b.time).valueOf() - dayjs(a.time).valueOf())
      .slice(0, 8);
  }, [quotations, projects, cavityTasks, tryMoldApplies, repairOrders]);

  const quickLinks = [
    { key: 'new-quotation', icon: Plus, label: '新建报价', desc: '快速创建报价单', path: '/quotation/new', color: 'primary' as const },
    { key: 'quotation-list', icon: FileText, label: '报价管理', desc: `${quotations.length}份报价单`, path: '/quotation', color: 'info' as const },
    { key: 'moldbase', icon: Boxes, label: '模架库', desc: `${useMoldBaseStore.getState().moldBases.length}种规格`, path: '/moldbase', color: 'accent' as const },
    { key: 'machining', icon: Cpu, label: '加工中心', desc: `${cavityTasks.length}个任务`, path: '/machining/cavity', color: 'warning' as const },
    { key: 'trymold', icon: FlaskConical, label: '试模管理', desc: `${tryMoldApplies.length}条申请`, path: '/trymold', color: 'success' as const },
    { key: 'maintenance', icon: Wrench, label: '维修保养', desc: `${repairOrders.length}条工单`, path: '/maintenance', color: 'danger' as const },
  ];

  const colorClass: Record<string, string> = {
    quotation: 'bg-primary-100 text-primary-600',
    project: 'bg-accent-100 text-accent-500',
    machining: 'bg-warning-light text-warning',
    trymold: 'bg-info-light text-info',
    repair: 'bg-danger-light text-danger',
  };

  const tileColorConfig: Record<string, { bg: string; icon: string }> = {
    primary: { bg: 'from-primary-500/10 to-transparent', icon: 'bg-primary-100 text-primary-600' },
    accent: { bg: 'from-accent-500/10 to-transparent', icon: 'bg-accent-100 text-accent-500' },
    success: { bg: 'from-success/10 to-transparent', icon: 'bg-success-light text-success' },
    warning: { bg: 'from-warning/10 to-transparent', icon: 'bg-warning-light text-warning' },
    danger: { bg: 'from-danger/10 to-transparent', icon: 'bg-danger-light text-danger' },
    info: { bg: 'from-info/10 to-transparent', icon: 'bg-info-light text-info' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">工作台</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {dayjs().format('YYYY年MM月DD日')} · 欢迎回来
          </p>
        </div>
        <button
          onClick={() => navigate('/quotation/new')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新建报价
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          icon={FileText}
          title="报价总额"
          value={formatCurrency(stats.totalQuotationAmount, '¥', 0)}
          trend={{ value: 12.5, label: '较上月' }}
          color="primary"
          onClick={() => navigate('/quotation')}
        />
        <StatCard
          icon={Box}
          title="在制模具"
          value={stats.inProgressMolds}
          suffix="套"
          trend={{ value: 8, label: '本月新增' }}
          color="accent"
        />
        <StatCard
          icon={Cpu}
          title="加工任务"
          value={stats.activeMachining}
          suffix="项"
          trend={{ value: -3, label: '待分配' }}
          color="warning"
          onClick={() => navigate('/machining/cavity')}
        />
        <StatCard
          icon={FlaskConical}
          title="待试模"
          value={stats.pendingTryMold}
          suffix="次"
          trend={{ value: 2, label: '进行中' }}
          color="info"
          onClick={() => navigate('/trymold')}
        />
        <StatCard
          icon={Wrench}
          title="维修中"
          value={stats.underRepair}
          suffix="套"
          trend={{ value: 1, label: '待检测' }}
          color="danger"
          onClick={() => navigate('/maintenance')}
        />
        <StatCard
          icon={Boxes}
          title="库存模具"
          value={stats.inStockMolds}
          suffix="套"
          trend={{ value: 0, label: '总台账' }}
          color="success"
          onClick={() => navigate('/maintenance/ledger')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-800">项目状态分布</h3>
            <span className="text-xs text-neutral-400">共 {projects.length} 个项目</span>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {projectStatusData.map((_, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={PIE_COLORS[idx % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {projectStatusData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: PIE_COLORS[idx % PIE_COLORS.length] }}
                />
                <span className="text-neutral-600 truncate">{item.name}</span>
                <span className="text-neutral-400 ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-800">月度报价 / 订单趋势</h3>
            <span className="text-xs text-neutral-400">单位：报价额(万元) / 订单数(个)</span>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendData} barGap={12}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar
                  yAxisId="left"
                  dataKey="报价额"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                  name="报价额(万元)"
                />
                <Bar
                  yAxisId="right"
                  dataKey="订单数"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  name="订单数(个)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-neutral-800">最近活动</h3>
            </div>
            <button className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-0.5">
              查看全部 <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-0">
            {recentActivities.map((item, idx) => {
              const isLast = idx === recentActivities.length - 1;
              return (
                <div key={item.id} className="flex gap-3 relative">
                  {!isLast && (
                    <div className="absolute left-[15px] top-[30px] bottom-[-12px] w-px bg-neutral-200" />
                  )}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${colorClass[item.type]}`}
                  >
                    {item.type === 'quotation' && <FileText className="w-4 h-4" />}
                    {item.type === 'project' && <Box className="w-4 h-4" />}
                    {item.type === 'machining' && <Cpu className="w-4 h-4" />}
                    {item.type === 'trymold' && <FlaskConical className="w-4 h-4" />}
                    {item.type === 'repair' && <Wrench className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-neutral-800">{item.title}</p>
                      <span className="text-xs text-neutral-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {dayjs(item.time).format('MM-DD HH:mm')}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-neutral-800">快捷入口</h3>
            <button
              onClick={() => navigate('/settings')}
              className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              const config = tileColorConfig[link.color];
              return (
                <button
                  key={link.key}
                  onClick={() => navigate(link.path)}
                  className="relative card card-hover p-4 text-left overflow-hidden group"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${config.bg}`} />
                  <div className="relative">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${config.icon}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-neutral-800 group-hover:text-primary-700 transition-colors">
                      {link.label}
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">{link.desc}</p>
                  </div>
                  {link.key === 'new-quotation' && (
                    <Plus className="absolute top-3 right-3 w-4 h-4 text-neutral-300 group-hover:text-primary-400 transition-colors" />
                  )}
                  {link.key !== 'new-quotation' && (
                    <Search className="absolute top-3 right-3 w-4 h-4 text-neutral-300 group-hover:text-primary-400 transition-colors" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
