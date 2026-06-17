import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Check,
  X,
  Rocket,
  Info,
  Calculator,
  ClipboardCheck,
  Link as LinkIcon,
  User,
  Phone,
  MapPin,
  Layers,
  Ruler,
  Truck,
  Calendar,
  Boxes,
  Cpu,
  Sparkles,
  FlaskConical,
  Wrench,
  DollarSign,
  Home,
  Box,
  AlertTriangle,
} from 'lucide-react';
import Stepper from '@/components/ui/Stepper';
import Tabs from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';
import Tag from '@/components/ui/Tag';
import {
  useQuotationStore,
  useProjectStore,
  seedCustomers,
} from '@/store';
import { formatCurrency, formatPercent, formatNumber } from '@/utils/currency';
import { quotationStatusMap, projectStatusMap } from '@/utils/status';
import dayjs from 'dayjs';

const tagVariantMap: Record<string, 'gray' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'accent'> = {
  draft: 'gray',
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  expired: 'gray',
};

const QuotationDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const getQuotation = useQuotationStore((s) => s.getQuotation);
  const approveQuotation = useQuotationStore((s) => s.approveQuotation);
  const rejectQuotation = useQuotationStore((s) => s.rejectQuotation);
  const submitQuotation = useQuotationStore((s) => s.submitQuotation);
  const projects = useProjectStore((s) => s.projects);
  const createFromQuotation = useProjectStore((s) => s.createFromQuotation);

  const quotation = id ? getQuotation(id) : undefined;
  const [activeTab, setActiveTab] = useState('basic');

  const currentStep = useMemo(() => {
    if (!quotation) return 0;
    switch (quotation.status) {
      case 'draft': return 0;
      case 'pending': return 1;
      case 'approved': return 2;
      case 'rejected': return 2;
      case 'expired': return 2;
      default: return 0;
    }
  }, [quotation]);

  const steps = [
    { key: 'draft', title: '草稿', description: quotation?.status !== 'draft' ? quotation?.createdAt : '创建中' },
    { key: 'pending', title: '待审批', description: quotation?.status === 'pending' ? '审批中...' : quotation?.status === 'approved' || quotation?.status === 'rejected' ? '已处理' : '未提交' },
    { key: 'result', title: quotation?.status === 'rejected' ? '已拒绝' : quotation?.status === 'expired' ? '已过期' : '已通过', description: quotation?.approvedAt ? dayjs(quotation.approvedAt).format('YYYY-MM-DD') : quotation?.remark ? quotation?.remark : '' },
  ];

  const relatedProjects = useMemo(() => {
    if (!quotation) return [];
    return projects.filter((p) => p.quotationId === quotation.id);
  }, [projects, quotation]);

  if (!quotation) {
    return (
      <div className="space-y-5">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-neutral-500 hover:text-primary-600 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>返回</span>
        </button>
        <div className="card p-10 text-center">
          <AlertTriangle className="w-16 h-16 text-warning mx-auto mb-4" />
          <h2 className="text-xl font-bold text-neutral-800 mb-2">报价单不存在</h2>
          <p className="text-neutral-500 mb-6">该报价单可能已被删除或编号不存在</p>
          <Button onClick={() => navigate('/quotation')}>返回报价列表</Button>
        </div>
      </div>
    );
  }

  const costItems = [
    { key: 'materialCost', label: '材料成本', value: quotation.materialCost, icon: Boxes, color: 'bg-blue-100 text-blue-600' },
    { key: 'machiningCost', label: '加工成本', value: quotation.machiningCost, icon: Cpu, color: 'bg-orange-100 text-orange-600' },
    { key: 'electrodeCost', label: '电极成本', value: quotation.electrodeCost, icon: Sparkles, color: 'bg-purple-100 text-purple-600' },
    { key: 'assemblyCost', label: '装配成本', value: quotation.assemblyCost, icon: Layers, color: 'bg-cyan-100 text-cyan-600' },
    { key: 'tryMoldCost', label: '试模成本', value: quotation.tryMoldCost, icon: FlaskConical, color: 'bg-teal-100 text-teal-600' },
    { key: 'otherCost', label: '其他成本', value: quotation.otherCost, icon: Wrench, color: 'bg-gray-100 text-gray-600' },
  ];

  const customer = seedCustomers.find((c) => c.id === quotation.customerId);

  const handleApprove = () => {
    if (window.confirm('确认通过此报价单审批？通过后将可以创建项目。')) {
      approveQuotation(quotation.id);
      alert('审批通过成功');
    }
  };

  const handleReject = () => {
    const remark = window.prompt('请输入拒绝原因：');
    if (remark !== null) {
      rejectQuotation(quotation.id, remark || '未填写原因');
      alert('已拒绝');
    }
  };

  const handleSubmit = () => {
    if (window.confirm('确认提交此报价单进入审批流程？')) {
      submitQuotation(quotation.id);
      alert('已提交审批');
    }
  };

  const handleGenerateProject = () => {
    if (window.confirm('确认根据此报价单创建模具项目？')) {
      createFromQuotation(quotation);
      alert('项目已创建，跳转到项目列表...');
      navigate('/moldbase');
    }
  };

  const tabs = [
    { key: 'basic', label: '基本信息', icon: Info },
    { key: 'cost', label: '成本明细', icon: Calculator },
    { key: 'approval', label: '审批记录', icon: ClipboardCheck },
    { key: 'project', label: '关联项目', icon: LinkIcon, disabled: relatedProjects.length === 0 },
  ];

  return (
    <div className="space-y-5">
      <nav className="flex items-center gap-2 text-sm text-neutral-500">
        <button onClick={() => navigate('/')} className="flex items-center gap-1 hover:text-primary-600 transition-colors">
          <Home className="w-3.5 h-3.5" />
          <span>工作台</span>
        </button>
        <ChevronRight className="w-3 h-3" />
        <button onClick={() => navigate('/quotation')} className="hover:text-primary-600 transition-colors">
          报价单管理
        </button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-neutral-800 font-medium">{quotation.quotationNo}</span>
      </nav>

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
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-neutral-900">{quotation.quotationNo}</h1>
              <Tag variant={tagVariantMap[quotation.status] || 'gray'}>
                {quotationStatusMap[quotation.status]?.label || quotation.status}
              </Tag>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              {quotation.customerName} · {quotation.moldName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(quotation.status === 'draft') && (
            <>
              <Button variant="outline" icon={Edit2} onClick={() => navigate(`/quotation/${quotation.id}/edit`)}>
                编辑
              </Button>
              <Button variant="primary" icon={Rocket} onClick={handleSubmit}>
                提交审批
              </Button>
            </>
          )}
          {(quotation.status === 'pending') && (
            <>
              <Button variant="outline" icon={Edit2} onClick={() => navigate(`/quotation/${quotation.id}/edit`)}>
                编辑
              </Button>
              <Button variant="danger" icon={X} onClick={handleReject}>
                拒绝
              </Button>
              <Button variant="success" icon={Check} onClick={handleApprove}>
                审批通过
              </Button>
            </>
          )}
          {(quotation.status === 'approved') && (
            <>
              <Button variant="outline" icon={Edit2} onClick={() => navigate(`/quotation/${quotation.id}/edit`)}>
                编辑
              </Button>
              {relatedProjects.length === 0 ? (
                <Button variant="primary" icon={Rocket} onClick={handleGenerateProject}>
                  生成项目
                </Button>
              ) : (
                <Button variant="primary" icon={Box} onClick={() => navigate('/moldbase')}>
                  查看项目
                </Button>
              )}
            </>
          )}
          {(quotation.status === 'rejected' || quotation.status === 'expired') && (
            <Button variant="outline" icon={Edit2} onClick={() => navigate(`/quotation/${quotation.id}/edit`)}>
              修改后重新提交
            </Button>
          )}
        </div>
      </div>

      <div className="card p-6">
        <Stepper steps={steps} currentStep={currentStep} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <div className="card p-0 overflow-hidden">
            <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="px-5 pt-4" />

            <div className="p-5 pt-6">
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  <section>
                    <h3 className="text-sm font-semibold text-neutral-800 mb-4 flex items-center gap-2">
                      <User className="w-4 h-4 text-primary-600" />
                      客户信息
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-neutral-50">
                        <p className="text-xs text-neutral-500 mb-1">客户名称</p>
                        <p className="font-medium text-neutral-800">{quotation.customerName}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-neutral-50">
                        <p className="text-xs text-neutral-500 mb-1">联系人 / 电话</p>
                        <p className="font-medium text-neutral-800">
                          {customer ? `${customer.contact} · ${customer.phone}` : '-'}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-neutral-50 md:col-span-2">
                        <p className="text-xs text-neutral-500 mb-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> 地址
                        </p>
                        <p className="font-medium text-neutral-800">{customer?.address || '-'}</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-semibold text-neutral-800 mb-4 flex items-center gap-2">
                      <Box className="w-4 h-4 text-accent-500" />
                      模具规格
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 rounded-xl bg-gradient-to-br from-primary-50 to-white border border-primary-100/60">
                        <p className="text-xs text-neutral-500 mb-1">模具名称</p>
                        <p className="font-semibold text-neutral-800">{quotation.moldName}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-neutral-50">
                        <p className="text-xs text-neutral-500 mb-1">模具类型</p>
                        <p className="font-medium text-neutral-800">{quotation.moldType}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-neutral-50">
                        <p className="text-xs text-neutral-500 mb-1 flex items-center gap-1">
                          <Layers className="w-3 h-3" /> 模腔数
                        </p>
                        <p className="font-medium text-neutral-800">{quotation.cavityQty} 腔</p>
                      </div>
                      <div className="p-4 rounded-xl bg-neutral-50">
                        <p className="text-xs text-neutral-500 mb-1">产品材料</p>
                        <p className="font-medium text-neutral-800">{quotation.productMaterial}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-neutral-50">
                        <p className="text-xs text-neutral-500 mb-1 flex items-center gap-1">
                          <Ruler className="w-3 h-3" /> 预估吨位
                        </p>
                        <p className="font-medium text-neutral-800">{quotation.estimatedTonnage} T</p>
                      </div>
                      <div className="p-4 rounded-xl bg-neutral-50">
                        <p className="text-xs text-neutral-500 mb-1">预估寿命</p>
                        <p className="font-medium text-neutral-800">{formatNumber(quotation.estimatedCycles, 0)} 次</p>
                      </div>
                      <div className="p-4 rounded-xl bg-neutral-50">
                        <p className="text-xs text-neutral-500 mb-1 flex items-center gap-1">
                          <Truck className="w-3 h-3" /> 交期
                        </p>
                        <p className="font-medium text-neutral-800">{quotation.deliveryDays} 天</p>
                      </div>
                      <div className="p-4 rounded-xl bg-neutral-50">
                        <p className="text-xs text-neutral-500 mb-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> 创建日期
                        </p>
                        <p className="font-medium text-neutral-800">{dayjs(quotation.createdAt).format('YYYY-MM-DD')}</p>
                      </div>
                    </div>
                  </section>

                  {quotation.remark && (
                    <section>
                      <h3 className="text-sm font-semibold text-neutral-800 mb-3">备注说明</h3>
                      <div className="p-4 rounded-xl bg-warning-light/30 border border-warning/20">
                        <p className="text-sm text-neutral-700 whitespace-pre-wrap">{quotation.remark}</p>
                      </div>
                    </section>
                  )}
                </div>
              )}

              {activeTab === 'cost' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {costItems.map((item) => {
                      const Icon = item.icon;
                      const pct = quotation.totalCost > 0 ? (item.value / quotation.totalCost) * 100 : 0;
                      return (
                        <div key={item.key} className="border border-neutral-200 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${item.color}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <p className="text-sm font-medium text-neutral-700">{item.label}</p>
                            </div>
                            <span className="text-xs text-neutral-400">{pct.toFixed(1)}%</span>
                          </div>
                          <p className="text-xl font-bold text-neutral-800">{formatCurrency(item.value, '¥', 0)}</p>
                          <div className="mt-3 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${pct}%` }}
                              className={`h-full transition-all ${item.color.replace('text-', 'bg-').split(' ')[1] || 'bg-primary-500'}`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-5 rounded-xl bg-gradient-to-br from-neutral-50 to-white border border-neutral-200">
                      <p className="text-xs text-neutral-500 mb-1">总成本</p>
                      <p className="text-2xl font-bold text-neutral-700">{formatCurrency(quotation.totalCost, '¥', 0)}</p>
                    </div>
                    <div className="p-5 rounded-xl bg-gradient-to-br from-accent-50 to-white border border-accent-200">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-neutral-500">利润金额</p>
                        <span className="text-xs font-medium text-accent-600">{formatPercent(quotation.profitMargin, 0)}</span>
                      </div>
                      <p className="text-2xl font-bold text-accent-600">{formatCurrency(quotation.profitAmount, '¥', 0)}</p>
                    </div>
                    <div className="p-5 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-500/20 md:col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-white/80">最终报价</p>
                        <DollarSign className="w-5 h-5 text-white/70" />
                      </div>
                      <p className="text-3xl font-bold tracking-tight">{formatCurrency(quotation.quotationPrice, '¥', 0)}</p>
                      <p className="text-xs text-white/70 mt-2">
                        利润率 {formatPercent(quotation.profitMargin, 0)} · 共 {quotation.cavityQty} 腔
                      </p>
                    </div>
                  </div>

                  <div className="border border-neutral-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-neutral-50 border-b border-neutral-200">
                          <th className="text-left py-3 px-4 font-medium text-neutral-600">项目</th>
                          <th className="text-right py-3 px-4 font-medium text-neutral-600">金额</th>
                          <th className="text-right py-3 px-4 font-medium text-neutral-600">占比</th>
                        </tr>
                      </thead>
                      <tbody>
                        {costItems.map((item) => (
                          <tr key={item.key} className="border-b border-neutral-100 last:border-0">
                            <td className="py-3 px-4 text-neutral-700">{item.label}</td>
                            <td className="py-3 px-4 text-right font-medium text-neutral-800">{formatCurrency(item.value, '¥', 0)}</td>
                            <td className="py-3 px-4 text-right text-neutral-500">
                              {quotation.totalCost > 0 ? ((item.value / quotation.totalCost) * 100).toFixed(1) : 0}%
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-neutral-50 border-t-2 border-neutral-200">
                          <td className="py-3 px-4 font-semibold text-neutral-700">总成本</td>
                          <td className="py-3 px-4 text-right font-bold text-neutral-800">{formatCurrency(quotation.totalCost, '¥', 0)}</td>
                          <td className="py-3 px-4 text-right font-medium text-neutral-600">100%</td>
                        </tr>
                        <tr className="bg-accent-50">
                          <td className="py-3 px-4 font-semibold text-neutral-700">
                            利润 ({formatPercent(quotation.profitMargin, 0)})
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-accent-600">{formatCurrency(quotation.profitAmount, '¥', 0)}</td>
                          <td className="py-3 px-4 text-right font-medium text-accent-600">
                            {quotation.totalCost > 0 ? ((quotation.profitAmount / quotation.totalCost) * 100).toFixed(1) : 0}%
                          </td>
                        </tr>
                        <tr className="bg-primary-50 border-t-2 border-primary-200">
                          <td className="py-3 px-4 font-bold text-primary-700">报价金额</td>
                          <td className="py-3 px-4 text-right text-2xl font-bold text-primary-700">{formatCurrency(quotation.quotationPrice, '¥', 0)}</td>
                          <td className="py-3 px-4 text-right font-medium text-primary-600">
                            {quotation.totalCost > 0 ? ((quotation.quotationPrice / quotation.totalCost) * 100).toFixed(1) : 0}%
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'approval' && (
                <div className="space-y-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 z-10">
                        <FileText className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 pb-4 border-b border-neutral-100">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-neutral-800">创建报价单</p>
                          <span className="text-xs text-neutral-400">{dayjs(quotation.createdAt).format('YYYY-MM-DD HH:mm')}</span>
                        </div>
                        <p className="text-sm text-neutral-500 mt-1">报价单草稿创建完成，状态为「草稿」</p>
                        <Tag variant="gray" className="mt-2">草稿</Tag>
                      </div>
                    </div>

                    {quotation.status !== 'draft' && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-warning-light flex items-center justify-center flex-shrink-0 z-10">
                          <Rocket className="w-4 h-4 text-warning" />
                        </div>
                        <div className={`flex-1 pb-4 ${quotation.status !== 'pending' ? 'border-b border-neutral-100' : ''}`}>
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-neutral-800">提交审批</p>
                            <span className="text-xs text-neutral-400">{dayjs(quotation.createdAt).add(1, 'minute').format('YYYY-MM-DD HH:mm')}</span>
                          </div>
                          <p className="text-sm text-neutral-500 mt-1">提交进入审批流程，等待审批处理</p>
                          <Tag variant="warning" className="mt-2">待审批</Tag>
                        </div>
                      </div>
                    )}

                    {(quotation.status === 'approved' || quotation.status === 'rejected' || quotation.status === 'expired') && (
                      <div className="flex gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                          quotation.status === 'approved' ? 'bg-success-light text-success' :
                          quotation.status === 'rejected' ? 'bg-danger-light text-danger' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {quotation.status === 'approved' ? <Check className="w-4 h-4" /> :
                           quotation.status === 'rejected' ? <X className="w-4 h-4" /> :
                           <AlertTriangle className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-neutral-800">
                              {quotation.status === 'approved' ? '审批通过' :
                               quotation.status === 'rejected' ? '审批拒绝' : '已过期'}
                            </p>
                            <span className="text-xs text-neutral-400">
                              {quotation.approvedAt
                                ? dayjs(quotation.approvedAt).format('YYYY-MM-DD HH:mm')
                                : dayjs(quotation.createdAt).add(3, 'day').format('YYYY-MM-DD HH:mm')}
                            </span>
                          </div>
                          <p className="text-sm text-neutral-500 mt-1">
                            {quotation.status === 'approved' && '报价单审批通过，可以开始创建模具项目'}
                            {quotation.status === 'rejected' && `审批拒绝：${quotation.remark || '未填写原因'}`}
                            {quotation.status === 'expired' && '报价单超过有效期，已自动过期'}
                          </p>
                          <Tag
                            variant={
                              quotation.status === 'approved' ? 'success' :
                              quotation.status === 'rejected' ? 'danger' : 'gray'
                            }
                            className="mt-2"
                          >
                            {quotationStatusMap[quotation.status]?.label}
                          </Tag>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'project' && (
                <div className="space-y-4">
                  {relatedProjects.length === 0 ? (
                    <div className="text-center py-12">
                      <LinkIcon className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                      <p className="text-neutral-500 text-sm">暂无关联项目</p>
                      {quotation.status === 'approved' && (
                        <Button variant="primary" icon={Rocket} className="mt-4" onClick={handleGenerateProject}>
                          立即生成项目
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {relatedProjects.map((p) => (
                        <div
                          key={p.id}
                          className="border border-neutral-200 rounded-xl p-4 hover:border-primary-200 hover:bg-primary-50/30 transition-colors cursor-pointer"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono font-semibold text-primary-700">{p.projectNo}</span>
                                <Tag variant={
                                  p.status === 'completed' ? 'success' :
                                  p.status === 'design' ? 'info' :
                                  p.status === 'machining' ? 'warning' :
                                  p.status === 'assembly' ? 'accent' :
                                  p.status === 'trymold' ? 'primary' :
                                  p.status === 'maintenance' ? 'warning' : 'gray'
                                }>
                                  {projectStatusMap[p.status]?.label}
                                </Tag>
                              </div>
                              <p className="text-sm font-medium text-neutral-800">{p.moldName}</p>
                              <p className="text-xs text-neutral-500 mt-1">
                                模架编号：{p.moldBaseCode || '未分配'}
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-neutral-300" />
                          </div>
                          <div className="mt-3 pt-3 border-t border-neutral-100 grid grid-cols-3 gap-3 text-xs">
                            <div>
                              <p className="text-neutral-400">创建日期</p>
                              <p className="font-medium text-neutral-700 mt-0.5">{dayjs(p.createdAt).format('YYYY-MM-DD')}</p>
                            </div>
                            <div>
                              <p className="text-neutral-400">计划交付</p>
                              <p className="font-medium text-neutral-700 mt-0.5">{p.plannedDeliveryDate}</p>
                            </div>
                            <div>
                              <p className="text-neutral-400">进度</p>
                              <p className="font-medium text-neutral-700 mt-0.5">
                                {p.totalCycles > 0 ? formatNumber(p.currentCycles / p.totalCycles * 100, 0) : 0}%
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card p-5 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-accent-500/10" />
            <div className="relative">
              <p className="text-xs text-neutral-500 mb-1">报价总金额</p>
              <p className="text-3xl font-bold text-neutral-900 tracking-tight mb-3">
                {formatCurrency(quotation.quotationPrice, '¥', 0)}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-white/70 backdrop-blur">
                  <p className="text-xs text-neutral-500 mb-0.5">总成本</p>
                  <p className="text-base font-semibold text-neutral-800">{formatCurrency(quotation.totalCost, '¥', 0)}</p>
                </div>
                <div className="p-3 rounded-lg bg-white/70 backdrop-blur">
                  <p className="text-xs text-neutral-500 mb-0.5">利润率</p>
                  <p className={`text-base font-semibold ${
                    quotation.profitMargin >= 0.3 ? 'text-success' :
                    quotation.profitMargin < 0.2 ? 'text-danger' : 'text-accent-600'
                  }`}>
                    {formatPercent(quotation.profitMargin, 0)}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-neutral-200/60">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500">利润金额</span>
                  <span className="font-bold text-accent-600">{formatCurrency(quotation.profitAmount, '¥', 0)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-neutral-800 mb-4">模具信息摘要</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 flex items-center gap-2">
                  <Box className="w-4 h-4" /> 模具名称
                </span>
                <span className="font-medium text-neutral-800 text-right max-w-[60%] truncate" title={quotation.moldName}>
                  {quotation.moldName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 flex items-center gap-2">
                  <Layers className="w-4 h-4" /> 模腔数
                </span>
                <span className="font-medium text-neutral-800">{quotation.cavityQty} 腔</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">模具类型</span>
                <span className="font-medium text-neutral-800">{quotation.moldType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">产品材料</span>
                <span className="font-medium text-neutral-800">{quotation.productMaterial}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 flex items-center gap-2">
                  <Ruler className="w-4 h-4" /> 吨位
                </span>
                <span className="font-medium text-neutral-800">{quotation.estimatedTonnage} T</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">预估寿命</span>
                <span className="font-medium text-neutral-800">{formatNumber(quotation.estimatedCycles, 0)} 次</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 flex items-center gap-2">
                  <Truck className="w-4 h-4" /> 交期
                </span>
                <span className="font-medium text-neutral-800">{quotation.deliveryDays} 天</span>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-neutral-800 mb-4">操作提示</h3>
            <div className="space-y-3">
              {quotation.status === 'draft' && (
                <div className="p-3 rounded-lg bg-warning-light/40 border border-warning/20 text-sm">
                  <p className="font-medium text-warning mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> 待提交
                  </p>
                  <p className="text-xs text-neutral-600">请核对所有信息无误后点击「提交审批」进入审批流程</p>
                </div>
              )}
              {quotation.status === 'pending' && (
                <div className="p-3 rounded-lg bg-primary-50 border border-primary-200 text-sm">
                  <p className="font-medium text-primary-700 mb-1">审批中</p>
                  <p className="text-xs text-neutral-600">报价单正在等待审批，通过后可创建项目</p>
                </div>
              )}
              {quotation.status === 'approved' && relatedProjects.length === 0 && (
                <div className="p-3 rounded-lg bg-success-light/40 border border-success/20 text-sm">
                  <p className="font-medium text-success mb-1 flex items-center gap-1">
                    <Check className="w-4 h-4" /> 审批通过
                  </p>
                  <p className="text-xs text-neutral-600">报价已通过，请点击「生成项目」创建模具生产项目</p>
                </div>
              )}
              {quotation.status === 'approved' && relatedProjects.length > 0 && (
                <div className="p-3 rounded-lg bg-success-light/40 border border-success/20 text-sm">
                  <p className="font-medium text-success mb-1 flex items-center gap-1">
                    <Check className="w-4 h-4" /> 项目已生成
                  </p>
                  <p className="text-xs text-neutral-600">已关联 {relatedProjects.length} 个项目，可在项目模块查看进度</p>
                </div>
              )}
              {quotation.status === 'rejected' && (
                <div className="p-3 rounded-lg bg-danger-light/40 border border-danger/20 text-sm">
                  <p className="font-medium text-danger mb-1 flex items-center gap-1">
                    <X className="w-4 h-4" /> 审批未通过
                  </p>
                  <p className="text-xs text-neutral-600">
                    原因：{quotation.remark || '未填写'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationDetail;
