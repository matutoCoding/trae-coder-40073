import { useMemo, useState } from 'react';
import { useElectrodeStore } from '../../store/electrode';
import ProgressBar from '../../components/ui/ProgressBar';
import Tag from '../../components/ui/Tag';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import {
  ArrowLeft,
  Sparkles,
  User,
  Clock,
  Layers,
  Battery,
  Zap,
  AlertCircle,
  Gauge,
  Activity,
  Play,
  RotateCcw,
  Save,
  Check,
  RefreshCw,
} from 'lucide-react';
import type { Electrode } from '../../types';
import { electrodeStatusMap } from '../../utils/status';

const ElectrodeDetail = () => {
  const { getElectrode, electrodes, recordUsage, updateEdmParams, changeStatus } = useElectrodeStore();
  const [edmParams, setEdmParams] = useState<Electrode['edmParams'] | null>(null);
  const [saved, setSaved] = useState(false);

  const idMatch = window.location.hash.match(/\/electrode\/([^/?#]+)/);
  const id = idMatch ? idMatch[1] : '';
  const electrode = useMemo(
    () => getElectrode(id) || electrodes[0],
    [id, getElectrode, electrodes]
  );

  const currentParams = edmParams ?? electrode?.edmParams;

  const handleBack = () => {
    window.location.hash = '#/electrode';
  };

  const handleRecordUsage = () => {
    if (electrode) {
      recordUsage(electrode.id, 1.5);
    }
  };

  const handleParamChange = <K extends keyof Electrode['edmParams']>(
    key: K,
    value: Electrode['edmParams'][K]
  ) => {
    setEdmParams((prev) => ({
      ...(prev ?? electrode?.edmParams ?? { voltage: 0, current: 0, pulseOn: 0, pulseOff: 0 }),
      [key]: value,
    }));
  };

  const handleSaveParams = () => {
    if (electrode && currentParams) {
      updateEdmParams(electrode.id, currentParams);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  };

  const handleChangeStatus = (status: Electrode['status']) => {
    if (electrode) {
      changeStatus(electrode.id, status);
    }
  };

  if (!electrode) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <AlertCircle className="w-16 h-16 text-neutral-300 mb-4" />
        <p className="text-neutral-500 mb-4">电极不存在或已被删除</p>
        <Button onClick={handleBack} icon={ArrowLeft}>
          返回列表
        </Button>
      </div>
    );
  }

  const lifePercent = Math.round((electrode.usedCount / electrode.maxUseCount) * 100);
  const lifeColor = lifePercent > 85 ? 'danger' : lifePercent > 60 ? 'warning' : 'success';
  const statusInfo = electrodeStatusMap[electrode.status];
  const statusVariant =
    electrode.status === 'worn'
      ? 'danger'
      : electrode.status === 'using'
        ? 'info'
        : electrode.status === 'machining'
          ? 'warning'
          : 'gray';

  const usageHistory = [
    { id: 'h1', date: '2026-06-17 14:30', hours: 2.5, operator: '张伟', project: electrode.projectNo },
    { id: 'h2', date: '2026-06-16 09:15', hours: 3.0, operator: '张伟', project: electrode.projectNo },
    { id: 'h3', date: '2026-06-15 15:45', hours: 2.0, operator: '李军', project: electrode.projectNo },
    { id: 'h4', date: '2026-06-14 10:20', hours: 1.5, operator: '李军', project: electrode.projectNo },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack} icon={ArrowLeft}>
            返回
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-neutral-900">
                电极 {electrode.electrodeNo}
              </h1>
              <Tag variant={statusVariant as any} icon={Activity}>
                {statusInfo?.label || electrode.status}
              </Tag>
            </div>
            <p className="text-sm text-neutral-500 mt-1">
              {electrode.partName} | 对应部位加工电极
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" icon={RefreshCw} onClick={handleRecordUsage}>
            记录使用
          </Button>
          <Button icon={saved ? Check : Save} onClick={handleSaveParams} variant="primary">
            {saved ? '已保存' : '保存参数'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="项目编号" value={electrode.projectNo} icon={Layers} color="primary" />
        <StatCard title="材质规格" value={electrode.material} icon={Sparkles} color="accent" />
        <StatCard title="尺寸" value={electrode.size} icon={Gauge} color="info" />
        <StatCard
          title="EDM工时"
          value={`${electrode.actualHours} / ${electrode.planHours}h`}
          icon={Clock}
          color={electrode.actualHours / electrode.planHours > 0.9 ? 'warning' : 'success'}
        />
        <StatCard title="操作员" value={electrode.operator || '待分配'} icon={User} color="primary" />
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Battery className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-neutral-800">电极寿命</h3>
          </div>
          <div className="text-sm text-neutral-600">
            已使用 <span className="font-bold text-neutral-900">{electrode.usedCount}</span> /{' '}
            {electrode.maxUseCount} 次
          </div>
        </div>
        <div className="mb-3">
          <ProgressBar
            value={electrode.usedCount}
            max={electrode.maxUseCount}
            color={lifeColor}
            showLabel={true}
            labelPosition="inside"
            striped={lifePercent > 85}
          />
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-lg bg-primary-50">
            <p className="text-xs text-neutral-500 mb-1">剩余次数</p>
            <p className={`text-xl font-bold ${lifePercent > 85 ? 'text-danger' : 'text-primary-700'}`}>
              {Math.max(0, electrode.maxUseCount - electrode.usedCount)} 次
            </p>
          </div>
          <div className="p-3 rounded-lg bg-accent-50">
            <p className="text-xs text-neutral-500 mb-1">健康状态</p>
            <p className={`text-xl font-bold ${lifePercent > 85 ? 'text-danger' : lifePercent > 60 ? 'text-warning' : 'text-success'}`}>
              {lifePercent > 85 ? '即将报废' : lifePercent > 60 ? '使用中' : '良好'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-success-light">
            <p className="text-xs text-neutral-500 mb-1">预计剩余</p>
            <p className="text-xl font-bold text-success">
              ~{Math.max(0, Math.round((electrode.maxUseCount - electrode.usedCount) * 1.2))} 件
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent-600" />
              <h3 className="font-semibold text-neutral-800">EDM 加工参数</h3>
            </div>
            <Select
              wrapperClassName="w-40"
              value={electrode.status}
              onChange={(e) => handleChangeStatus(e.target.value as any)}
              options={[
                { value: 'pending', label: '待加工' },
                { value: 'machining', label: '加工中' },
                { value: 'using', label: '使用中' },
                { value: 'worn', label: '已报废' },
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="电压 (V)"
              type="number"
              value={currentParams?.voltage ?? 0}
              onChange={(e) => handleParamChange('voltage', Number(e.target.value))}
              suffixAddon="V"
            />
            <Input
              label="电流 (A)"
              type="number"
              value={currentParams?.current ?? 0}
              onChange={(e) => handleParamChange('current', Number(e.target.value))}
              suffixAddon="A"
            />
            <Input
              label="脉宽 Ton (μs)"
              type="number"
              value={currentParams?.pulseOn ?? 0}
              onChange={(e) => handleParamChange('pulseOn', Number(e.target.value))}
              suffixAddon="μs"
            />
            <Input
              label="脉间 Toff (μs)"
              type="number"
              value={currentParams?.pulseOff ?? 0}
              onChange={(e) => handleParamChange('pulseOff', Number(e.target.value))}
              suffixAddon="μs"
            />
          </div>
          <div className="mt-5 p-4 rounded-lg bg-neutral-50 border border-neutral-200">
            <h4 className="text-sm font-medium text-neutral-700 mb-3">推荐参数参考</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <p className="text-neutral-500">粗加工</p>
                <p className="font-medium text-neutral-800">90V / 25A</p>
              </div>
              <div>
                <p className="text-neutral-500">中加工</p>
                <p className="font-medium text-neutral-800">80V / 15A</p>
              </div>
              <div>
                <p className="text-neutral-500">精加工</p>
                <p className="font-medium text-neutral-800">70V / 8A</p>
              </div>
              <div>
                <p className="text-neutral-500">抛光</p>
                <p className="font-medium text-neutral-800">60V / 3A</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Clock className="w-5 h-5 text-info" />
            <h3 className="font-semibold text-neutral-800">使用历史记录</h3>
          </div>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>日期时间</th>
                  <th>工时</th>
                  <th>操作员</th>
                  <th>所属项目</th>
                </tr>
              </thead>
              <tbody>
                {usageHistory.map((h) => (
                  <tr key={h.id}>
                    <td className="text-sm">{h.date}</td>
                    <td>
                      <Tag variant="primary">{h.hours}h</Tag>
                    </td>
                    <td className="text-sm text-neutral-700">{h.operator}</td>
                    <td className="text-sm text-neutral-700">{h.project}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between p-3 rounded-lg bg-neutral-50 border border-neutral-100">
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Play className="w-4 h-4" />
              <span>总计使用</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-500">4 次</span>
              <span className="text-lg font-bold text-primary-700">9.0 h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectrodeDetail;
