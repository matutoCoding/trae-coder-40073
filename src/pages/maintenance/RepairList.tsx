import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench,
  Plus,
  Eye,
  Calendar,
  User,
  Clock,
  Tag as TagIcon,
} from 'lucide-react';
import Table from '@/components/ui/Table';
import type { TableColumn } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Tag from '@/components/ui/Tag';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { useMaintenanceStore } from '@/store/maintenance';
import type { RepairOrder } from '@/types';
import { seedProjects, seedUsers } from '@/data/seed';

const statusMap: Record<
  string,
  { label: string; variant: 'gray' | 'primary' | 'accent' | 'success' | 'warning' | 'danger' }
> = {
  pending: { label: '待维修', variant: 'warning' },
  repairing: { label: '维修中', variant: 'primary' },
  testing: { label: '测试中', variant: 'accent' },
  completed: { label: '已完成', variant: 'success' },
};

const FAULT_TYPES = [
  '顶针磨损',
  '水路堵塞',
  '分型面飞边',
  '导柱拉伤',
  '弹簧疲劳',
  '滑块磨损',
  '浇口套损坏',
  '冷却系统故障',
  '顶出机构卡滞',
  '其他故障',
];

export default function RepairList() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const { filteredRepairOrders, addRepairOrder } = useMaintenanceStore();
  const orders = filteredRepairOrders();

  const [form, setForm] = useState({
    projectId: '',
    faultType: '',
    faultDescription: '',
    repairer: '',
  });

  const handleSubmit = () => {
    const project = seedProjects.find((p) => p.id === form.projectId);
    if (!form.projectId || !form.faultType || !form.faultDescription || !form.repairer) {
      alert('请填写必填项');
      return;
    }
    addRepairOrder({
      projectId: form.projectId,
      projectNo: project?.projectNo || '',
      orderNo: `R${Date.now().toString().slice(-8)}`,
      faultType: form.faultType,
      faultDescription: form.faultDescription,
      rootCause: '',
      solution: '',
      parts: [],
      repairHours: 0,
      repairer: form.repairer,
      status: 'pending',
      applyDate: new Date().toISOString().slice(0, 10),
    });
    setModalOpen(false);
    setForm({ projectId: '', faultType: '', faultDescription: '', repairer: '' });
  };

  const operatorUsers = seedUsers.filter(
    (u) => u.role === 'operator' || u.role === 'admin'
  );

  const columns: TableColumn<RepairOrder>[] = [
    {
      key: 'orderNo',
      title: '工单编号',
      dataIndex: 'orderNo',
      width: 140,
      sorter: (a, b) => a.orderNo.localeCompare(b.orderNo),
      render: (v) => <span className="font-semibold text-primary-700 font-mono text-sm">{v}</span>,
    },
    {
      key: 'projectNo',
      title: '项目',
      dataIndex: 'projectNo',
      width: 120,
      render: (v) => <span className="font-medium">{v}</span>,
    },
    {
      key: 'faultType',
      title: '故障类型',
      dataIndex: 'faultType',
      width: 120,
      render: (v) => (
        <div className="flex items-center gap-1.5">
          <TagIcon className="w-4 h-4 text-neutral-400" />
          <span>{v}</span>
        </div>
      ),
    },
    {
      key: 'applyDate',
      title: '报修日期',
      dataIndex: 'applyDate',
      width: 120,
      align: 'center',
      sorter: (a, b) => a.applyDate.localeCompare(b.applyDate),
      render: (v) => (
        <div className="flex items-center justify-center gap-1.5">
          <Calendar className="w-4 h-4 text-neutral-400" />
          <span>{v}</span>
        </div>
      ),
    },
    {
      key: 'repairer',
      title: '维修人员',
      dataIndex: 'repairer',
      width: 100,
      align: 'center',
      render: (v) => (
        <div className="flex items-center justify-center gap-1.5">
          <User className="w-4 h-4 text-neutral-400" />
          <span>{v}</span>
        </div>
      ),
    },
    {
      key: 'repairHours',
      title: '工时',
      dataIndex: 'repairHours',
      width: 90,
      align: 'center',
      sorter: (a, b) => a.repairHours - b.repairHours,
      render: (v) => (
        <div className="flex items-center justify-center gap-1.5">
          <Clock className="w-4 h-4 text-neutral-400" />
          <span className="font-medium">{v}h</span>
        </div>
      ),
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
            onClick={() => navigate(`/maintenance/repair/${record.id}`)}
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
            维修工单列表
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            管理模具维修工单与进度跟踪
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/maintenance/consumable')}>
            易损件管理
          </Button>
          <Button variant="outline" onClick={() => navigate('/maintenance/ledger')}>
            模具台账
          </Button>
          <Button icon={Plus} onClick={() => setModalOpen(true)}>
            新建报修
          </Button>
        </div>
      </div>

      <div className="card p-5">
        <Table<RepairOrder>
          columns={columns}
          dataSource={orders}
          rowKey="id"
          bordered
          pageSize={10}
          emptyText="暂无维修工单"
        />
      </div>

      <Modal
        open={modalOpen}
        title="新建维修工单"
        onClose={() => setModalOpen(false)}
        width="max-w-2xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit}>提交报修</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="项目"
              required
              options={seedProjects.map((p) => ({
                value: p.id,
                label: `${p.projectNo} - ${p.moldName}`,
              }))}
              placeholder="请选择项目"
              value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: e.target.value })}
            />
            <Select
              label="故障类型"
              required
              options={FAULT_TYPES.map((f) => ({ value: f, label: f }))}
              placeholder="请选择故障类型"
              value={form.faultType}
              onChange={(e) => setForm({ ...form, faultType: e.target.value })}
            />
          </div>
          <Select
            label="维修人员"
            required
            options={operatorUsers.map((u) => ({ value: u.name, label: u.name }))}
            placeholder="请选择维修人员"
            value={form.repairer}
            onChange={(e) => setForm({ ...form, repairer: e.target.value })}
          />
          <Textarea
            label="故障描述"
            required
            rows={4}
            placeholder="请详细描述故障现象、发生时间、影响范围等..."
            value={form.faultDescription}
            onChange={(e) =>
              setForm({ ...form, faultDescription: e.target.value })
            }
          />
        </div>
      </Modal>
    </div>
  );
}
