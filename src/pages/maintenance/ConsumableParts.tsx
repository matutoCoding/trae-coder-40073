import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Plus,
  ArrowLeft,
  ArrowDownToLine,
  ArrowUpFromLine,
  Trash2,
  AlertTriangle,
  Factory,
  DollarSign,
  Search,
} from 'lucide-react';
import Table from '@/components/ui/Table';
import type { TableColumn } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Tag from '@/components/ui/Tag';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { useMaintenanceStore } from '@/store/maintenance';
import type { ConsumableParts as CPart } from '@/types';
import { cn } from '@/lib/utils';

export default function ConsumableParts() {
  const navigate = useNavigate();
  const [stockModal, setStockModal] = useState(false);
  const [stockType, setStockType] = useState<'in' | 'out'>('in');
  const [selectedPart, setSelectedPart] = useState<CPart | null>(null);
  const [stockQty, setStockQty] = useState(1);
  const [searchText, setSearchText] = useState('');

  const { consumableParts, stockIn, stockOut } = useMaintenanceStore();

  const filteredParts = consumableParts.filter(
    (p) =>
      !searchText ||
      p.name.toLowerCase().includes(searchText.toLowerCase()) ||
      p.code.toLowerCase().includes(searchText.toLowerCase())
  );

  const lowStockCount = consumableParts.filter(
    (p) => p.stock <= p.minStock
  ).length;
  const totalStockValue = consumableParts.reduce(
    (sum, p) => sum + p.stock * p.unitPrice,
    0
  );

  const openStockModal = (part: CPart, type: 'in' | 'out') => {
    setSelectedPart(part);
    setStockType(type);
    setStockQty(1);
    setStockModal(true);
  };

  const handleStock = () => {
    if (!selectedPart) return;
    if (stockType === 'in') {
      stockIn(selectedPart.id, stockQty);
    } else {
      const ok = stockOut(selectedPart.id, stockQty);
      if (!ok) {
        alert('库存不足，无法出库');
        return;
      }
    }
    setStockModal(false);
  };

  const columns: TableColumn<CPart>[] = [
    {
      key: 'code',
      title: '编码',
      dataIndex: 'code',
      width: 130,
      sorter: (a, b) => a.code.localeCompare(b.code),
      render: (v) => (
        <span className="font-mono text-sm text-primary-700">{v}</span>
      ),
    },
    {
      key: 'name',
      title: '名称',
      dataIndex: 'name',
      width: 220,
      render: (v, r) => (
        <div className="space-y-0.5">
          <p className="font-medium">{v}</p>
          <p className="text-xs text-neutral-400">{r.spec}</p>
        </div>
      ),
    },
    {
      key: 'spec',
      title: '规格',
      dataIndex: 'spec',
      width: 180,
      render: (v) => <span className="text-sm text-neutral-600">{v}</span>,
    },
    {
      key: 'unit',
      title: '单位',
      dataIndex: 'unit',
      width: 70,
      align: 'center',
      render: (v) => <span className="text-neutral-500">{v}</span>,
    },
    {
      key: 'stock',
      title: '库存',
      dataIndex: 'stock',
      width: 110,
      align: 'center',
      sorter: (a, b) => a.stock - b.stock,
      render: (v, r) => {
        const isLow = v <= r.minStock;
        return (
          <div
          className={cn(
            'px-2 py-1 rounded-md text-sm font-semibold tabular-nums',
            isLow
              ? 'bg-danger-light text-danger'
              : 'bg-primary-50 text-primary-700'
            )}
          >
            {v}
          </div>
        );
      },
    },
    {
      key: 'minStock',
      title: '安全库存',
      dataIndex: 'minStock',
      width: 100,
      align: 'center',
      render: (v) => (
        <span className="text-neutral-500 tabular-nums">{v}</span>
      ),
    },
    {
      key: 'warning',
      title: '库存预警',
      width: 110,
      align: 'center',
      render: (_v, r) => {
        const diff = r.stock - r.minStock;
        if (r.stock <= r.minStock) {
          return (
            <Tag variant="danger" icon={AlertTriangle}>
              不足 {Math.abs(diff)}{r.unit}
            </Tag>
          );
        }
        if (r.stock <= r.minStock * 1.5) {
          return <Tag variant="warning">偏低</Tag>;
        }
        return <Tag variant="success">正常</Tag>;
      },
    },
    {
      key: 'supplier',
      title: '供应商',
      dataIndex: 'supplier',
      width: 200,
      render: (v) => (
        <div className="flex items-center gap-1.5">
          <Factory className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-sm text-neutral-600">{v}</span>
        </div>
      ),
    },
    {
      key: 'unitPrice',
      title: '单价',
      dataIndex: 'unitPrice',
      width: 110,
      align: 'right',
      sorter: (a, b) => a.unitPrice - b.unitPrice,
      render: (v) => (
        <div className="flex items-center justify-end gap-1">
          <DollarSign className="w-4 h-4 text-accent-600" />
          <span className="font-mono font-semibold text-neutral-700 tabular-nums">
            ¥{v.toFixed(2)}
          </span>
        </div>
      ),
    },
    {
      key: 'action',
      title: '操作',
      width: 160,
      align: 'center',
      render: (_v, record) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            size="sm"
            variant="success"
            icon={ArrowDownToLine}
            onClick={() => openStockModal(record, 'in')}
          >
            入库
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={ArrowUpFromLine}
            onClick={() => openStockModal(record, 'out')}
          >
            出库
          </Button>
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
              <Package className="w-6 h-6 text-primary-700" />
              易损件管理
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              管理模具常用易损件库存与出入库
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Input
            placeholder="搜索编码或名称..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            leftIcon={Search}
            wrapperClassName="w-64"
          />
          <Button icon={Plus}>新增配件</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <p className="text-sm text-neutral-500 mb-1">配件种类</p>
          <p className="text-2xl font-bold text-neutral-800">
            {consumableParts.length}
          </p>
          <p className="text-xs text-neutral-400">SKU总数</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-neutral-500 mb-1">库存总价值</p>
          <p className="text-2xl font-bold text-accent-600 tabular-nums">
            ¥{totalStockValue.toLocaleString()}
          </p>
          <p className="text-xs text-neutral-400">按单价计算</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-neutral-500 mb-1">库存预警</p>
          <p
            className={cn(
              'text-2xl font-bold tabular-nums',
              lowStockCount > 0 ? 'text-danger' : 'text-success'
            )}
          >
            {lowStockCount}
          </p>
          <p className="text-xs text-neutral-400">
            {lowStockCount > 0 ? '低于安全库存' : '全部正常'}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-neutral-500 mb-1">本月出库</p>
          <p className="text-2xl font-bold text-primary-700">328</p>
          <p className="text-xs text-neutral-400">领用/更换数量</p>
        </div>
      </div>

      <div className="card p-5">
        <Table<CPart>
          columns={columns}
          dataSource={filteredParts}
          rowKey="id"
          bordered
          pageSize={10}
          emptyText="暂无配件数据"
          rowClassName={(r) =>
            r.stock <= r.minStock ? 'bg-danger-light/20' : undefined
          }
        />
      </div>

      <Modal
        open={stockModal}
        title={
          <div className="flex items-center gap-2">
          {stockType === 'in' ? (
              <ArrowDownToLine className="w-5 h-5 text-success" />
          ) : (
              <ArrowUpFromLine className="w-5 h-5 text-accent-600" />
          )}
          {stockType === 'in' ? '配件入库' : '配件出库'}
          </div>
        }
        onClose={() => setStockModal(false)}
        width="max-w-md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setStockModal(false)}>
              取消
            </Button>
            <Button
              variant={stockType === 'in' ? 'success' : 'primary'}
              onClick={handleStock}
            >
              确认{stockType === 'in' ? '入库' : '出库'}
            </Button>
          </div>
        }
      >
        {selectedPart && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-neutral-500">编码：</span>
                  <span className="font-mono">{selectedPart.code}</span>
                </div>
                <div>
                  <span className="text-neutral-500">名称：</span>
                  <span className="font-medium">{selectedPart.name}</span>
                </div>
                <div>
                  <span className="text-neutral-500">规格：</span>
                  <span>{selectedPart.spec}</span>
                </div>
                <div>
                  <span className="text-neutral-500">当前库存：</span>
                  <span
                    className={cn(
                      'font-semibold tabular-nums',
                      selectedPart.stock <= selectedPart.minStock
                        ? 'text-danger'
                        : 'text-primary-700'
                    )}
                  >
                    {selectedPart.stock} {selectedPart.unit}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500">安全库存：</span>
                  <span className="tabular-nums">
                    {selectedPart.minStock} {selectedPart.unit}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500">单价：</span>
                  <span className="font-mono text-accent-600">
                    ¥{selectedPart.unitPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <Input
                  label={stockType === 'in' ? '入库数量' : '出库数量'}
                  required
                  type="number"
                  min={1}
                  max={stockType === 'out' ? selectedPart.stock : undefined}
                  value={stockQty}
                  onChange={(e) => setStockQty(Number(e.target.value))}
                  wrapperClassName="flex-1"
                />
                <div className="pt-6">
                  <span className="text-neutral-400">{selectedPart.unit}</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg border bg-white border-neutral-200">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">{stockType === 'in' ? '入库后库存：' : '出库后库存：'}</span>
                <span className="font-mono font-semibold text-primary-700 tabular-nums">
                  {stockType === 'in'
                    ? selectedPart.stock + stockQty
                    : Math.max(0, selectedPart.stock - stockQty)}{' '}
                  {selectedPart.unit}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-neutral-500">{stockType === 'in' ? '入库金额：' : '出库金额：'}</span>
                <span className="font-mono font-bold text-danger tabular-nums">
                  ¥{(selectedPart.unitPrice * stockQty).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
