import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Inbox,
  Plus,
  Calendar,
  User,
  Factory,
  Hash,
  Package,
  Eye,
  ClipboardList,
} from 'lucide-react';
import Table from '@/components/ui/Table';
import type { TableColumn } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Tag from '@/components/ui/Tag';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useTryMoldStore } from '@/store/trymold';
import type { TryMoldApply } from '@/types';
import { seedProjects } from '@/data/seed';

const statusMap: Record<
  string,
  { label: string; variant: 'gray' | 'primary' | 'accent' | 'success' | 'warning' }
> = {
  pending: { label: '待审批', variant: 'warning' },
  approved: { label: '已批准', variant: 'primary' },
  ongoing: { label: '试模中', variant: 'accent' },
  completed: { label: '已完成', variant: 'success' },
};

export default function TryMoldList() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const { filteredApplies, addApply, getApplyRecords } = useTryMoldStore();
  const applies = filteredApplies();

  const [form, setForm] = useState({
    projectId: '',
    tryNo: 1,
    machineNo: '',
    material: '',
    materialBatch: '',
    planDate: new Date().toISOString().slice(0, 10),
    applicant: '',
  });

  const handleSubmit = () => {
    const project = seedProjects.find((p) => p.id === form.projectId);
    if (!form.projectId || !form.machineNo || !form.material || !form.applicant) {
      alert('请填写必填项');
      return;
    }
    addApply({
      projectId: form.projectId,
      projectNo: project?.projectNo || '',
      tryNo: Number(form.tryNo),
      machineNo: form.machineNo,
      material: form.material,
      materialBatch: form.materialBatch,
      planDate: form.planDate,
      applicant: form.applicant,
      status: 'pending',
    });
    setModalOpen(false);
    setForm({
      projectId: '',
      tryNo: 1,
      machineNo: '',
      material: '',
      materialBatch: '',
      planDate: new Date().toISOString().slice(0, 10),
      applicant: '',
    });
  };

  const columns: TableColumn<TryMoldApply>[] = [
    {
      key: 'projectNo',
      title: '项目号',
      dataIndex: 'projectNo',
      width: 120,
      sorter: (a, b) => a.projectNo.localeCompare(b.projectNo),
      render: (v) => <span className="font-semibold text-primary-700">{v}</span>,
    },
    {
      key: 'tryNo',
      title: '试模次数',
      dataIndex: 'tryNo',
      width: 100,
      align: 'center',
      render: (v) => (
        <div className="flex items-center justify-center gap-1.5">
          <Hash className="w-4 h-4 text-neutral-400" />
          <span className="font-medium">第{v}次</span>
        </div>
      ),
    },
    {
      key: 'machineNo',
      title: '注塑机',
      dataIndex: 'machineNo',
      width: 130,
      render: (v) => (
        <div className="flex items-center gap-1.5">
          <Factory className="w-4 h-4 text-neutral-400" />
          <span>{v}</span>
        </div>
      ),
    },
    {
      key: 'material',
      title: '材料',
      dataIndex: 'material',
      width: 100,
      render: (v) => (
        <div className="flex items-center gap-1.5">
          <Package className="w-4 h-4 text-neutral-400" />
          <span>{v}</span>
        </div>
      ),
    },
    {
      key: 'materialBatch',
      title: '批号',
      dataIndex: 'materialBatch',
      width: 140,
      render: (v) => <span className="text-neutral-600">{v}</span>,
    },
    {
      key: 'planDate',
      title: '计划日期',
      dataIndex: 'planDate',
      width: 120,
      align: 'center',
      sorter: (a, b) => a.planDate.localeCompare(b.planDate),
      render: (v) => (
        <div className="flex items-center justify-center gap-1.5">
          <Calendar className="w-4 h-4 text-neutral-400" />
          <span>{v}</span>
        </div>
      ),
    },
    {
      key: 'applicant',
      title: '申请人',
      dataIndex: 'applicant',
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
      width: 200,
      align: 'center',
      render: (_v, record) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={ClipboardList}
            onClick={() => {
              const records = getApplyRecords(record.id);
              if (records.length > 0) {
                navigate(`/trymold/record/${records[0].id}`);
              } else {
                navigate(`/trymold/new-record/${record.id}`);
              }
            }}
          >
            试模记录
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={Eye}
            onClick={() => {
              const records = getApplyRecords(record.id);
              if (records.length > 0) {
                const { inspections } = useTryMoldStore.getState();
                const inspection = inspections.find(
                  (i) => i.tryRecordId === records[0].id
                );
                if (inspection) {
                  navigate(`/trymold/inspection/${inspection.id}`);
                } else {
                  alert('该申请暂无检验报告');
                }
              } else {
                alert('该申请暂无试模记录');
              }
            }}
          >
            检验报告
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
            <Inbox className="w-6 h-6 text-primary-700" />
            试模申请列表
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            管理注塑试模申请单与进度跟踪
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/trymold/lifetime')}>
            寿命看板
          </Button>
          <Button icon={Plus} onClick={() => setModalOpen(true)}>
            新建申请
          </Button>
        </div>
      </div>

      <div className="card p-5">
        <Table<TryMoldApply>
          columns={columns}
          dataSource={applies}
          rowKey="id"
          bordered
          pageSize={10}
          emptyText="暂无试模申请"
        />
      </div>

      <Modal
        open={modalOpen}
        title="新建试模申请"
        onClose={() => setModalOpen(false)}
        width="max-w-3xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit}>提交申请</Button>
          </div>
        }
      >
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
            onChange={(e) => {
              const pid = e.target.value;
              const count = applies.filter((a) => a.projectId === pid).length;
              setForm({ ...form, projectId: pid, tryNo: count + 1 });
            }}
          />
          <Input
            label="试模次数"
            required
            type="number"
            value={form.tryNo}
            onChange={(e) =>
              setForm({ ...form, tryNo: Number(e.target.value) })
            }
          />
          <Input
            label="注塑机编号"
            required
            placeholder="如：IM-280T-03"
            value={form.machineNo}
            onChange={(e) => setForm({ ...form, machineNo: e.target.value })}
          />
          <Input
            label="原材料"
            required
            placeholder="如：PP、ABS、PA66+GF30"
            value={form.material}
            onChange={(e) => setForm({ ...form, material: e.target.value })}
          />
          <Input
            label="材料批号"
            placeholder="如：PP-20260505-B"
            value={form.materialBatch}
            onChange={(e) => setForm({ ...form, materialBatch: e.target.value })}
          />
          <Input
            label="计划试模日期"
            required
            type="date"
            value={form.planDate}
            onChange={(e) => setForm({ ...form, planDate: e.target.value })}
          />
          <Input
            label="申请人"
            required
            placeholder="请输入申请人姓名"
            value={form.applicant}
            onChange={(e) => setForm({ ...form, applicant: e.target.value })}
            wrapperClassName="col-span-2"
          />
        </div>
      </Modal>
    </div>
  );
}
