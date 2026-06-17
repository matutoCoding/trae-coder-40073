import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Thermometer,
  Gauge,
  Clock3,
  Timer,
  Package,
  AlertOctagon,
  FileText,
  Settings,
  ListChecks,
  Bug,
  Send,
} from 'lucide-react';
import Tabs from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Tag from '@/components/ui/Tag';
import Select from '@/components/ui/Select';
import { useTryMoldStore } from '@/store/trymold';
import { cn } from '@/lib/utils';

const DEFECT_OPTIONS = [
  '飞边',
  '缩痕',
  '银纹',
  '气泡',
  '熔接痕',
  '顶白',
  '变形',
  '色差',
  '缺胶',
  '烧焦',
  '脱模不良',
  '冷料斑',
  '流痕',
  '开裂',
];

const TEMP_ZONES = ['一段', '二段', '三段', '四段', '五段'];

export default function TryMoldRecord() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('params');

  const {
    getApply,
    addRecord,
    addInspection,
    updateRecord,
    getApplyRecords,
    records: allRecords,
  } = useTryMoldStore();

  const isNew = id.startsWith('new-');
  const applyId = isNew ? id.replace('new-record/', '') : '';
  const realApplyId = isNew ? applyId : allRecords.find((r) => r.id === id)?.applyId || '';
  const apply = getApply(realApplyId);

  const [record, setRecord] = useState(() => {
    if (isNew) {
      return {
        applyId: applyId,
        sampleQty: 50,
        parameters: {
          temperature: [200, 200, 190, 60, 50],
          injectionPressure: 80,
          holdingPressure: 50,
          injectionSpeed: 60,
          coolingTime: 20,
          cycleTime: 35,
        },
        defects: [] as string[],
        adjustment: '',
        operator: '',
        recordDate: new Date().toISOString().slice(0, 10),
        images: [] as string[],
      };
    }
    const r = allRecords.find((x) => x.id === id);
    return (
      r || {
        applyId: '',
        sampleQty: 50,
        parameters: {
          temperature: [200, 200, 190, 60, 50],
          injectionPressure: 80,
          holdingPressure: 50,
          injectionSpeed: 60,
          coolingTime: 20,
          cycleTime: 35,
        },
        defects: [] as string[],
        adjustment: '',
        operator: '',
        recordDate: new Date().toISOString().slice(0, 10),
        images: [] as string[],
      }
    );
  });

  const toggleDefect = (d: string) => {
    const has = record.defects.includes(d);
    setRecord({
      ...record,
      defects: has
        ? record.defects.filter((x) => x !== d)
        : [...record.defects, d],
    });
  };

  const setTemp = (idx: number, v: number) => {
    const temp = [...record.parameters.temperature];
    temp[idx] = v;
    setRecord({ ...record, parameters: { ...record.parameters, temperature: temp } });
  };

  const handleSave = (withInspection: boolean) => {
    if (!record.operator) {
      alert('请填写操作员');
      return;
    }
    let recordId = id;
    if (isNew) {
      const rec = {
        ...record,
        applyId: applyId,
      };
      addRecord(rec);
      const records = getApplyRecords(applyId);
      recordId = records[records.length - 1]?.id || '';
    } else {
      updateRecord(id, record);
    }

    if (withInspection && recordId) {
      let itemIdx = 0;
      const items = [
        { id: `ii${Date.now()}-${itemIdx++}`, name: '外观检查', dimension: '无明显缺陷', tolerance: '-', measured: record.defects.length === 0 ? '合格' : '有缺陷', result: record.defects.length === 0 ? 'pass' as const : 'fail' as const },
        { id: `ii${Date.now()}-${itemIdx++}`, name: '尺寸A', dimension: '按图纸', tolerance: '±0.05', measured: '待测量', result: 'pass' as const },
        { id: `ii${Date.now()}-${itemIdx++}`, name: '尺寸B', dimension: '按图纸', tolerance: '±0.05', measured: '待测量', result: 'pass' as const },
      ];
      const passCount = items.filter((i) => i.result === 'pass').length;
      const failCount = items.filter((i) => i.result === 'fail').length;
      let result: 'pass' | 'fail' | 'conditional' = 'conditional';
      if (failCount === 0) result = 'pass';
      else if (failCount / items.length > 0.3) result = 'fail';

      addInspection({
        tryRecordId: recordId,
        sampleNo: `S-${Date.now().toString().slice(-8)}`,
        items,
        result,
        inspector: '陈华',
        reportDate: new Date().toISOString().slice(0, 10),
        remark: '',
      });
    }
    navigate('/trymold');
  };

  const defectTags = useMemo(
    () => DEFECT_OPTIONS.map((d) => ({ d, active: record.defects.includes(d) })),
    [record.defects]
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/trymold')}>
            返回
          </Button>
          <div>
            <h1 className="text-xl font-bold text-neutral-800">
              {isNew ? '新建试模记录' : '试模记录表单'}
            </h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              {apply
                ? `${apply.projectNo} | 第${apply.tryNo}次试模 | ${apply.machineNo}`
                : '记录注塑试模参数与结果'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/trymold')}>
            取消
          </Button>
          <Button variant="outline" onClick={() => handleSave(false)}>
            仅保存
          </Button>
          <Button icon={Send} onClick={() => handleSave(true)}>
            保存并生成检验
          </Button>
        </div>
      </div>

      <div className="card p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Input
            label="记录日期"
            type="date"
            value={record.recordDate}
            onChange={(e) => setRecord({ ...record, recordDate: e.target.value })}
          />
          <Input
            label="操作员"
            required
            placeholder="请输入操作员姓名"
            value={record.operator}
            onChange={(e) => setRecord({ ...record, operator: e.target.value })}
          />
          <Input
            label="试样数量(件)"
            type="number"
            value={record.sampleQty}
            onChange={(e) =>
              setRecord({ ...record, sampleQty: Number(e.target.value) })
            }
          />
          <Select
            label="材料颜色批次"
            options={[
              { value: 'A', label: '原色批次A' },
              { value: 'B', label: '原色批次B' },
              { value: 'C', label: '着色批次' },
            ]}
            placeholder="选择批次"
          />
        </div>
      </div>

      <Tabs
        tabs={[
          { key: 'params', label: '工艺设置', icon: Settings },
          { key: 'samples', label: '试样记录', icon: ListChecks },
          { key: 'defects', label: '缺陷记录', icon: Bug },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      <div className="mt-4">
        {activeTab === 'params' && (
          <div className="space-y-5">
            <div className="card p-5">
              <h3 className="font-semibold text-neutral-700 mb-4 flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-accent" />
                料筒温度设置 (多段温控)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {TEMP_ZONES.map((zone, idx) => (
                  <div key={zone} className="space-y-1">
                    <label className="text-sm font-medium text-neutral-600">
                      {zone} (°C)
                    </label>
                    <Input
                      type="number"
                      value={record.parameters.temperature[idx] || 0}
                      onChange={(e) => setTemp(idx, Number(e.target.value))}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="card p-5 space-y-4">
                <h3 className="font-semibold text-neutral-700 flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-primary-600" />
                  压力参数 (MPa)
                </h3>
                <Input
                  label="注射压力"
                  type="number"
                  leftIcon={Gauge}
                  value={record.parameters.injectionPressure}
                  onChange={(e) =>
                    setRecord({
                      ...record,
                      parameters: {
                        ...record.parameters,
                        injectionPressure: Number(e.target.value),
                      },
                    })
                  }
                />
                <Input
                  label="保压压力"
                  type="number"
                  leftIcon={Gauge}
                  value={record.parameters.holdingPressure}
                  onChange={(e) =>
                    setRecord({
                      ...record,
                      parameters: {
                        ...record.parameters,
                        holdingPressure: Number(e.target.value),
                      },
                    })
                  }
                />
              </div>

              <div className="card p-5 space-y-4">
                <h3 className="font-semibold text-neutral-700 flex items-center gap-2">
                  <Timer className="w-5 h-5 text-success" />
                  速度与时间参数
                </h3>
                <Input
                  label="注射速度 (%)"
                  type="number"
                  value={record.parameters.injectionSpeed}
                  onChange={(e) =>
                    setRecord({
                      ...record,
                      parameters: {
                        ...record.parameters,
                        injectionSpeed: Number(e.target.value),
                      },
                    })
                  }
                />
                <Input
                  label="冷却时间 (秒)"
                  type="number"
                  leftIcon={Clock3}
                  value={record.parameters.coolingTime}
                  onChange={(e) =>
                    setRecord({
                      ...record,
                      parameters: {
                        ...record.parameters,
                        coolingTime: Number(e.target.value),
                      },
                    })
                  }
                />
                <Input
                  label="成型周期 (秒)"
                  type="number"
                  leftIcon={Timer}
                  value={record.parameters.cycleTime}
                  onChange={(e) =>
                    setRecord({
                      ...record,
                      parameters: {
                        ...record.parameters,
                        cycleTime: Number(e.target.value),
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'samples' && (
          <div className="card p-5 space-y-5">
            <h3 className="font-semibold text-neutral-700 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary-600" />
              试样记录
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-primary-50/50 border border-primary-100">
                <p className="text-sm text-neutral-500">试样总数</p>
                <p className="text-2xl font-bold text-primary-700">
                  {record.sampleQty}
                </p>
                <p className="text-xs text-neutral-400">件</p>
              </div>
              <div className="p-4 rounded-lg bg-success-light/50 border border-success/20">
                <p className="text-sm text-neutral-500">合格数量</p>
                <p className="text-2xl font-bold text-success">
                  {Math.round(record.sampleQty * 0.85)}
                </p>
                <p className="text-xs text-neutral-400">预估合格率 85%</p>
              </div>
              <div className="p-4 rounded-lg bg-danger-light/50 border border-danger/20">
                <p className="text-sm text-neutral-500">缺陷数量</p>
                <p className="text-2xl font-bold text-danger">
                  {record.defects.length * 3}
                </p>
                <p className="text-xs text-neutral-400">含多缺陷件</p>
              </div>
              <div className="p-4 rounded-lg bg-info-light/50 border border-info/20">
                <p className="text-sm text-neutral-500">首件确认</p>
                <p className="text-2xl font-bold text-info">已完成</p>
                <p className="text-xs text-neutral-400">
                  {record.recordDate}
                </p>
              </div>
            </div>

            <div>
              <label className="label label-required">调整措施</label>
              <Textarea
                placeholder="请详细描述针对本次试模发现的问题所采取的调整措施，包括参数调整、模具修正等..."
                rows={6}
                value={record.adjustment}
                onChange={(e) => setRecord({ ...record, adjustment: e.target.value })}
              />
            </div>
          </div>
        )}

        {activeTab === 'defects' && (
          <div className="card p-5 space-y-5">
            <h3 className="font-semibold text-neutral-700 flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-danger" />
              缺陷记录 (多选)
            </h3>

            <div className="flex flex-wrap gap-3">
              {defectTags.map(({ d, active }) => (
                <button
                  key={d}
                  onClick={() => toggleDefect(d)}
                  className={cn(
                    'px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium',
                    active
                      ? 'bg-danger-light border-danger text-danger'
                      : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50'
                  )}
                >
                  {d}
                </button>
              ))}
            </div>

            {record.defects.length > 0 && (
              <div className="p-4 rounded-lg bg-danger-light/30 border border-danger/20">
                <p className="text-sm font-medium text-danger mb-2">
                  已选择 {record.defects.length} 项缺陷：
                </p>
                <div className="flex flex-wrap gap-2">
                  {record.defects.map((d) => (
                    <Tag key={d} variant="danger">
                      {d}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="label">缺陷补充说明 / 其他备注</label>
              <Textarea
                placeholder="可记录缺陷位置、严重程度、发生频次等补充信息..."
                rows={4}
              />
            </div>

            <div className="pt-3 border-t border-neutral-200">
              <p className="text-sm text-neutral-500 flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4" />
                缺陷照片上传 (占位)
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-lg border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center bg-neutral-50/50 text-neutral-400 hover:border-primary-300 hover:bg-primary-50/30 transition-colors cursor-pointer"
                  >
                    <Package className="w-8 h-8 mb-1" />
                    <span className="text-xs">照片 {i}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
