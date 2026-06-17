import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ClipboardCheck,
  Plus,
  Trash2,
  User,
  Calendar,
  FileImage,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  PenLine,
  Save,
} from 'lucide-react';
import Table from '@/components/ui/Table';
import type { TableColumn } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Tag from '@/components/ui/Tag';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Modal from '@/components/ui/Modal';
import { useTryMoldStore } from '@/store/trymold';
import type { InspectionItem } from '@/types';
import { cn } from '@/lib/utils';

export default function InspectionReport() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [itemModal, setItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<InspectionItem>>({});

  const {
    updateInspection,
    addInspectionItem,
    updateInspectionItem,
    removeInspectionItem,
    records: allRecords,
  } = useTryMoldStore();

  const { inspections } = useTryMoldStore.getState();
  const inspection = inspections.find((i) => i.id === id);
  const record = inspection
    ? allRecords.find((r) => r.id === inspection.tryRecordId)
    : undefined;

  const [localResult, setLocalResult] = useState<'pass' | 'fail' | 'conditional'>(
    inspection?.result || 'conditional'
  );
  const [inspector, setInspector] = useState(inspection?.inspector || '');
  const [reportDate, setReportDate] = useState(
    inspection?.reportDate || new Date().toISOString().slice(0, 10)
  );
  const [remark, setRemark] = useState(inspection?.remark || '');
  const [signature, setSignature] = useState(false);

  const calcPassRate = useMemo(() => {
    if (!inspection) return 0;
    const pass = inspection.items.filter((i) => i.result === 'pass').length;
    const total = inspection.items.length;
    return total === 0 ? 0 : Math.round((pass / total) * 100);
  }, [inspection]);

  if (!inspection) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-500">检验报告不存在</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/trymold')}>
          返回列表
        </Button>
      </div>
    );
  }

  const columns: TableColumn<InspectionItem>[] = [
    {
      key: 'name',
      title: '检测项',
      dataIndex: 'name',
      width: 200,
      render: (v, _r, idx) => (
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center">
            {idx + 1}
          </span>
          <span className="font-medium">{v}</span>
        </div>
      ),
    },
    {
      key: 'dimension',
      title: '理论尺寸',
      dataIndex: 'dimension',
      width: 130,
      align: 'center',
      render: (v) => <span className="font-mono text-neutral-700">{v}</span>,
    },
    {
      key: 'tolerance',
      title: '公差',
      dataIndex: 'tolerance',
      width: 110,
      align: 'center',
      render: (v) => (
        <span className="font-mono text-sm text-neutral-500">{v}</span>
      ),
    },
    {
      key: 'measured',
      title: '实测值',
      width: 180,
      dataIndex: 'measured',
      render: (v, item) => (
        <Input
          size="sm"
          value={v}
          onChange={(e) => {
            const measured = e.target.value;
            let result: 'pass' | 'fail' = 'pass';
            if (inspection) {
              updateInspectionItem(id, item.id, { measured, result });
            }
          }}
        />
      ),
    },
    {
      key: 'result',
      title: '结果',
      dataIndex: 'result',
      width: 100,
      align: 'center',
      render: (v) =>
        v === 'pass' ? (
          <Tag variant="success" icon={CheckCircle2}>
            合格
          </Tag>
        ) : (
          <Tag variant="danger" icon={XCircle}>
            不合格
          </Tag>
        ),
    },
    {
      key: 'action',
      title: '操作',
      width: 80,
      align: 'center',
      render: (_v, item) => (
        <Button
          size="sm"
          variant="ghost"
          icon={Trash2}
          className="text-danger hover:text-danger"
          onClick={() => removeInspectionItem(id, item.id)}
        />
      ),
    },
  ];

  const handleAddItem = () => {
    if (!editingItem.name) return;
    addInspectionItem(id, {
      name: editingItem.name,
      dimension: editingItem.dimension || '',
      tolerance: editingItem.tolerance || '',
      measured: editingItem.measured || '',
      result: 'pass',
    });
    setItemModal(false);
    setEditingItem({});
  };

  const handleSave = () => {
    if (!signature) {
      alert('请先完成签名确认');
      return;
    }
    updateInspection(id, {
      result: localResult,
      inspector,
      reportDate,
      remark,
    });
    navigate('/trymold');
  };

  const resultColor =
    localResult === 'pass'
      ? 'text-success'
      : localResult === 'fail'
        ? 'text-danger'
        : 'text-accent-600';
  const resultBg =
    localResult === 'pass'
      ? 'bg-success-light border-success'
      : localResult === 'fail'
        ? 'bg-danger-light border-danger'
        : 'bg-accent-50 border-accent-600';

  const autoResult = useMemo(() => {
    if (!inspection) return 'conditional';
    const failCount = inspection.items.filter((i) => i.result === 'fail').length;
    const total = inspection.items.length;
    if (total === 0) return 'conditional';
    if (failCount === 0) return 'pass';
    if (failCount / total > 0.3) return 'fail';
    return 'conditional';
  }, [inspection]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/trymold')}
          >
            返回
          </Button>
          <div>
            <h1 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
              <ClipboardCheck className="w-6 h-6 text-primary-700" />
              产品检验报告
            </h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              报告编号：{inspection.sampleNo}
              {record && ` | 关联试模记录：${record.recordDate}`}
            </p>
          </div>
        </div>
        <Button icon={Save} onClick={handleSave}>
          保存报告
        </Button>
      </div>

      <div className="card p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
          <div>
            <label className="text-sm text-neutral-500">样品编号</label>
            <p className="text-lg font-bold text-neutral-800">{inspection.sampleNo}</p>
          </div>
          <div>
            <label className="text-sm text-neutral-500">检测项总数</label>
            <p className="text-lg font-bold text-neutral-800">
              {inspection.items.length} 项
            </p>
          </div>
          <div>
            <label className="text-sm text-neutral-500">合格率</label>
            <p
              className={cn(
                'text-lg font-bold',
                calcPassRate >= 90
                  ? 'text-success'
                  : calcPassRate >= 70
                    ? 'text-accent-600'
                    : 'text-danger'
              )}
            >
              {calcPassRate}%
              <Tag
                variant={
                  calcPassRate >= 90
                    ? 'success'
                    : calcPassRate >= 70
                      ? 'accent'
                      : 'danger'
                }
                className="ml-2"
              >
                自动计算
              </Tag>
            </p>
          </div>
          <div>
            <label className="text-sm text-neutral-500">系统建议判定</label>
            <div className="mt-1">
              {autoResult === 'pass' && (
                <Tag variant="success" icon={CheckCircle2}>建议合格</Tag>
              )}
              {autoResult === 'fail' && (
                <Tag variant="danger" icon={XCircle}>建议不合格</Tag>
              )}
              {autoResult === 'conditional' && (
                <Tag variant="accent" icon={AlertTriangle}>建议条件合格</Tag>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-neutral-700">检验项明细</h3>
          <Button
            size="sm"
            variant="outline"
            icon={Plus}
            onClick={() => setItemModal(true)}
          >
            添加检测项
          </Button>
        </div>

        <Table<InspectionItem>
          columns={columns}
          dataSource={inspection.items}
          rowKey="id"
          bordered
          emptyText="暂无检验项，请添加"
        />
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-neutral-700 mb-4 flex items-center gap-2">
          <FileImage className="w-5 h-5 text-primary-600" />
          缺陷照片 (占位)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="aspect-video rounded-lg border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center bg-neutral-50/50 text-neutral-400 hover:border-primary-300 hover:bg-primary-50/30 transition-colors cursor-pointer"
            >
              <FileImage className="w-10 h-10 mb-2" />
              <span className="text-sm">缺陷照片 {i}</span>
              <span className="text-xs text-neutral-300 mt-0.5">点击上传</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-neutral-700 mb-4">检验结论与签名</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="label label-required">整体判定</label>
              <div className="flex gap-3">
                {[
                  { v: 'pass', label: '合格', icon: CheckCircle2, color: 'success' },
                  { v: 'conditional', label: '条件合格', icon: AlertTriangle, color: 'accent' },
                  { v: 'fail', label: '不合格', icon: XCircle, color: 'danger' },
                ].map((opt) => (
                  <button
                    key={opt.v}
                    onClick={() => setLocalResult(opt.v as any)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all font-medium',
                      localResult === opt.v
                        ? `bg-${opt.color}-light/50 border-${opt.color}`
                        : 'bg-white border-neutral-200 hover:border-neutral-300'
                    )}
                    style={
                      localResult === opt.v
                        ? {
                            backgroundColor:
                              opt.color === 'success'
                                ? 'rgba(34,197,94,0.1)'
                                : opt.color === 'danger'
                                  ? 'rgba(239,68,68,0.1)'
                                  : 'rgba(232,119,34,0.1)',
                            borderColor:
                              opt.color === 'success'
                                ? '#22c55e'
                                : opt.color === 'danger'
                                  ? '#ef4444'
                                  : '#E87722',
                          }
                        : {}
                    }
                  >
                    <opt.icon className="w-5 h-5" style={{
                      color:
                        opt.color === 'success'
                          ? '#22c55e'
                          : opt.color === 'danger'
                            ? '#ef4444'
                            : '#E87722',
                    }} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">备注说明</label>
              <Textarea
                rows={4}
                placeholder="条件合格或不合格时，请填写详细说明..."
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label label-required">检验员</label>
                <Input
                  leftIcon={User}
                  placeholder="请输入检验员姓名"
                  value={inspector}
                  onChange={(e) => setInspector(e.target.value)}
                />
              </div>
              <div>
                <label className="label label-required">报告日期</label>
                <Input
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                />
              </div>
            </div>

            <div
              className={cn(
                'p-5 rounded-lg border-2 transition-all',
                signature ? resultBg : 'bg-neutral-50 border-neutral-200 border-dashed'
              )}
              style={
                signature && resultBg
                  ? {
                      backgroundColor:
                        localResult === 'pass'
                          ? 'rgba(34,197,94,0.08)'
                          : localResult === 'fail'
                            ? 'rgba(239,68,68,0.08)'
                            : 'rgba(232,119,34,0.08)',
                      borderColor:
                        localResult === 'pass'
                          ? '#22c55e'
                          : localResult === 'fail'
                            ? '#ef4444'
                            : '#E87722',
                    }
                  : {}
              }
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <PenLine className="w-5 h-5 text-neutral-500" />
                  <span className="font-medium text-neutral-700">签名确认</span>
                </div>
                {signature && (
                  <Tag variant={localResult === 'pass' ? 'success' : localResult === 'fail' ? 'danger' : 'accent'}>
                    已签名
                  </Tag>
                )}
              </div>
              {signature ? (
                <div className="text-center py-2">
                  <p className={cn('text-2xl font-bold mb-1', resultColor)}>
                    {inspector || '检验员'}
                  </p>
                  <p className="text-sm text-neutral-500">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {reportDate}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <Button variant="outline" icon={PenLine} onClick={() => setSignature(true)}>
                    点击签名确认
                  </Button>
                  <p className="text-xs text-neutral-400 mt-2">
                    签名后即表示对本报告负责
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={itemModal}
        title="添加检测项"
        onClose={() => setItemModal(false)}
        width="max-w-lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setItemModal(false)}>
              取消
            </Button>
            <Button onClick={handleAddItem}>确认添加</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="检测项名称"
            required
            placeholder="如：外径尺寸A、高度尺寸B..."
            value={editingItem.name || ''}
            onChange={(e) =>
              setEditingItem({ ...editingItem, name: e.target.value })
            }
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="理论尺寸"
              placeholder="如：Φ120.0、85.0..."
              value={editingItem.dimension || ''}
              onChange={(e) =>
                setEditingItem({ ...editingItem, dimension: e.target.value })
              }
            />
            <Input
              label="公差范围"
              placeholder="如：±0.05、+0.1/-0..."
              value={editingItem.tolerance || ''}
              onChange={(e) =>
                setEditingItem({ ...editingItem, tolerance: e.target.value })
              }
            />
          </div>
          <Input
            label="实测值(可选)"
            placeholder="留空可后续填写"
            value={editingItem.measured || ''}
            onChange={(e) =>
              setEditingItem({ ...editingItem, measured: e.target.value })
            }
          />
        </div>
      </Modal>
    </div>
  );
}
