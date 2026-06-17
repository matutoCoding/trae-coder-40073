import { useMemo, useState } from 'react';
import Table, { type TableColumn } from '../../components/ui/Table';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Tag from '../../components/ui/Tag';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Textarea from '../../components/ui/Textarea';
import ProgressBar from '../../components/ui/ProgressBar';
import { useMachiningStore, useProjectStore } from '../../store';
import { Search, Filter, Plus, Zap, X, Check } from 'lucide-react';
import type { WireCutTask } from '../../types';
import { wireCutStatusMap } from '../../utils/status';

interface NewTaskForm {
  projectId: string;
  partName: string;
  wireType: string;
  wireDiameter: string;
  cutLength: string;
  planHours: string;
  tolerance: string;
  operator: string;
}

const defaultForm: NewTaskForm = {
  projectId: '',
  partName: '',
  wireType: '黄铜丝',
  wireDiameter: '0.25',
  cutLength: '',
  planHours: '',
  tolerance: '±0.01',
  operator: '',
};

const WireCutList = () => {
  const { wireCutTasks, addWireCutTask, filteredWireCutTasks, changeWireCutStatus } = useMachiningStore();
  const { projects } = useProjectStore();
  const [statusFilter, setStatusFilter] = useState<WireCutTask['status'] | 'all'>('all');
  const [projectFilter, setProjectFilter] = useState('');
  const [keyword, setKeyword] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<NewTaskForm>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const dataSource = useMemo(() => {
    let list = filteredWireCutTasks();
    if (statusFilter !== 'all') {
      list = list.filter((t) => t.status === statusFilter);
    }
    if (projectFilter) {
      list = list.filter((t) => t.projectId === projectFilter);
    }
    if (keyword) {
      const kw = keyword.toLowerCase();
      list = list.filter(
        (t) =>
          t.partName.toLowerCase().includes(kw) ||
          t.projectNo.toLowerCase().includes(kw) ||
          t.wireType.toLowerCase().includes(kw) ||
          t.operator.toLowerCase().includes(kw)
      );
    }
    return list;
  }, [filteredWireCutTasks, statusFilter, projectFilter, keyword]);

  const handleFormChange = <K extends keyof NewTaskForm>(key: K, value: NewTaskForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!form.projectId || !form.partName || !form.cutLength || !form.planHours) return;
    setSubmitting(true);
    const project = projects.find((p) => p.id === form.projectId);
    setTimeout(() => {
      addWireCutTask({
        projectId: form.projectId,
        projectNo: project?.projectNo || 'UNK',
        partName: form.partName,
        wireType: form.wireType,
        wireDiameter: parseFloat(form.wireDiameter),
        cutLength: parseFloat(form.cutLength),
        planHours: parseFloat(form.planHours),
        actualHours: 0,
        tolerance: form.tolerance,
        status: 'pending',
        operator: form.operator || '待分配',
      });
      setSubmitting(false);
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setModalOpen(false);
        setForm(defaultForm);
      }, 1500);
    }, 600);
  };

  const handleStartProcessing = (task: WireCutTask) => {
    changeWireCutStatus(task.id, 'processing');
  };

  const handleComplete = (task: WireCutTask) => {
    changeWireCutStatus(task.id, 'completed', task.planHours);
  };

  const columns: TableColumn<WireCutTask>[] = [
    {
      key: 'projectNo',
      title: '项目',
      dataIndex: 'projectNo',
      width: 120,
      render: (v) => <span className="font-medium text-neutral-800">{v}</span>,
    },
    {
      key: 'partName',
      title: '零件名',
      dataIndex: 'partName',
      render: (v) => <span className="font-semibold text-neutral-900">{v}</span>,
    },
    {
      key: 'wireType',
      title: '丝材',
      dataIndex: 'wireType',
      width: 100,
      render: (v) => (
        <Tag variant="info">{v}</Tag>
      ),
    },
    {
      key: 'wireDiameter',
      title: '丝径',
      dataIndex: 'wireDiameter',
      width: 90,
      align: 'center',
      render: (v) => <span className="font-mono text-neutral-700">Φ{v}mm</span>,
    },
    {
      key: 'cutLength',
      title: '切割总长',
      dataIndex: 'cutLength',
      width: 110,
      align: 'right',
      sorter: (a, b) => a.cutLength - b.cutLength,
      render: (v) => <span className="tabular-nums text-neutral-700">{v.toLocaleString()} mm</span>,
    },
    {
      key: 'tolerance',
      title: '精度要求',
      dataIndex: 'tolerance',
      width: 110,
      align: 'center',
      render: (v) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-accent-100 text-accent-700 text-xs font-mono">
          {v}mm
        </span>
      ),
    },
    {
      key: 'hours',
      title: '计划工时',
      width: 140,
      align: 'right',
      sorter: (a, b) => a.planHours - b.planHours,
      render: (_, r) => (
        <div className="text-right">
          <span className="text-neutral-900 font-semibold tabular-nums">{r.planHours}h</span>
          <div className="mt-1.5 w-full max-w-[120px] ml-auto">
            <ProgressBar
              value={r.actualHours}
              max={r.planHours}
              color={r.actualHours / r.planHours > 0.9 ? 'warning' : 'success'}
              size="sm"
            />
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5">实际 {r.actualHours}h</div>
        </div>
      ),
    },
    {
      key: 'operator',
      title: '操作员',
      dataIndex: 'operator',
      width: 90,
      render: (v) => <span className="text-neutral-700">{v}</span>,
    },
    {
      key: 'status',
      title: '状态',
      dataIndex: 'status',
      width: 100,
      align: 'center',
      render: (v: WireCutTask['status']) => {
        const info = wireCutStatusMap[v];
        const variant =
          v === 'completed' ? 'success' : v === 'processing' ? 'warning' : 'gray';
        return <Tag variant={variant}>{info?.label || v}</Tag>;
      },
    },
    {
      key: 'actions',
      title: '操作',
      width: 150,
      align: 'center',
      render: (_, r) => (
        <div className="flex items-center justify-center gap-1.5">
          {r.status === 'pending' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStartProcessing(r);
              }}
              className="px-2.5 py-1 rounded-md bg-warning-100 text-warning hover:bg-warning-200 text-xs font-medium transition-colors"
            >
              开始加工
            </button>
          )}
          {r.status === 'processing' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleComplete(r);
              }}
              className="px-2.5 py-1 rounded-md bg-success-light text-success hover:bg-success/20 text-xs font-medium transition-colors"
            >
              完成
            </button>
          )}
        </div>
      ),
    },
  ];

  const wireTypes = ['黄铜丝', '镀锌丝', '钼丝', '钨丝', '铜丝'];
  const wireDiameters = ['0.10', '0.15', '0.20', '0.25', '0.30', '0.35'];
  const tolerances = ['±0.005', '±0.01', '±0.02', '±0.05', '±0.10'];
  const operators = ['张师傅', '李师傅', '王师傅', '赵师傅', '周师傅'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">慢走丝线切割任务</h1>
          <p className="text-sm text-neutral-500 mt-1">精密零件慢走丝加工任务管理</p>
        </div>
        <Button icon={Plus} onClick={() => setModalOpen(true)}>
          新建任务
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-neutral-500" />
          <span className="text-sm font-semibold text-neutral-700">筛选条件</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="状态"
            options={[
              { value: 'all', label: '全部状态' },
              ...Object.entries(wireCutStatusMap).map(([k, v]) => ({
                value: k,
                label: v.label,
              })),
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          />
          <Select
            label="项目"
            options={[
              { value: '', label: '全部项目' },
              ...projects.map((p) => ({ value: p.id, label: `${p.projectNo} - ${p.moldName}` })),
            ]}
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
          />
          <Input
            label="关键词搜索"
            placeholder="零件名/项目/操作员"
            leftIcon={Search}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            wrapperClassName="lg:col-span-2"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <Table<WireCutTask>
          columns={columns}
          dataSource={dataSource}
          rowKey="id"
        />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => !submitting && !submitSuccess && setModalOpen(false)}
        title={submitSuccess ? '创建成功' : '新建慢走丝任务'}
        width="max-w-lg"
        closable={!submitting && !submitSuccess}
        maskClosable={!submitting && !submitSuccess}
        footer={
          !submitSuccess ? (
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setModalOpen(false)}
                disabled={submitting}
                icon={X}
              >
                取消
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={submitting || !form.projectId || !form.partName || !form.cutLength || !form.planHours}
                icon={Check}
              >
                {submitting ? '创建中...' : '确认创建'}
              </Button>
            </div>
          ) : null
        }
      >
        {submitSuccess ? (
          <div className="py-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <Check className="w-10 h-10 text-success" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-1">任务创建成功</h3>
            <p className="text-sm text-neutral-500">{form.partName} 已加入任务队列</p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <Select
              label="所属项目"
              required
              placeholder="请选择项目..."
              value={form.projectId}
              onChange={(e) => handleFormChange('projectId', e.target.value)}
              options={projects.map((p) => ({
                value: p.id,
                label: `${p.projectNo} - ${p.moldName}`,
              }))}
            />
            <Input
              label="零件名称"
              required
              placeholder="请输入零件名称"
              value={form.partName}
              onChange={(e) => handleFormChange('partName', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="丝材类型"
                value={form.wireType}
                onChange={(e) => handleFormChange('wireType', e.target.value)}
                options={wireTypes.map((w) => ({ value: w, label: w }))}
              />
              <Select
                label="丝径 (mm)"
                value={form.wireDiameter}
                onChange={(e) => handleFormChange('wireDiameter', e.target.value)}
                options={wireDiameters.map((w) => ({ value: w, label: `Φ${w}` }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="切割总长 (mm)"
                required
                type="number"
                placeholder="如: 12500"
                value={form.cutLength}
                onChange={(e) => handleFormChange('cutLength', e.target.value)}
              />
              <Input
                label="计划工时 (h)"
                required
                type="number"
                step="0.5"
                placeholder="如: 8"
                value={form.planHours}
                onChange={(e) => handleFormChange('planHours', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="精度要求 (mm)"
                value={form.tolerance}
                onChange={(e) => handleFormChange('tolerance', e.target.value)}
                options={tolerances.map((t) => ({ value: t, label: t }))}
              />
              <Select
                label="操作员"
                value={form.operator}
                onChange={(e) => handleFormChange('operator', e.target.value)}
                options={[
                  { value: '', label: '待分配' },
                  ...operators.map((o) => ({ value: o, label: o })),
                ]}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WireCutList;
