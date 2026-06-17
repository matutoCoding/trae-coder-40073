import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMoldBaseStore } from '../../store/moldbase';
import { useProjectStore } from '../../store/project';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Tag from '../../components/ui/Tag';
import {
  ArrowLeft,
  Box,
  Ruler,
  Layers,
  Scale,
  DollarSign,
  Package,
  Check,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

interface AccessoryItem {
  id: string;
  name: string;
  spec: string;
  price: number;
  category: string;
}

const availableAccessories: AccessoryItem[] = [
  { id: 'acc1', name: '导柱导套组', spec: 'Φ25×150mm 精密级', price: 380, category: '导向系统' },
  { id: 'acc2', name: '导柱导套组', spec: 'Φ32×180mm 精密级', price: 520, category: '导向系统' },
  { id: 'acc3', name: '回针组件', spec: 'Φ20×200mm SUJ2', price: 180, category: '复位系统' },
  { id: 'acc4', name: '弹簧组', spec: '黄色轻载 6件套', price: 120, category: '复位系统' },
  { id: 'acc5', name: '弹簧组', spec: '蓝色中载 6件套', price: 168, category: '复位系统' },
  { id: 'acc6', name: '顶针板导柱', spec: 'Φ16×120mm', price: 96, category: '顶出系统' },
  { id: 'acc7', name: '限位柱组', spec: 'Φ40×50mm 4件', price: 220, category: '支撑系统' },
  { id: 'acc8', name: '垃圾钉组', spec: 'Φ25mm 16件', price: 80, category: '支撑系统' },
  { id: 'acc9', name: '定位圈', spec: 'Φ100×15mm SKD11', price: 145, category: '浇注系统' },
  { id: 'acc10', name: '浇口套', spec: 'A型 Φ12×60mm SKD61', price: 185, category: '浇注系统' },
  { id: 'acc11', name: '锁模块', spec: '标准型 单件', price: 280, category: '锁紧系统' },
  { id: 'acc12', name: '开闭器', spec: '尼龙型 M10 4件', price: 68, category: '锁紧系统' },
];

const MoldBaseDetail = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getMoldBase, moldBases } = useMoldBaseStore();
  const { projects } = useProjectStore();
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [confirmSuccess, setConfirmSuccess] = useState(false);

  const moldBase = useMemo(() => {
    if (!id) return undefined;
    return getMoldBase(id);
  }, [id, getMoldBase, moldBases]);

  const accessoryCategories = useMemo(() => {
    const cats: Record<string, AccessoryItem[]> = {};
    availableAccessories.forEach((acc) => {
      if (!cats[acc.category]) cats[acc.category] = [];
      cats[acc.category].push(acc);
    });
    return cats;
  }, []);

  const accessoriesTotal = useMemo(() => {
    return availableAccessories
      .filter((a) => selectedAccessories.includes(a.id))
      .reduce((sum, a) => sum + a.price, 0);
  }, [selectedAccessories]);

  const totalPrice = useMemo(() => {
    return (moldBase?.price || 0) + accessoriesTotal;
  }, [moldBase, accessoriesTotal]);

  const toggleAccessory = (accId: string) => {
    setSelectedAccessories((prev) =>
      prev.includes(accId) ? prev.filter((id) => id !== accId) : [...prev, accId]
    );
  };

  const handleConfirmSelection = () => {
    if (selectedProject) {
      setConfirmSuccess(true);
      setTimeout(() => {
        setConfirmSuccess(false);
        setModalOpen(false);
        setSelectedProject('');
      }, 1800);
    }
  };

  const handleBack = () => {
    navigate('/moldbase');
  };

  if (!moldBase) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <AlertCircle className="w-16 h-16 text-neutral-300 mb-4" />
        <p className="text-neutral-500 mb-4">模架不存在或已被删除</p>
        <Button onClick={handleBack} icon={ArrowLeft}>返回列表</Button>
      </div>
    );
  }

  const specRows = [
    { label: 'A板厚度', key: 'A板', value: `${moldBase.plateThickness.a} mm` },
    { label: 'B板厚度', key: 'B板', value: `${moldBase.plateThickness.b} mm` },
    { label: 'C板厚度', key: 'C板', value: `${moldBase.plateThickness.c} mm` },
    { label: 'D板厚度', key: 'D板', value: `${moldBase.plateThickness.d} mm` },
    { label: 'E板厚度', key: 'E板', value: `${moldBase.plateThickness.e} mm` },
    { label: '模板长度', key: 'L', value: `${moldBase.length} mm` },
    { label: '模板宽度', key: 'W', value: `${moldBase.width} mm` },
    { label: '导柱规格', key: 'GP', value: moldBase.guidePillar },
    { label: '顶出方式', key: 'EJ', value: moldBase.ejectorType },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={handleBack}
          className="w-10 h-10 rounded-lg border border-neutral-200 bg-white flex items-center justify-center text-neutral-600 hover:bg-neutral-50 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-neutral-900">{moldBase.code}</h1>
            <Tag variant="primary">{moldBase.type}</Tag>
            <Tag variant="accent">{moldBase.series}</Tag>
          </div>
          <p className="text-sm text-neutral-500 mt-1">模架详情与选型配置</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <div className="aspect-[16/8] bg-gradient-to-br from-neutral-100 to-neutral-50 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <Box className="w-32 h-32 text-neutral-300" strokeWidth={1} />
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div>
                  <div className="text-xs text-neutral-500 mb-1">规格型号</div>
                  <div className="text-xl font-bold text-neutral-800">{moldBase.code}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs text-neutral-500 mb-0.5">尺寸</div>
                    <div className="text-sm font-semibold text-neutral-700">
                      {moldBase.length} × {moldBase.width} mm
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-neutral-500 mb-0.5">重量</div>
                    <div className="text-sm font-semibold text-neutral-700">{moldBase.weight} kg</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Ruler className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-neutral-900">规格参数表</h2>
            </div>
            <div className="overflow-hidden rounded-lg border border-neutral-200">
              <table className="table w-full">
                <thead>
                  <tr className="bg-neutral-50">
                    <th className="text-left w-32">参数名称</th>
                    <th className="text-left w-24">代号</th>
                    <th className="text-left">参数值</th>
                  </tr>
                </thead>
                <tbody>
                  {specRows.map((row) => (
                    <tr key={row.key}>
                      <td className="text-neutral-700">{row.label}</td>
                      <td>
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 text-xs font-mono">
                          {row.key}
                        </span>
                      </td>
                      <td className="font-medium text-neutral-900">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-neutral-900">配件选择</h2>
              </div>
              <div className="text-sm text-neutral-500">
                已选 <span className="font-semibold text-primary-600">{selectedAccessories.length}</span> 项
              </div>
            </div>
            <div className="space-y-6">
              {Object.entries(accessoryCategories).map(([category, items]) => (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 rounded-full bg-primary-500" />
                    <h3 className="text-sm font-semibold text-neutral-800">{category}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {items.map((acc) => {
                      const isSelected = selectedAccessories.includes(acc.id);
                      return (
                        <div
                          key={acc.id}
                          onClick={() => toggleAccessory(acc.id)}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-primary-500 bg-primary-50/50'
                              : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50/50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                {isSelected && (
                                  <CheckCircle2 className="w-4 h-4 text-primary-600 flex-shrink-0" />
                                )}
                                <span
                                  className={`text-sm font-medium ${
                                    isSelected ? 'text-primary-700' : 'text-neutral-800'
                                  }`}
                                >
                                  {acc.name}
                                </span>
                              </div>
                              <p className="text-xs text-neutral-500 mt-1 ml-0">{acc.spec}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-sm font-bold text-success">
                                +{formatCurrency(acc.price)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-6 sticky top-6">
            <div className="flex items-center gap-2 mb-5">
              <DollarSign className="w-5 h-5 text-success" />
              <h2 className="text-lg font-semibold text-neutral-900">价格计算</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-neutral-400" />
                  <span className="text-sm text-neutral-600">模架本体</span>
                </div>
                <span className="text-sm font-semibold text-neutral-800">
                  {formatCurrency(moldBase.price)}
                </span>
              </div>
              <div className="flex items-start justify-between pb-3 border-b border-neutral-100">
                <div>
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-neutral-400" />
                    <span className="text-sm text-neutral-600">选配配件</span>
                    <Tag variant="accent" className="text-xs">
                      {selectedAccessories.length}项
                    </Tag>
                  </div>
                  {selectedAccessories.length > 0 && (
                    <div className="mt-2 space-y-1 pl-6">
                      {availableAccessories
                        .filter((a) => selectedAccessories.includes(a.id))
                        .map((a) => (
                          <div
                            key={a.id}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="text-neutral-500 truncate max-w-[140px]">
                              {a.name}
                            </span>
                            <span className="text-neutral-700 font-medium">
                              {formatCurrency(a.price)}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
                <span className="text-sm font-semibold text-neutral-800">
                  {formatCurrency(accessoriesTotal)}
                </span>
              </div>
              <div className="pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">总价</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-success tabular-nums">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-end gap-1 text-xs text-neutral-400">
                  <Scale className="w-3 h-3" />
                  <span>总重量约 {(moldBase.weight * 1.08).toFixed(1)} kg (含配件估算)</span>
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                icon={Check}
                onClick={() => setModalOpen(true)}
              >
                确认选型并关联到项目
              </Button>
              <Button
                variant="outline"
                size="md"
                className="w-full"
                onClick={() => setSelectedAccessories([])}
              >
                清空选配
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => !confirmSuccess && setModalOpen(false)}
        title={confirmSuccess ? '选型成功' : '确认选型并关联项目'}
        width="max-w-md"
        closable={!confirmSuccess}
        maskClosable={!confirmSuccess}
        footer={
          !confirmSuccess ? (
            <div className="flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                取消
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmSelection}
                disabled={!selectedProject}
                icon={Check}
              >
                确认关联
              </Button>
            </div>
          ) : null
        }
      >
        {confirmSuccess ? (
          <div className="py-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-1">选型成功</h3>
            <p className="text-sm text-neutral-500">
              模架 {moldBase.code} 已成功关联到项目
            </p>
          </div>
        ) : (
          <div className="space-y-5 py-2">
            <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-neutral-500">选型模架</span>
                <Tag variant="primary">{moldBase.code}</Tag>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-500">预计总价</span>
                <span className="text-sm font-bold text-success">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
            </div>
            <Select
              label="选择关联项目"
              required
              placeholder="请选择项目..."
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              options={projects.map((p) => ({
                value: p.id,
                label: `${p.projectNo} - ${p.moldName}`,
              }))}
            />
            <div className="p-3 rounded-md bg-primary-50 border border-primary-100 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-primary-700">
                确认后将更新项目的模架选型记录，关联后可在项目详情中查看完整配置信息。
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MoldBaseDetail;
