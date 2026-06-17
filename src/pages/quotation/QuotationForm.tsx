import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  ChevronLeft,
  Save,
  Send,
  User,
  Phone,
  MapPin,
  Boxes,
  Layers,
  Ruler,
  Cpu,
  FlaskConical,
  Wrench,
  Sparkles,
  DollarSign,
  Percent,
  Truck,
  StickyNote,
  Calculator,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import {
  useQuotationStore,
  seedCustomers,
} from '@/store';
import { formatCurrency, formatPercent } from '@/utils/currency';
import dayjs from 'dayjs';

const moldTypeOptions = [
  { value: '普通注塑模', label: '普通注塑模' },
  { value: '热流道注塑模', label: '热流道注塑模' },
  { value: '多腔精密注塑模', label: '多腔精密注塑模' },
  { value: '双色注塑模', label: '双色注塑模' },
  { value: '气辅注塑模', label: '气辅注塑模' },
  { value: '高速精密注塑模', label: '高速精密注塑模' },
  { value: '精密注塑模', label: '精密注塑模' },
];

const materialOptions = [
  { value: 'PP', label: 'PP' },
  { value: 'PP+T20', label: 'PP+T20 (20%滑石粉)' },
  { value: 'PP+EPDM', label: 'PP+EPDM (增韧)' },
  { value: 'ABS', label: 'ABS' },
  { value: 'ABS+PC', label: 'ABS+PC (合金)' },
  { value: 'PA66', label: 'PA66 (尼龙)' },
  { value: 'PA66+GF30', label: 'PA66+GF30 (30%玻纤)' },
  { value: 'PA66+GF25', label: 'PA66+GF25 (25%玻纤)' },
  { value: 'PC', label: 'PC (聚碳酸酯)' },
  { value: 'POM', label: 'POM (赛钢)' },
  { value: 'PMMA', label: 'PMMA (亚克力)' },
  { value: 'PBT+GF30', label: 'PBT+GF30' },
];

interface FormData {
  customerId: string;
  customerName: string;
  moldName: string;
  moldType: string;
  cavityQty: number;
  productMaterial: string;
  estimatedTonnage: number;
  estimatedCycles: number;
  materialCost: number;
  machiningCost: number;
  electrodeCost: number;
  assemblyCost: number;
  tryMoldCost: number;
  otherCost: number;
  profitMargin: number;
  deliveryDays: number;
  remark: string;
}

const defaultFormData: FormData = {
  customerId: '',
  customerName: '',
  moldName: '',
  moldType: '普通注塑模',
  cavityQty: 1,
  productMaterial: 'PP',
  estimatedTonnage: 200,
  estimatedCycles: 300000,
  materialCost: 0,
  machiningCost: 0,
  electrodeCost: 0,
  assemblyCost: 0,
  tryMoldCost: 0,
  otherCost: 0,
  profitMargin: 0.25,
  deliveryDays: 45,
  remark: '',
};

const QuotationForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const getQuotation = useQuotationStore((s) => s.getQuotation);
  const addQuotation = useQuotationStore((s) => s.addQuotation);
  const updateQuotation = useQuotationStore((s) => s.updateQuotation);

  const quotation = id ? getQuotation(id) : undefined;

  const [form, setForm] = useState<FormData>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && quotation) {
      setForm({
        customerId: quotation.customerId,
        customerName: quotation.customerName,
        moldName: quotation.moldName,
        moldType: quotation.moldType,
        cavityQty: quotation.cavityQty,
        productMaterial: quotation.productMaterial,
        estimatedTonnage: quotation.estimatedTonnage,
        estimatedCycles: quotation.estimatedCycles,
        materialCost: quotation.materialCost,
        machiningCost: quotation.machiningCost,
        electrodeCost: quotation.electrodeCost,
        assemblyCost: quotation.assemblyCost,
        tryMoldCost: quotation.tryMoldCost,
        otherCost: quotation.otherCost,
        profitMargin: quotation.profitMargin,
        deliveryDays: quotation.deliveryDays,
        remark: quotation.remark || '',
      });
    }
  }, [isEdit, quotation]);

  const computed = useMemo(() => {
    const totalCost =
      form.materialCost +
      form.machiningCost +
      form.electrodeCost +
      form.assemblyCost +
      form.tryMoldCost +
      form.otherCost;
    const profitAmount = Math.round(totalCost * form.profitMargin);
    const quotationPrice = totalCost + profitAmount;
    return { totalCost, profitAmount, quotationPrice };
  }, [form]);

  const costItems = [
    { key: 'materialCost', label: '材料成本', icon: Boxes, color: 'bg-blue-100 text-blue-600' },
    { key: 'machiningCost', label: '加工成本', icon: Cpu, color: 'bg-orange-100 text-orange-600' },
    { key: 'electrodeCost', label: '电极成本', icon: Sparkles, color: 'bg-purple-100 text-purple-600' },
    { key: 'assemblyCost', label: '装配成本', icon: Layers, color: 'bg-cyan-100 text-cyan-600' },
    { key: 'tryMoldCost', label: '试模成本', icon: FlaskConical, color: 'bg-teal-100 text-teal-600' },
    { key: 'otherCost', label: '其他成本', icon: Wrench, color: 'bg-gray-100 text-gray-600' },
  ] as const;

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as string]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key as string];
        return next;
      });
    }
  };

  const handleCustomerChange = (value: string) => {
    const customer = seedCustomers.find((c) => c.id === value);
    if (customer) {
      updateField('customerId', customer.id);
      updateField('customerName', customer.name);
    } else {
      updateField('customerId', '');
      updateField('customerName', '');
    }
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.customerId) next.customerId = '请选择客户';
    if (!form.moldName.trim()) next.moldName = '请输入模具名称';
    if (form.cavityQty < 1) next.cavityQty = '模腔数至少为1';
    if (form.estimatedTonnage < 1) next.estimatedTonnage = '请输入吨位';
    if (form.estimatedCycles < 1) next.estimatedCycles = '请输入预估寿命';
    if (form.deliveryDays < 1) next.deliveryDays = '请输入交期';
    if (form.profitMargin < 0 || form.profitMargin > 1) next.profitMargin = '利润率需在0~1之间';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const generateQuotationNo = (): string => {
    const now = dayjs();
    const datePart = now.format('YYYYMMDD');
    const seq = String(Math.floor(Math.random() * 900) + 100);
    return `Q${datePart}${seq}`;
  };

  const handleSave = (submitForApproval: boolean) => {
    if (submitForApproval && !validate()) return;
    if (!submitForApproval && !form.customerId && !form.moldName.trim()) {
      alert('请至少填写客户和模具名称后再保存');
      return;
    }

    const payload = {
      quotationNo: isEdit ? (quotation?.quotationNo || generateQuotationNo()) : generateQuotationNo(),
      customerId: form.customerId,
      customerName: form.customerName,
      moldName: form.moldName,
      moldType: form.moldType,
      cavityQty: form.cavityQty,
      productMaterial: form.productMaterial,
      estimatedTonnage: form.estimatedTonnage,
      estimatedCycles: form.estimatedCycles,
      materialCost: form.materialCost,
      machiningCost: form.machiningCost,
      electrodeCost: form.electrodeCost,
      assemblyCost: form.assemblyCost,
      tryMoldCost: form.tryMoldCost,
      otherCost: form.otherCost,
      profitMargin: form.profitMargin,
      deliveryDays: form.deliveryDays,
      status: submitForApproval ? 'pending' : 'draft',
      remark: form.remark,
    } as const;

    if (isEdit && quotation) {
      updateQuotation(quotation.id, { ...payload, status: submitForApproval ? 'pending' : quotation.status === 'draft' ? 'draft' : quotation.status });
      alert(isEdit ? '报价单已更新' : '报价单已提交审批');
    } else {
      addQuotation(payload as any);
      alert(submitForApproval ? '报价单已提交审批' : '草稿已保存');
    }

    navigate('/quotation');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-neutral-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">
              {isEdit ? '编辑报价单' : '新建报价单'}
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              {quotation ? `编号：${quotation.quotationNo}` : '创建新的模具报价单'}
            </p>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-5 pb-4 border-b border-neutral-100">
          <User className="w-5 h-5 text-primary-600" />
          <h2 className="font-semibold text-neutral-800">客户信息 & 模具规格</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select
            label="客户"
            required
            value={form.customerId}
            onChange={(e) => handleCustomerChange(e.target.value)}
            options={seedCustomers.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="请选择客户"
            wrapperClassName="md:col-span-2"
            error={errors.customerId}
          />
          <Input
            label="模具名称"
            required
            value={form.moldName}
            onChange={(e) => updateField('moldName', e.target.value)}
            placeholder="如：汽车仪表板上壳体模具"
            error={errors.moldName}
          />
          <Select
            label="模具类型"
            value={form.moldType}
            onChange={(e) => updateField('moldType', e.target.value)}
            options={moldTypeOptions}
          />
          <Input
            label="模腔数"
            required
            type="number"
            min={1}
            value={form.cavityQty}
            onChange={(e) => updateField('cavityQty', parseInt(e.target.value) || 1)}
            leftIcon={Layers}
            suffixAddon="腔"
            error={errors.cavityQty}
          />
          <Select
            label="产品材料"
            value={form.productMaterial}
            onChange={(e) => updateField('productMaterial', e.target.value)}
            options={materialOptions}
          />
          <Input
            label="预估吨位"
            required
            type="number"
            min={1}
            value={form.estimatedTonnage}
            onChange={(e) => updateField('estimatedTonnage', parseInt(e.target.value) || 0)}
            leftIcon={Ruler}
            suffixAddon="T"
            error={errors.estimatedTonnage}
          />
          <Input
            label="预估寿命"
            required
            type="number"
            min={1}
            value={form.estimatedCycles}
            onChange={(e) => updateField('estimatedCycles', parseInt(e.target.value) || 0)}
            suffixAddon="次"
            error={errors.estimatedCycles}
          />
          <Input
            label="交期"
            required
            type="number"
            min={1}
            value={form.deliveryDays}
            onChange={(e) => updateField('deliveryDays', parseInt(e.target.value) || 0)}
            leftIcon={Truck}
            suffixAddon="天"
            error={errors.deliveryDays}
          />
        </div>

        {form.customerId && (
          <div className="mt-5 p-4 bg-primary-50/60 rounded-xl border border-primary-100/60">
            <div className="text-xs font-medium text-primary-700 mb-2">客户信息</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {(() => {
                const cust = seedCustomers.find((c) => c.id === form.customerId);
                if (!cust) return null;
                return (
                  <>
                    <div className="flex items-center gap-2 text-neutral-600">
                      <User className="w-4 h-4 text-primary-500" />
                      <span>联系人：</span>
                      <span className="font-medium text-neutral-800">{cust.contact}</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600">
                      <Phone className="w-4 h-4 text-primary-500" />
                      <span>电话：</span>
                      <span className="font-medium text-neutral-800">{cust.phone}</span>
                    </div>
                    <div className="flex items-start gap-2 text-neutral-600 md:col-span-3">
                      <MapPin className="w-4 h-4 text-primary-500 mt-0.5" />
                      <span>地址：</span>
                      <span className="font-medium text-neutral-800">{cust.address}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-accent-500" />
            <h2 className="font-semibold text-neutral-800">成本明细</h2>
          </div>
          <div className="text-sm text-neutral-500">
            总成本：
            <span className="text-lg font-bold text-neutral-800 ml-1">
              {formatCurrency(computed.totalCost)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {costItems.map((item) => {
            const Icon = item.icon;
            const val = form[item.key];
            const pct = computed.totalCost > 0 ? (val / computed.totalCost) * 100 : 0;
            return (
              <div key={item.key} className="border border-neutral-200 rounded-xl p-4 hover:border-primary-200 hover:bg-primary-50/30 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${item.color}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-700">{item.label}</p>
                    <p className="text-xs text-neutral-400">占比 {pct.toFixed(1)}%</p>
                  </div>
                </div>
                <Input
                  type="number"
                  min={0}
                  step={100}
                  value={val}
                  onChange={(e) => updateField(item.key, parseFloat(e.target.value) || 0)}
                  leftIcon={DollarSign}
                  size="lg"
                />
                <div className="mt-2 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${pct}%` }}
                    className={`h-full transition-all duration-300 ${item.color.replace('text-', 'bg-').split(' ')[1] || 'bg-primary-500'}`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
            <p className="text-xs text-neutral-500 mb-1">材料成本</p>
            <p className="text-lg font-semibold text-blue-600">{formatCurrency(form.materialCost, '¥', 0)}</p>
          </div>
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
            <p className="text-xs text-neutral-500 mb-1">加工类合计</p>
            <p className="text-lg font-semibold text-orange-600">
              {formatCurrency(form.machiningCost + form.electrodeCost, '¥', 0)}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
            <p className="text-xs text-neutral-500 mb-1">装配/试模/其他</p>
            <p className="text-lg font-semibold text-teal-600">
              {formatCurrency(form.assemblyCost + form.tryMoldCost + form.otherCost, '¥', 0)}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-primary-50 border border-primary-200">
            <p className="text-xs text-primary-600 mb-1 font-medium">总成本</p>
            <p className="text-xl font-bold text-primary-700">{formatCurrency(computed.totalCost, '¥', 0)}</p>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-5 pb-4 border-b border-neutral-100">
          <DollarSign className="w-5 h-5 text-success" />
          <h2 className="font-semibold text-neutral-800">报价信息</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-1">
            <div className="p-4 rounded-xl bg-gradient-to-br from-success-light/40 to-white border border-success/20">
              <div className="flex items-center gap-2 mb-4">
                <Percent className="w-5 h-5 text-success" />
                <p className="font-medium text-neutral-700">利润率设置</p>
              </div>
              <div className="space-y-3">
                <Input
                  label="利润率"
                  type="number"
                  min={0}
                  max={1}
                  step={0.01}
                  value={form.profitMargin}
                  onChange={(e) => updateField('profitMargin', parseFloat(e.target.value) || 0)}
                  error={errors.profitMargin}
                />
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '20%', val: 0.2 },
                    { label: '25%', val: 0.25 },
                    { label: '30%', val: 0.3 },
                    { label: '35%', val: 0.35 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => updateField('profitMargin', preset.val)}
                      className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                        Math.abs(form.profitMargin - preset.val) < 0.001
                          ? 'bg-success text-white border-success'
                          : 'bg-white text-neutral-600 border-neutral-200 hover:border-success hover:text-success'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="grid grid-cols-3 gap-4 h-full">
              <div className="p-5 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col justify-center items-center">
                <p className="text-xs text-neutral-500 mb-2">总成本</p>
                <p className="text-2xl font-bold text-neutral-700">{formatCurrency(computed.totalCost, '¥', 0)}</p>
              </div>
              <div className="p-5 rounded-xl bg-accent-50 border border-accent-200 flex flex-col justify-center items-center">
                <p className="text-xs text-accent-600 mb-2 font-medium">利润 {formatPercent(form.profitMargin, 0)}</p>
                <p className="text-2xl font-bold text-accent-600">{formatCurrency(computed.profitAmount, '¥', 0)}</p>
              </div>
              <div className="p-5 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex flex-col justify-center items-center shadow-lg shadow-primary-500/20">
                <p className="text-xs text-white/80 mb-2 font-medium">报价金额</p>
                <p className="text-3xl font-bold tracking-tight">{formatCurrency(computed.quotationPrice, '¥', 0)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <StickyNote className="w-5 h-5 text-warning" />
          <h2 className="font-semibold text-neutral-800">备注说明</h2>
        </div>
        <Textarea
          value={form.remark}
          onChange={(e) => updateField('remark', e.target.value)}
          placeholder="请输入报价单备注信息，如特殊要求、附加条款、付款方式等..."
          rows={4}
        />
      </div>

      <div className="sticky bottom-0 -mx-6 -mb-6 px-6 py-4 bg-gradient-to-t from-primary-50/80 via-primary-50/60 to-transparent border-t border-neutral-200/60 backdrop-blur-sm z-10">
        <div className="flex items-center justify-between gap-4 max-w-[1600px] mx-auto">
          <div className="hidden md:flex items-center gap-6 text-sm">
            <div>
              <span className="text-neutral-500">总成本：</span>
              <span className="font-semibold text-neutral-700">{formatCurrency(computed.totalCost, '¥', 0)}</span>
            </div>
            <div>
              <span className="text-neutral-500">利润 ({formatPercent(form.profitMargin, 0)})：</span>
              <span className="font-semibold text-accent-600">{formatCurrency(computed.profitAmount, '¥', 0)}</span>
            </div>
            <div className="px-4 py-2 rounded-lg bg-primary-600 text-white">
              <span className="text-white/80 text-xs">报价</span>
              <span className="ml-2 font-bold text-lg">{formatCurrency(computed.quotationPrice, '¥', 0)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              取消
            </Button>
            <Button variant="outline" icon={Save} onClick={() => handleSave(false)}>
              保存草稿
            </Button>
            <Button variant="primary" icon={Send} onClick={() => handleSave(true)}>
              提交审批
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationForm;
