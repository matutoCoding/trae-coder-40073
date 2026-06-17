import { useNavigate } from 'react-router-dom';
import { Wrench, Eye, AlertCircle, Clock, Users, CheckCircle2 } from 'lucide-react';
import Table from '@/components/ui/Table';
import type { TableColumn } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Tag from '@/components/ui/Tag';
import { useAssemblyStore } from '@/store/assembly';
import type { AssemblyTask } from '@/types';

const statusMap: Record<string, { label: string; variant: 'gray' | 'primary' | 'accent' | 'success' }> = {
  pending: { label: '待开始', variant: 'gray' },
  in_progress: { label: '进行中', variant: 'primary' },
  inspection: { label: '待验收', variant: 'accent' },
  completed: { label: '已完成', variant: 'success' },
};

export default function AssemblyList() {
  const navigate = useNavigate();
  const { filteredTasks } = useAssemblyStore();
  const tasks = filteredTasks();

  const columns: TableColumn<AssemblyTask>[] = [
    {
      key: 'projectNo',
      title: '项目号',
      dataIndex: 'projectNo',
      width: 120,
      sorter: (a, b) => a.projectNo.localeCompare(b.projectNo),
      render: (v) => <span className="font-semibold text-primary-700">{v}</span>,
    },
    {
      key: 'fitter',
      title: '钳工',
      dataIndex: 'fitter',
      width: 100,
      render: (v) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-neutral-400" />
          <span>{v}</span>
        </div>
      ),
    },
    {
      key: 'totalSteps',
      title: '总步骤',
      width: 90,
      align: 'center',
      render: (_v, record) => (
        <span className="font-medium">{record.steps.length}</span>
      ),
    },
    {
      key: 'completedSteps',
      title: '已完成',
      width: 100,
      align: 'center',
      render: (_v, record) => {
        const done = record.steps.filter((s) => s.done).length;
        const total = record.steps.length;
        const pct = total === 0 ? 0 : Math.round((done / total) * 100);
        return (
          <div className="flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span className="font-medium">{done}/{total}</span>
            <span className="text-xs text-neutral-400">({pct}%)</span>
          </div>
        );
      },
    },
    {
      key: 'planHours',
      title: '计划工时',
      dataIndex: 'planHours',
      width: 100,
      align: 'center',
      sorter: (a, b) => a.planHours - b.planHours,
      render: (v) => (
        <div className="flex items-center justify-center gap-1.5">
          <Clock className="w-4 h-4 text-neutral-400" />
          <span>{v}h</span>
        </div>
      ),
    },
    {
      key: 'actualHours',
      title: '实际工时',
      dataIndex: 'actualHours',
      width: 100,
      align: 'center',
      sorter: (a, b) => a.actualHours - b.actualHours,
      render: (v, record) => {
        const over = v > record.planHours;
        return (
          <span className={over ? 'text-danger font-semibold' : 'font-medium'}>
            {v}h
          </span>
        );
      },
    },
    {
      key: 'status',
      title: '状态',
      dataIndex: 'status',
      width: 100,
      align: 'center',
      render: (v) => {
        const cfg = statusMap[v as string] || statusMap.pending;
        return <Tag variant={cfg.variant}>{cfg.label}</Tag>;
      },
    },
    {
      key: 'issues',
      title: '问题数',
      width: 90,
      align: 'center',
      render: (_v, record) => {
        const count = record.issues.length;
        return (
          <div className="flex items-center justify-center gap-1.5">
            {count > 0 ? (
              <>
                <AlertCircle className="w-4 h-4 text-danger" />
                <span className="text-danger font-semibold">{count}</span>
              </>
            ) : (
              <span className="text-neutral-400">0</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'action',
      title: '操作',
      width: 120,
      align: 'center',
      render: (_v, record) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={Eye}
            onClick={() => navigate(`/assembly/${record.id}`)}
          >
            详情
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-primary-700" />
            装配任务列表
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            管理模具钳工装配任务与进度跟踪
          </p>
        </div>
      </div>

      <div className="card p-5">
        <Table<AssemblyTask>
          columns={columns}
          dataSource={tasks}
          rowKey="id"
          bordered
          pageSize={10}
          emptyText="暂无装配任务"
        />
      </div>
    </div>
  );
}
