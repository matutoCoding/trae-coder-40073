import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Calendar,
  Eye,
  Edit2,
  Trash2,
} from 'lucide-react';
import Table, { type TableColumn } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Tag from '@/components/ui/Tag';
import {
  useQuotationStore,
  type Quotation,
} from '@/store';
import { formatCurrency, formatPercent } from '@/utils/currency';
import { quotationStatusMap } from '@/utils/status';
import dayjs from 'dayjs';

const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'draft', label: '草稿' },
  { value: 'pending', label: '待审批' },
  { value: 'approved', label: '已通过' },
  { value: 'rejected', label: '已拒绝' },
  { value: 'expired', label: '已过期' },
];

const tagVariantMap: Record<string, 'gray' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'accent'> = {
  draft: 'gray',
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  expired: 'gray',
};

const QuotationList = () => {
  const navigate = useNavigate();

  const quotations = useQuotationStore((s) => s.quotations);
  const filteredQuotations = useQuotationStore((s) => s.filteredQuotations());
  const statusFilter = useQuotationStore((s) => s.statusFilter);
  const keyword = useQuotationStore((s) => s.keyword);
  const setStatusFilter = useQuotationStore((s) => s.setStatusFilter);
  const setKeyword = useQuotationStore((s) => s.setKeyword);
  const deleteQuotation = useQuotationStore((s) => s.deleteQuotation);

  const customerOptions = useMemo(() => {
    const unique = Array.from(new Map(quotations.map((q) => [q.customerId, q.customerName])).entries());
    return [
      { value: 'all', label: '全部客户' },
      ...unique.map(([value, label]) => ({ value, label })),
    ];
  }, [quotations]);

  const summary = useMemo(() => {
    const total = quotations.length;
    const totalAmount = quotations.reduce((s, q) => s + q.quotationPrice, 0);
    const approved = quotations.filter((q) => q.status === 'approved').length;
    const pending = quotations.filter((q) => q.status === 'pending').length;
    return { total, totalAmount, approved, pending };
  }, [quotations]);

  const handleRowClick = (record: Quotation) => {
    navigate(`/quotation/${record.id}`);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('确定删除此报价单？删除后无法恢复。')) {
      deleteQuotation(id);
    }
  };

  const columns: TableColumn<Quotation>[] = [
    {
      key: 'quotationNo',
      title: '编号',
      dataIndex: 'quotationNo',
      width: 140,
      sorter: (a, b) => a.quotationNo.localeCompare(b.quotationNo),
      render: (v) => (
        <span className="font-mono text-sm font-medium text-primary-700">{v}</span>
      ),
    },
    {
      key: 'customerName',
      title: '客户',
      dataIndex: 'customerName',
      width: 200,
      sorter: (a, b) => a.customerName.localeCompare(b.customerName),
      render: (v) => (
        <span className="text-sm text-neutral-800 truncate block max-w-[180px]" title={v}>
          {v}
        </span>
      ),
    },
    {
      key: 'moldName',
      title: '模具名',
      dataIndex: 'moldName',
      width: 200,
      sorter: (a, b) => a.moldName.localeCompare(b.moldName),
      render: (v, record) => (
        <div>
          <span className="text-sm font-medium text-neutral-800">{v}</span>
          <p className="text-xs text-neutral-400 mt-0.5">{record.moldType}</p>
        </div>
      ),
    },
    {
      key: 'moldType',
      title: '类型',
      dataIndex: 'moldType',
      width: 120,
      render: (v) => (
        <span className="text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded">{v}</span>
      ),
    },
    {
      key: 'cavityQty',
      title: '模腔数',
      dataIndex: 'cavityQty',
      width: 80,
      align: 'center',
      sorter: (a, b) => a.cavityQty - b.cavityQty,
      render: (v) => <span className="text-sm font-medium">{v}</span>,
    },
    {
      key: 'quotationPrice',
      title: '总金额',
      dataIndex: 'quotationPrice',
      width: 130,
      align: 'right',
      sorter: (a, b) => a.quotationPrice - b.quotationPrice,
      render: (v) => (
        <span className="text-sm font-semibold text-neutral-800">
          {formatCurrency(v as number, '¥', 0)}
        </span>
      ),
    },
    {
      key: 'profitMargin',
      title: '利润率',
      dataIndex: 'profitMargin',
      width: 100,
      align: 'right',
      sorter: (a, b) => a.profitMargin - b.profitMargin,
      render: (v) => {
        const val = v as number;
        const isHigh = val >= 0.28;
        const isLow = val < 0.2;
        return (
          <span
            className={`text-sm font-medium ${
              isHigh ? 'text-success' : isLow ? 'text-danger' : 'text-neutral-600'
            }`}
          >
            {formatPercent(val, 0)}
          </span>
        );
      },
    },
    {
      key: 'status',
      title: '状态',
      dataIndex: 'status',
      width: 100,
      align: 'center',
      render: (v) => {
        const status = quotationStatusMap[v as string];
        return (
          <Tag variant={tagVariantMap[v as string] || 'gray'}>
            {status?.label || v}
          </Tag>
        );
      },
    },
    {
      key: 'createdAt',
      title: '创建日期',
      dataIndex: 'createdAt',
      width: 120,
      align: 'center',
      sorter: (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
      render: (v) => (
        <span className="text-xs text-neutral-500">
          {dayjs(v as string).format('YYYY-MM-DD')}
        </span>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      width: 140,
      align: 'center',
      render: (_, record) => (
        <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/quotation/${record.id}`)}
            className="p-1.5 rounded-md hover:bg-primary-50 text-neutral-400 hover:text-primary-600 transition-colors"
            title="查看详情"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(`/quotation/${record.id}/edit`)}
            className="p-1.5 rounded-md hover:bg-accent-50 text-neutral-400 hover:text-accent-500 transition-colors"
            title="编辑"
            disabled={record.status === 'approved' || record.status === 'rejected' || record.status === 'expired'}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => handleDelete(record.id, e)}
            className="p-1.5 rounded-md hover:bg-danger-50 text-neutral-400 hover:text-danger transition-colors"
            title="删除"
            disabled={record.status === 'approved'}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">报价单管理</h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              共 {summary.total} 份报价，总额 {formatCurrency(summary.totalAmount, '¥', 0)}，
              通过 {summary.approved} 份，待审批 {summary.pending} 份
            </p>
          </div>
        </div>
        <Button icon={Plus} onClick={() => navigate('/quotation/new')}>
          新建报价
        </Button>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-1 md:mb-0">
            <Filter className="w-4 h-4 text-neutral-400" />
            <span>筛选条件：</span>
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            options={statusOptions}
            wrapperClassName="w-[140px]"
          />
          <Select
            defaultValue="all"
            options={customerOptions}
            placeholder="选择客户"
            wrapperClassName="w-[200px]"
          />
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-neutral-400" />
            <input
              type="date"
              className="input w-[150px] text-sm"
              placeholder="开始日期"
            />
            <span className="text-neutral-400">~</span>
            <input
              type="date"
              className="input w-[150px] text-sm"
              placeholder="结束日期"
            />
          </div>
          <div className="flex-1 min-w-[240px]" />
          <Input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索编号/客户/模具名"
            leftIcon={Search}
            wrapperClassName="w-[280px]"
          />
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <Table
          columns={columns}
          dataSource={filteredQuotations}
          rowKey="id"
          onRowClick={handleRowClick}
          pageSize={10}
          rowClassName={() => 'hover:bg-primary-50/40 transition-colors'}
        />
      </div>
    </div>
  );
};

export default QuotationList;
