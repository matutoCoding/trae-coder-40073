import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Table, { type TableColumn } from '../../components/ui/Table';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Tag from '../../components/ui/Tag';
import ProgressBar from '../../components/ui/ProgressBar';
import { useMachiningStore } from '../../store/machining';
import { Search, Filter, Plus, Layers } from 'lucide-react';
import type { CavityTask } from '../../types';
import { cavityTaskStatusMap, partTypeMap } from '../../utils/status';

const CavityList = () => {
  const navigate = useNavigate();
  const { cavityTasks, filteredCavityTasks } = useMachiningStore();
  const [statusFilter, setStatusFilter] = useState<CavityTask['status'] | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<CavityTask['partType'] | 'all'>('all');
  const [keyword, setKeyword] = useState('');
  const [projectFilter, setProjectFilter] = useState('');

  const projects = useMemo(() => {
    const set = new Set(cavityTasks.map((t) => t.projectNo));
    return Array.from(set);
  }, [cavityTasks]);

  const dataSource = useMemo(() => {
    let list = filteredCavityTasks();
    if (statusFilter !== 'all') {
      list = list.filter((t) => t.status === statusFilter);
    }
    if (typeFilter !== 'all') {
      list = list.filter((t) => t.partType === typeFilter);
    }
    if (projectFilter) {
      list = list.filter((t) => t.projectNo === projectFilter);
    }
    if (keyword) {
      const kw = keyword.toLowerCase();
      list = list.filter(
        (t) =>
          t.partName.toLowerCase().includes(kw) ||
          t.projectNo.toLowerCase().includes(kw) ||
          t.material.toLowerCase().includes(kw) ||
          t.cncMachine.toLowerCase().includes(kw) ||
          t.operator.toLowerCase().includes(kw)
      );
    }
    return list;
  }, [filteredCavityTasks, statusFilter, typeFilter, projectFilter, keyword, cavityTasks]);

  const handleRowClick = (record: CavityTask) => {
    navigate(`/machining/cavity/${record.id}`);
  };

  const columns: TableColumn<CavityTask>[] = [
    {
      key: 'projectNo',
      title: '项目',
      dataIndex: 'projectNo',
      width: 120,
      render: (v, r) => (
        <div className="flex flex-col">
          <span className="font-medium text-neutral-800 text-sm">{v}</span>
        </div>
      ),
    },
    {
      key: 'partName',
      title: '零件名',
      dataIndex: 'partName',
      render: (v, r) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-neutral-900">{v}</span>
        </div>
      ),
    },
    {
      key: 'partType',
      title: '类型',
      dataIndex: 'partType',
      width: 90,
      render: (v: CavityTask['partType']) => {
        const typeInfo = partTypeMap[v];
        return <Tag variant={typeInfo?.color?.includes('blue') ? 'info' : typeInfo?.color?.includes('green') ? 'success' : typeInfo?.color?.includes('orange') ? 'warning' : 'accent'}>
          {typeInfo?.label || v}
        </Tag>;
      },
    },
    {
      key: 'material',
      title: '材质',
      dataIndex: 'material',
      width: 100,
      render: (v) => <span className="text-neutral-700">{v}</span>,
    },
    {
      key: 'hardness',
      title: '硬度',
      dataIndex: 'hardness',
      width: 90,
      align: 'center',
      render: (v) => <span className="text-neutral-700">{v}</span>,
    },
    {
      key: 'processProgress',
      title: '工序进度',
      width: 160,
      render: (_, r) => {
        const progress =
          r.processRoute.length > 0
            ? Math.round((r.currentProcess / r.processRoute.length) * 100)
            : 0;
        return (
          <div className="w-full">
            <ProgressBar
              value={r.currentProcess}
              max={r.processRoute.length}
              color="primary"
              showLabel
              labelPosition="right"
              size="sm"
            />
          </div>
        );
      },
    },
    {
      key: 'currentProcess',
      title: '当前工序',
      width: 110,
      render: (_, r) => {
        const proc = r.processRoute[r.currentProcess] || '—';
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary-50 text-primary-700 text-xs font-medium">
            {proc}
          </span>
        );
      },
    },
    {
      key: 'cncMachine',
      title: '机床',
      dataIndex: 'cncMachine',
      width: 110,
      render: (v) => <span className="text-neutral-700">{v || '—'}</span>,
    },
    {
      key: 'operator',
      title: '操作员',
      dataIndex: 'operator',
      width: 90,
      render: (v) => <span className="text-neutral-700">{v || '—'}</span>,
    },
    {
      key: 'planHours',
      title: '计划工时',
      dataIndex: 'planHours',
      width: 100,
      align: 'right',
      sorter: (a, b) => a.planHours - b.planHours,
      render: (v, r) => (
        <div className="text-right">
          <span className="text-neutral-900 font-semibold tabular-nums">{v}h</span>
          <div className="text-[10px] text-neutral-400 mt-0.5">
            实际 {r.actualHours}h
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      title: '状态',
      dataIndex: 'status',
      width: 100,
      align: 'center',
      render: (v: CavityTask['status']) => {
        const info = cavityTaskStatusMap[v];
        const variant =
          v === 'completed'
            ? 'success'
            : v === 'machining'
              ? 'warning'
              : v === 'programming'
                ? 'info'
                : v === 'inspection'
                  ? 'accent'
                  : 'gray';
        return <Tag variant={variant}>{info?.label || v}</Tag>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">型腔型芯加工工单</h1>
          <p className="text-sm text-neutral-500 mt-1">型腔、型芯、滑块、斜顶零件加工管理</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-neutral-500" />
          <span className="text-sm font-semibold text-neutral-700">筛选条件</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Select
            label="状态"
            options={[
              { value: 'all', label: '全部状态' },
              ...Object.entries(cavityTaskStatusMap).map(([k, v]) => ({
                value: k,
                label: v.label,
              })),
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          />
          <Select
            label="零件类型"
            options={[
              { value: 'all', label: '全部类型' },
              ...Object.entries(partTypeMap).map(([k, v]) => ({
                value: k,
                label: v.label,
              })),
            ]}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
          />
          <Select
            label="项目"
            options={[
              { value: '', label: '全部项目' },
              ...projects.map((p) => ({ value: p, label: p })),
            ]}
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
          />
          <Input
            label="关键词"
            placeholder="零件名/项目/操作员"
            leftIcon={Search}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            wrapperClassName="lg:col-span-2"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <Table<CavityTask>
          columns={columns}
          dataSource={dataSource}
          onRowClick={handleRowClick}
          rowKey="id"
        />
      </div>
    </div>
  );
};

export default CavityList;
