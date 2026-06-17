import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Table, { type TableColumn } from '../../components/ui/Table';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Tag from '../../components/ui/Tag';
import ProgressBar from '../../components/ui/ProgressBar';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { useElectrodeStore, useProjectStore } from '../../store';
import { Search, Filter, Plus, Sparkles, X, Check, Clock, Battery } from 'lucide-react';
import type { Electrode } from '../../types';
import { electrodeStatusMap } from '../../utils/status';

interface NewElectrodeForm {
  projectId: string;
  electrodeNo: string;
  partName: string;
  material: string;
  size: string;
  maxUseCount: string;
  planHours: string;
}

const defaultForm: NewElectrodeForm = {
  projectId: '',
  electrodeNo: '',
  partName: '',
  material: '紫铜',
  size: '',
  maxUseCount: '500',
  planHours: '',
};

const ElectrodeList = () => {
  const navigate = useNavigate();
  const { electrodes, filteredElectrodes, addElectrode } = useElectrodeStore();
  const { projects } = useProjectStore();
  const [statusFilter, setStatusFilter] = useState<Electrode['status'] | 'all'>('all');
  const [projectFilter, setProjectFilter] = useState('');
  const [keyword, setKeyword] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<NewElectrodeForm>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const dataSource = useMemo(() => {
    let list = filteredElectrodes();
    if (statusFilter !== 'all') {
      list = list.filter((e) => e.status === statusFilter);
    }
    if (projectFilter) {
      list = list.filter((e) => e.projectId === projectFilter);
    }
    if (keyword) {
      const kw = keyword.toLowerCase();
      list = list.filter(
        (e) =>
          e.electrodeNo.toLowerCase().includes(kw) ||
          e.projectNo.toLowerCase().includes(kw) ||
          e.partName.toLowerCase().includes(kw) ||
          e.material.toLowerCase().includes(kw)
      );
    }
    return list;
  }, [filteredElectrodes, statusFilter, projectFilter, keyword]);

  const handleFormChange = <K extends keyof NewElectrodeForm>(key: K, value: NewElectrodeForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!form.projectId || !form.electrodeNo || !form.partName || !form.size || !form.planHours) return;
    setSubmitting(true);
    const project = projects.find((p) => p.id === form.projectId);
    setTimeout(() => {
      addElectrode({
        projectId: form.projectId,
        projectNo: project?.projectNo || 'UNK',
        electrodeNo: form.electrodeNo,
        partName: form.partName,
        material: form.material,
        size: form.size,
        usedCount: 0,
        maxUseCount: parseInt(form.maxUseCount) || 500,
        edmParams: {
          voltage: 80,
          current: 15,
          pulseOn: 8,
          pulseOff: 25,
        },
        planHours: parseFloat(form.planHours),
        actualHours: 0,
        status: 'pending',
        operator: '待分配',
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

  const handleRowClick = (record: Electrode) => {
    navigate(`/electrode/${record.id}`);
  };

  const columns: TableColumn<Electrode>[] = [
    {
      key: 'projectNo',
      title: '项目',
      dataIndex: 'projectNo',
      width: 120,
      render: (v) => <span className="font-medium text-neutral-800">{v}</span>,
    },
    {
      key: 'electrodeNo',
      title: '电极号',
      dataIndex: 'electrodeNo',
      width: 110,
      render: (v, r) => (
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-accent-600" />
          <span className="font-mono font-semibold text-neutral-900">{v}</span>
        </div>
      ),
    },
    {
      key: 'partName',
      title: '对应部位',
      dataIndex: 'partName',
      render: (v) => <span className="text-neutral-800">{v}</span>,
    },
    {
      key: 'material',
      title: '材质',
      dataIndex: 'material',
      width: 90,
      render: (v) => <Tag variant="accent">{v}</Tag>,
    },
    {
      key: 'size',
      title: '尺寸',
      dataIndex: 'size',
      width: 130,
      align: 'center',
      render: (v) => <span className="font-mono text-xs text-neutral-700">{v}</span>,
    },
    {
      key: 'lifeRatio',
      title: '寿命比',
      width: 160,
      render: (_, r) => {
        const pct = Math.round((r.usedCount / r.maxUseCount) * 100);
        const color = pct > 85 ? 'danger' : pct > 60 ? 'warning' : 'success';
        return (
          <div className="w-full">
            <ProgressBar
              value={r.usedCount}
              max={r.maxUseCount}
              color={color as any}
              showLabel
              labelPosition="right"
              size="sm"
            />
          </div>
        );
      },
    },
    {
      key: 'useCount',
      title: '使用次数',
      width: 100,
      align: 'center',
      render: (_, r) => {
        const pct = (r.usedCount / r.maxUseCount) * 100;
        const colorClass =
          pct > 85 ? 'text-danger' : pct > 60 ? 'text-warning' : 'text-success';
        return (
          <div className="flex flex-col items-center">
            <span className={`font-bold tabular-nums ${colorClass}`}>
              {r.usedCount}
            </span>
            <span className="text-[10px] text-neutral-400">/ {r.maxUseCount}</span>
          </div>
        );
      },
    },
    {
      key: 'edmHours',
      title: 'EDM工时',
      width: 120,
      align: 'right',
      sorter: (a, b) => a.planHours - b.planHours,
      render: (_, r) => (
        <div className="text-right">
          <div className="flex items-center justify-end gap-1 text-neutral-800">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span className="font-semibold tabular-nums">{r.actualHours}h</span>
          </div>
          <span className="text-[10px] text-neutral-400">计划 {r.planHours}h</span>
        </div>
      ),
    },
    {
      key: 'status',
      title: '状态',
      dataIndex: 'status',
      width: 100,
      align: 'center',
      render: (v: Electrode['status']) => {
        const info = electrodeStatusMap[v];
        const variant =
          v === 'worn'
            ? 'danger'
            : v === 'using'
              ? 'info'
              : v === 'machining'
                ? 'warning'
                : 'gray';
        return <Tag variant={variant}>{info?.label || v}</Tag>;
      },
    },
  ];

  const materials = ['紫铜', '石墨', '黄铜', '钨铜合金'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">电极管理</h1>
          <p className="text-sm text-neutral-500 mt-1">电火花加工电极制造与使用管理</p>
        </div>
        <Button icon={Plus} onClick={() => setModalOpen(true)}>
          新建电极
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-neutral-500">电极总数</div>
              <div className="text-2xl font-bold text-neutral-900 mt-1 tabular-nums">{electrodes.length}</div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-600" />
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-neutral-500">使用中</div>
              <div className="text-2xl font-bold text-info mt-1 tabular-nums">
                {electrodes.filter((e) => e.status === 'using').length}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-info-light flex items-center justify-center">
              <Battery className="w-5 h-5 text-info" />
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-neutral-500">制造中</div>
              <div className="text-2xl font-bold text-warning mt-1 tabular-nums">
                {electrodes.filter((e) => e.status === 'machining').length}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-warning-light flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-neutral-500">已损耗</div>
              <div className="text-2xl font-bold text-danger mt-1 tabular-nums">
                {electrodes.filter((e) => e.status === 'worn').length}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-danger-light flex items-center justify-center">
              <X className="w-5 h-5 text-danger" />
            </div>
          </div>
        </div>
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
              ...Object.entries(electrodeStatusMap).map(([k, v]) => ({
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
            placeholder="电极号/部位/项目"
            leftIcon={Search}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            wrapperClassName="lg:col-span-2"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <Table<Electrode>
          columns={columns}
          dataSource={dataSource}
          onRowClick={handleRowClick}
          rowKey="id"
        />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => !submitting && !submitSuccess && setModalOpen(false)}
        title={submitSuccess ? '创建成功' : '新建电极'}
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
                disabled={submitting || !form.projectId || !form.electrodeNo || !form.partName || !form.size || !form.planHours}
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
            <h3 className="text-lg font-semibold text-neutral-900 mb-1">电极创建成功</h3>
            <p className="text-sm text-neutral-500">电极 {form.electrodeNo} 已创建</p>
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
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="电极编号"
                required
                placeholder="如: E-2025-001"
                value={form.electrodeNo}
                onChange={(e) => handleFormChange('electrodeNo', e.target.value)}
              />
              <Select
                label="材质"
                value={form.material}
                onChange={(e) => handleFormChange('material', e.target.value)}
                options={materials.map((m) => ({ value: m, label: m }))}
              />
            </div>
            <Input
              label="对应型腔部位"
              required
              placeholder="如: 型腔左侧肋位"
              value={form.partName}
              onChange={(e) => handleFormChange('partName', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="尺寸规格 (L×W×H)"
                required
                placeholder="如: 80×60×40mm"
                value={form.size}
                onChange={(e) => handleFormChange('size', e.target.value)}
              />
              <Input
                label="最大使用次数"
                type="number"
                value={form.maxUseCount}
                onChange={(e) => handleFormChange('maxUseCount', e.target.value)}
              />
            </div>
            <Input
              label="预计EDM工时 (h)"
              required
              type="number"
              step="0.5"
              placeholder="如: 12"
              value={form.planHours}
              onChange={(e) => handleFormChange('planHours', e.target.value)}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ElectrodeList;
