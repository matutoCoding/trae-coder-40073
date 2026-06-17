import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Archive,
  ArrowLeft,
  Calendar,
  User,
  ArrowRightLeft,
  MapPin,
  Clock,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import Table from '@/components/ui/Table';
import type { TableColumn } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Tag from '@/components/ui/Tag';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useMaintenanceStore } from '@/store/maintenance';
import type { MoldLedger } from '@/types';
import { cn } from '@/lib/utils';
import { seedUsers } from '@/data/seed';

const statusMap: Record<
  string,
  { label: string; variant: 'gray' | 'primary' | 'accent' | 'success' | 'warning' | 'info' | 'danger' }
> = {
  in_stock: { label: '在库', variant: 'success' },
  loaned: { label: '借出', variant: 'warning' },
  using: { label: '使用中', variant: 'primary' },
  repaired: { label: '维修中', variant: 'accent' },
  scrapped: { label: '报废', variant: 'danger' },
};

const STATUS_OPTIONS = [
  { value: 'in_stock', label: '在库' },
  { value: 'loaned', label: '借出' },
  { value: 'using', label: '使用中' },
  { value: 'repaired', label: '维修中' },
];

export default function MoldLedger() {
  const navigate = useNavigate();
  const [actionModal, setActionModal] = useState(false);
  const [actionType, setActionType] = useState<'borrow' | 'return'>('borrow');
  const [selectedLedger, setSelectedLedger] = useState<MoldLedger | null>(null);
  const [borrower, setBorrower] = useState('');
  const [location, setLocation] = useState('');
  const [cycles, setCycles] = useState(0);

  const {
    moldLedgers, changeLedgerStatus, updateLastCycles, filteredLedgers } =
      useMaintenanceStore();

  const ledgers = filteredLedgers();

  const openAction = (ledger: MoldLedger, type: 'borrow' | 'return') => {
    setSelectedLedger(ledger);
    setActionType(type);
    if (type === 'borrow') {
      setBorrower('');
    } else {
      setLocation(ledger.location);
    }
    setActionModal(true);
  };

  const handleAction = () => {
    if (!selectedLedger) return;
    if (actionType === 'borrow') {
      if (!borrower.trim()) {
        alert('请填写借用人');
        return;
      }
      changeLedgerStatus(selectedLedger.id, 'loaned', borrower.trim());
    } else {
      if (!location.trim()) {
        alert('请填写归还库位');
        return;
      }
      changeLedgerStatus(selectedLedger.id, 'in_stock', undefined, location.trim());
      if (cycles > 0) {
        updateLastCycles(selectedLedger.id, cycles);
      }
    }
    setBorrower('');
    setLocation('');
    setCycles(0);
    setActionModal(false);
  };

  const warehouseUsers = seedUsers.filter(
    (u) => u.role === 'warehouse' || u.role === 'operator' || u.role === 'admin'
  );

  const inStockCount = ledgers.filter((l) => l.status === 'in_stock').length;
  const loanedCount = ledgers.filter((l) => l.status === 'loaned' || l.status === 'using').length;
  const repairedCount = ledgers.filter((l) => l.status === 'repaired').length;

  const columns: TableColumn<MoldLedger>[] = [
    {
      key: 'moldNo',
      title: '模具编号',
      dataIndex: 'moldNo',
      width: 150,
      sorter: (a, b) => a.moldNo.localeCompare(b.moldNo),
      render: (v) => (
        <span className="font-mono text-sm font-semibold text-primary-700">{v}</span>
      ),
    },
    {
      key: 'projectNo',
      title: '对应项目',
      dataIndex: 'projectNo',
      width: 130,
      render: (v) => <span className="font-medium">{v}</span>,
    },
    {
      key: 'location',
      title: '库位',
      dataIndex: 'location',
      width: 180,
      render: (v) => (
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-neutral-400" />
          <span className="text-sm text-neutral-600">{v}</span>
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
        const cfg = statusMap[v as string] || statusMap.in_stock;
        return <Tag variant={cfg.variant}>{cfg.label}</Tag>;
      },
    },
    {
      key: 'inDate',
      title: '入库日期',
      dataIndex: 'inDate',
      width: 120,
      align: 'center',
      render: (v) => (
        <div className="flex items-center justify-center gap-1.5">
          <Calendar className="w-4 h-4 text-neutral-400" />
          <span>{v}</span>
        </div>
      ),
    },
    {
      key: 'outDate',
      title: '最近出库',
      width: 120,
      align: 'center',
      render: (v, r) => (
        <div className="flex items-center justify-center gap-1.5">
          <Clock className="w-4 h-4 text-neutral-400" />
          <span className={r.outDate ? '' : 'text-neutral-300'}>
            {r.outDate || '-'}
          </span>
        </div>
      ),
    },
    {
      key: 'borrower',
      title: '借用人',
      width: 120,
      align: 'center',
      render: (_v, r) => (
        <div className="flex items-center justify-center gap-1.5">
          <User className="w-4 h-4 text-neutral-400" />
          <span className={r.borrower ? '' : 'text-neutral-300'}>
            {r.borrower || '-'}
          </span>
        </div>
      ),
    },
    {
      key: 'lastCycles',
      title: '上次模次',
      dataIndex: 'lastCycles',
      width: 120,
      align: 'center',
      sorter: (a, b) => a.lastCycles - b.lastCycles,
      render: (v) => (
        <div className="flex items-center justify-center gap-1.5">
          <RefreshCw className="w-4 h-4 text-neutral-400" />
          <span className="font-mono font-medium tabular-nums">
            {v.toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      key: 'action',
      title: '操作',
      width: 180,
      align: 'center',
      render: (_v, record) => (
        <div className="flex items-center justify-center gap-2">
          {record.status === 'in_stock' ? (
          <Button
            size="sm"
            variant="primary"
            icon={ArrowRightLeft}
            onClick={() => openAction(record, 'borrow')}
          >
            借出
          </Button>
        ) : (
          record.status !== 'scrapped' && (
              <Button
                size="sm"
                variant="success"
                icon={CheckCircle2}
                onClick={() => openAction(record, 'return')}
              >
                归还
              </Button>
            )
          )}
        </div>
      ),
    },
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
            <h1 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
              <Archive className="w-6 h-6 text-primary-700" />
              模具入库台账
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              管理模具库存状态与出入库记录
            </p>
          </div>
        </div>
        <Button icon={Archive}>新增模具</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-sm text-neutral-500 mb-1">模具总数</p>
          <p className="text-2xl font-bold text-neutral-800">
            {ledgers.length}
          </p>
          <p className="text-xs text-neutral-400">台账登记模具</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-neutral-500 mb-1">在库数量</p>
          <p className="text-2xl font-bold text-success tabular-nums">
            {inStockCount}
          </p>
          <p className="text-xs text-neutral-400">可领用模具</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-neutral-500 mb-1">借出/使用中</p>
          <p className="text-2xl font-bold text-warning tabular-nums">
            {loanedCount}
          </p>
          <p className="text-xs text-neutral-400">在外模具</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-neutral-500 mb-1">维修中</p>
          <p className="text-2xl font-bold text-accent-600 tabular-nums">
            {repairedCount}
          </p>
          <p className="text-xs text-neutral-400">待返回</p>
        </div>
      </div>

      <div className="card p-5">
        <Table<MoldLedger>
          columns={columns}
          dataSource={ledgers}
          rowKey="id"
          bordered
          pageSize={10}
          emptyText="暂无模具台账"
        />
      </div>

      <Modal
        open={actionModal}
        title={
          <div className="flex items-center gap-2">
            {actionType === 'borrow' ? (
              <ArrowRightLeft className="w-5 h-5 text-warning" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-success" />
            )}
            {actionType === 'borrow' ? '模具借出登记' : '模具归还登记'}
          </div>
        }
        onClose={() => setActionModal(false)}
        width="max-w-lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setActionModal(false)}>
              取消
            </Button>
            <Button
              variant={actionType === 'borrow' ? 'primary' : 'success'}
              onClick={handleAction}
            >
              确认{actionType === 'borrow' ? '借出' : '归还'}
            </Button>
          </div>
        }
      >
        {selectedLedger && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-neutral-500">模具编号：</span>
                  <span className="font-mono font-semibold text-primary-700">
                    {selectedLedger.moldNo}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500">项目：</span>
                  <span className="font-medium">{selectedLedger.projectNo}</span>
                </div>
                <div>
                  <span className="text-neutral-500">库位：</span>
                  <span>{selectedLedger.location}</span>
                </div>
                <div>
                  <span className="text-neutral-500">当前状态：</span>
                  {(() => {
                    const cfg = statusMap[selectedLedger.status];
                    return <Tag variant={cfg.variant}>{cfg.label}</Tag>;
                  })()}
                </div>
              </div>
            </div>

            {actionType === 'borrow' ? (
              <div className="space-y-4">
                <Select
                  label="借用人/部门"
                  required
                  options={warehouseUsers.map((u) => ({
                    value: u.name,
                    label: `${u.name} (${u.role === 'admin' ? '管理员' : u.role === 'operator' ? '操作员' : '仓库员'})`,
                  }))}
                  placeholder="请选择借用人"
                  value={borrower}
                  onChange={(e) => setBorrower(e.target.value)}
                />
                <Input
                  label="借用备注"
                  placeholder="可选：填写借用事由或备注信息"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <Input
                  label="归还库位"
                  required
                  placeholder="请输入归还后的存放库位"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <Input
                  label="本次使用模次"
                  type="number"
                  min={0}
                  placeholder="请输入本次使用累积模次"
                  value={cycles === 0 ? '' : cycles}
                  onChange={(e) => setCycles(Number(e.target.value))}
                />
                <Select
                  label="归还后状态"
                  options={STATUS_OPTIONS}
                  value="in_stock"
                />
                <Input
                  label="归还备注"
                  placeholder="可选：模具状况说明或备注"
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
