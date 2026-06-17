import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  AlertCircle,
  Search,
  Lightbulb,
  FileCheck,
  Plus,
  Trash2,
  ClipboardList,
  TestTubeDiagonal,
  Calculator,
  Save,
} from 'lucide-react';
import Tabs from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import type { TableColumn } from '@/components/ui/Table';
import Tag from '@/components/ui/Tag';
import Textarea from '@/components/ui/Textarea';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import { useMaintenanceStore } from '@/store/maintenance';
import { seedConsumableParts, seedUsers } from '@/data/seed';
import type { ConsumableUsage } from '@/types';
import { cn } from '@/lib/utils';

export default function RepairDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');
  const [partModal, setPartModal] = useState(false);
  const [newPart, setNewPart] = useState({
    partId: '',
    qty: 1,
  });

  const {
    getRepairOrder,
    updateRepairOrder,
    addRepairPart,
    removeRepairPart,
    getConsumablePart,
    stockOut,
    stockIn,
    consumableParts,
  } = useMaintenanceStore();

  const order = getRepairOrder(id);

  const [rootCause, setRootCause] = useState(order?.rootCause || '');
  const [solution, setSolution] = useState(order?.solution || '');
  const [hours, setHours] = useState(order?.repairHours || 0);
  const [status, setStatus] = useState(order?.status || 'pending');
  const [faultDesc, setFaultDesc] = useState(order?.faultDescription || '');

  const partAmount = useMemo(() => {
    if (!order) return 0;
    return order.parts.reduce((sum, p) => sum + p.qty * p.unitPrice, 0);
  }, [order]);

  const statusMap: Record<
    string,
    { label: string; variant: 'gray' | 'primary' | 'accent' | 'success' | 'warning' }
  > = {
    pending: { label: '待维修', variant: 'warning' },
    repairing: { label: '维修中', variant: 'primary' },
    testing: { label: '测试中', variant: 'accent' },
    completed: { label: '已完成', variant: 'success' },
  };

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-500">工单不存在</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/maintenance')}>
          返回列表
        </Button>
      </div>
    );
  }

  const partsColumns: TableColumn<ConsumableUsage>[] = [
    {
      key: 'partName',
      title: '配件名称',
      dataIndex: 'partName',
      render: (v) => <span className="font-medium">{v}</span>,
    },
    {
      key: 'spec',
      title: '规格',
      width: 160,
      render: (_v, record) => {
        const part = consumableParts.find((p) => p.id === record.partId);
        return <span className="text-neutral-500 text-sm">{part?.spec || '-'}</span>;
      },
    },
    {
      key: 'qty',
      title: '数量',
      dataIndex: 'qty',
      width: 100,
      align: 'center',
      render: (v) => <span className="font-medium">{v}</span>,
    },
    {
      key: 'unitPrice',
      title: '单价(元)',
      dataIndex: 'unitPrice',
      width: 120,
      align: 'right',
      render: (v) => (
        <span className="font-mono">¥{v.toFixed(2)}</span>
      ),
    },
    {
      key: 'amount',
      title: '金额(元)',
      width: 120,
      align: 'right',
      render: (_v, record) => (
        <span className="font-mono font-semibold text-primary-700">
          ¥{(record.qty * record.unitPrice).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'action',
      title: '操作',
      width: 80,
      align: 'center',
      render: (_v, record) => (
        <Button
          size="sm"
          variant="ghost"
          icon={Trash2}
          className="text-danger hover:text-danger"
          onClick={() => {
            stockIn(record.partId, record.qty);
            removeRepairPart(id, record.id);
          }}
        />
      ),
    },
  ];

  const addPart = () => {
    const part = consumableParts.find((p) => p.id === newPart.partId);
    if (!part || newPart.qty <= 0) return;
    if (part.stock < newPart.qty) {
      alert(`库存不足！当前库存仅 ${part.stock} 件，无法领用 ${newPart.qty} 件。请先补充库存。`);
      return;
    }
    const ok = stockOut(part.id, newPart.qty);
    if (!ok) {
      alert('库存扣减失败，请检查库存数量');
      return;
    }
    addRepairPart(id, {
      partId: part.id,
      partName: part.name,
      qty: newPart.qty,
      unitPrice: part.unitPrice,
    });
    setPartModal(false);
    setNewPart({ partId: '', qty: 1 });
  };

  const handleSave = () => {
    updateRepairOrder(id, {
      rootCause,
      solution,
      repairHours: Number(hours),
      status,
      faultDescription: faultDesc,
    });
    navigate('/maintenance');
  };

  const availableParts = consumableParts.filter(
    (p) => !order.parts.find((x) => x.partId === p.id)
  );

  const operatorUsers = seedUsers.filter(
    (u) => u.role === 'operator' || u.role === 'admin'
  );

  const mockTestRecords = [
    { date: '2026-06-16', item: '开合模测试', result: '合格', operator: '杜飞' },
    { date: '2026-06-16', item: '顶出机构测试', result: '合格', operator: '杜飞' },
    { date: '2026-06-17', item: '冷却水路测试', result: '合格', operator: '杜飞' },
  ];

  const mockMaintenanceRecords = [
    { date: '2026-05-20', type: '定期保养', operator: '杜飞', remark: '更换弹簧，润滑导柱' },
    { date: '2026-05-10', type: '故障维修', operator: '贾健', remark: '顶针磨损更换' },
    { date: '2026-04-25', type: '首次试模', operator: '赵刚', remark: '首次验收' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/maintenance')}
          >
            返回
          </Button>
          <div>
            <h1 className="text-xl font-bold text-neutral-800">
              维修工单详情
            </h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              工单：{order.orderNo} | 项目：{order.projectNo} | 维修员：{order.repairer}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            options={Object.entries(statusMap).map(([k, v]) => ({
              value: k,
              label: v.label,
            }))}
            wrapperClassName="w-36"
          />
          <Button icon={Save} onClick={handleSave}>
            保存工单
          </Button>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-start gap-2 mb-4">
          <Tag
            variant={statusMap[status]?.variant || 'gray'}
          >
            {statusMap[status]?.label}
          </Tag>
          <Tag variant="primary">{order.faultType}</Tag>
          <span className="text-sm text-neutral-400 ml-auto">
            报修日期：{order.applyDate}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
              <AlertCircle className="w-5 h-5 text-danger" />
              故障描述
            </div>
            <Textarea
              rows={6}
              value={faultDesc}
              onChange={(e) => setFaultDesc(e.target.value)}
              className="bg-neutral-50/50"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
              <Search className="w-5 h-5 text-accent-600" />
              根因分析
            </div>
            <Textarea
              rows={6}
              placeholder="请分析故障产生的根本原因..."
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
              <Lightbulb className="w-5 h-5 text-success" />
              维修方案
            </div>
            <Textarea
              rows={6}
              placeholder="请描述具体的维修实施方案..."
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary-700" />
            <h3 className="font-semibold text-neutral-700">更换易损件清单</h3>
          </div>
          <Button
            size="sm"
            variant="outline"
            icon={Plus}
            onClick={() => setPartModal(true)}
            disabled={availableParts.length === 0}
          >
            添加配件
          </Button>
        </div>

        <Table<ConsumableUsage>
          columns={partsColumns}
          dataSource={order.parts}
          rowKey="id"
          bordered
          emptyText="暂无更换配件记录"
        />

        {order.parts.length > 0 && (
          <div className="mt-4 flex justify-end">
            <div className="w-72 bg-neutral-50 rounded-lg p-4 border border-neutral-200">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">配件小计</span>
                  <span className="font-mono">¥{partAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">维修工时</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      size="sm"
                      value={hours}
                      onChange={(e) => setHours(Number(e.target.value))}
                      wrapperClassName="w-24"
                    />
                    <span className="text-neutral-500">小时</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">工时费用 (¥80/h)</span>
                  <span className="font-mono">¥{(hours * 80).toFixed(2)}</span>
                </div>
                <div className="border-t border-neutral-200 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-neutral-700">总费用</span>
                    <span className="text-xl font-bold text-danger">
                      ¥{(partAmount + hours * 80).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Tabs
        tabs={[
          { key: 'records', label: '维修记录', icon: ClipboardList },
          { key: 'tests', label: '测试记录', icon: TestTubeDiagonal },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      <div className="mt-4">
        {activeTab === 'records' && (
          <div className="card p-5">
            <h3 className="font-semibold text-neutral-700 mb-3">历史维修记录</h3>
            <Table
              columns={[
                { key: 'date', title: '日期', dataIndex: 'date', width: 120 },
                { key: 'type', title: '类型', dataIndex: 'type', width: 120 },
                {
                  key: 'operator',
                  title: '操作人',
                  dataIndex: 'operator',
                  width: 100,
                },
                { key: 'remark', title: '备注', dataIndex: 'remark' },
              ]}
              dataSource={mockMaintenanceRecords}
              bordered
              rowKey="date"
            />
          </div>
        )}

        {activeTab === 'tests' && (
          <div className="card p-5">
          <h3 className="font-semibold text-neutral-700 mb-3">维修后测试记录</h3>
            <Table
              columns={[
                { key: 'date', title: '测试日期', dataIndex: 'date', width: 120 },
                { key: 'item', title: '测试项目', dataIndex: 'item', width: 180 },
                {
                  key: 'result',
                  title: '结果',
                  dataIndex: 'result',
                  width: 100,
                  align: 'center',
                  render: (v) =>
                    v === '合格' ? (
                      <Tag variant="success" icon={FileCheck}>合格</Tag>
                    ) : (
                      <Tag variant="danger">不合格</Tag>
                    ),
                },
                {
                  key: 'operator',
                  title: '测试人',
                  dataIndex: 'operator',
                  width: 100,
                  align: 'center',
                },
              ]}
              dataSource={mockTestRecords}
              bordered
              rowKey="item"
            />
          </div>
        )}
      </div>

      <Modal
        open={partModal}
        title="添加更换配件"
        onClose={() => setPartModal(false)}
        width="max-w-md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPartModal(false)}>
              取消
            </Button>
            <Button onClick={addPart}>确认添加</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Select
            label="选择配件"
            required
            options={availableParts.map((p) => ({
              value: p.id,
              label: `${p.name} (库存: ${p.stock}, 单价: ¥${p.unitPrice}`,
            }))}
            placeholder="请选择配件"
            value={newPart.partId}
            onChange={(e) => setNewPart({ ...newPart, partId: e.target.value })}
          />
          <Input
            label="数量"
            required
            type="number"
            min={1}
            value={newPart.qty}
            onChange={(e) =>
              setNewPart({ ...newPart, qty: Number(e.target.value) })
            }
          />
          {newPart.partId && (
            <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-sm">
              {(() => {
                const p = consumableParts.find((x) => x.id === newPart.partId);
                return p ? (
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">当前库存</span>
                      <span className={`font-mono font-semibold ${
                        p.stock < p.minStock ? 'text-danger' : 'text-success-700'
                      }`}>
                        {p.stock} 件
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">单价</span>
                      <span className="font-mono">¥{p.unitPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">小计</span>
                      <span className="font-mono font-semibold text-primary-700">
                        ¥{(p.unitPrice * newPart.qty).toFixed(2)}
                      </span>
                    </div>
                    {p.stock < newPart.qty && (
                      <div className="mt-2 p-2 rounded-md bg-danger/10 border border-danger/20 text-danger text-xs flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <span>库存不足！当前库存 {p.stock} 件，无法领用 {newPart.qty} 件</span>
                      </div>
                    )}
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
