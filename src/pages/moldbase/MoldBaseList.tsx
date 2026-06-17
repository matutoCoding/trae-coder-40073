import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMoldBaseStore } from '../../store/moldbase';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Tag from '../../components/ui/Tag';
import { Search, Filter, Grid3X3, List, Box, Scale, DollarSign, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

const MoldBaseList = () => {
  const navigate = useNavigate();
  const { moldBases, getTypes, getSeries, filterByDimension } = useMoldBaseStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [typeFilter, setTypeFilter] = useState('all');
  const [seriesFilter, setSeriesFilter] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [minLength, setMinLength] = useState<string>('');
  const [maxLength, setMaxLength] = useState<string>('');
  const [minWidth, setMinWidth] = useState<string>('');
  const [maxWidth, setMaxWidth] = useState<string>('');

  const types = useMemo(() => getTypes(), [getTypes]);
  const series = useMemo(() => getSeries(), [getSeries]);

  const filteredMoldBases = useMemo(() => {
    let list = moldBases;
    if (typeFilter !== 'all') {
      list = list.filter((m) => m.type === typeFilter);
    }
    if (seriesFilter !== 'all') {
      list = list.filter((m) => m.series === seriesFilter);
    }
    if (keyword) {
      const kw = keyword.toLowerCase();
      list = list.filter(
        (m) =>
          m.code.toLowerCase().includes(kw) ||
          m.type.toLowerCase().includes(kw) ||
          m.series.toLowerCase().includes(kw) ||
          m.material.toLowerCase().includes(kw)
      );
    }
    const mL = minLength ? parseFloat(minLength) : undefined;
    const mxL = maxLength ? parseFloat(maxLength) : undefined;
    const mW = minWidth ? parseFloat(minWidth) : undefined;
    const mxW = maxWidth ? parseFloat(maxWidth) : undefined;
    if (mL !== undefined || mxL !== undefined || mW !== undefined || mxW !== undefined) {
      const idSet = new Set(filterByDimension(mL, mxL, mW, mxW).map((m) => m.id));
      list = list.filter((m) => idSet.has(m.id));
    }
    return list;
  }, [moldBases, typeFilter, seriesFilter, keyword, minLength, maxLength, minWidth, maxWidth, filterByDimension]);

  const handleCardClick = (code: string) => {
    navigate(`/moldbase/${code}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">标准模架库</h1>
          <p className="text-sm text-neutral-500 mt-1">浏览和选型标准模架规格</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-neutral-200 bg-white overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 flex items-center gap-1.5 text-sm transition-colors ${
                viewMode === 'grid'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
              网格
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 flex items-center gap-1.5 text-sm transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              <List className="w-4 h-4" />
              列表
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-neutral-500" />
          <span className="text-sm font-semibold text-neutral-700">筛选条件</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="模架类型"
            options={[
              { value: 'all', label: '全部类型' },
              ...types.map((t) => ({ value: t, label: t })),
            ]}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          />
          <Select
            label="模架系列"
            options={[
              { value: 'all', label: '全部系列' },
              ...series.map((s) => ({ value: s, label: s })),
            ]}
            value={seriesFilter}
            onChange={(e) => setSeriesFilter(e.target.value)}
          />
          <Input
            label="关键词搜索"
            placeholder="型号/类型/系列/材质"
            leftIcon={Search}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <div />
          <div>
            <label className="label">长度范围 (mm)</label>
            <div className="flex items-center gap-2">
              <Input
                placeholder="最小"
                value={minLength}
                onChange={(e) => setMinLength(e.target.value)}
                type="number"
              />
              <span className="text-neutral-400 text-sm">~</span>
              <Input
                placeholder="最大"
                value={maxLength}
                onChange={(e) => setMaxLength(e.target.value)}
                type="number"
              />
            </div>
          </div>
          <div>
            <label className="label">宽度范围 (mm)</label>
            <div className="flex items-center gap-2">
              <Input
                placeholder="最小"
                value={minWidth}
                onChange={(e) => setMinWidth(e.target.value)}
                type="number"
              />
              <span className="text-neutral-400 text-sm">~</span>
              <Input
                placeholder="最大"
                value={maxWidth}
                onChange={(e) => setMaxWidth(e.target.value)}
                type="number"
              />
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between">
          <span className="text-sm text-neutral-500">
            共找到 <span className="font-semibold text-neutral-800">{filteredMoldBases.length}</span> 条记录
          </span>
          <button
            onClick={() => {
              setTypeFilter('all');
              setSeriesFilter('all');
              setKeyword('');
              setMinLength('');
              setMaxLength('');
              setMinWidth('');
              setMaxWidth('');
            }}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            重置筛选
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredMoldBases.map((mb) => (
            <div
              key={mb.id}
              onClick={() => handleCardClick(mb.id)}
              className="group bg-white rounded-xl border border-neutral-200 overflow-hidden hover:shadow-lg hover:border-primary-300 transition-all cursor-pointer"
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-neutral-100 to-neutral-50 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Box className="w-16 h-16 text-neutral-300" strokeWidth={1.2} />
                </div>
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <Tag variant="primary">{mb.type}</Tag>
                  <Tag variant="accent">{mb.series}</Tag>
                </div>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center text-primary-600">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-neutral-900 text-sm">{mb.code}</h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {mb.length} × {mb.width} mm
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-neutral-500">
                    <span className="text-neutral-400">材质:</span>
                    <span className="text-neutral-700">{mb.material}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-neutral-500">
                    <Scale className="w-3 h-3 text-neutral-400" />
                    <span className="text-neutral-700">{mb.weight} kg</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-success" />
                    <span className="text-lg font-bold text-success">
                      {formatCurrency(mb.price)}
                    </span>
                  </div>
                  <button className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-0.5">
                    查看详情
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="text-left">型号</th>
                <th className="text-left">类型</th>
                <th className="text-left">系列</th>
                <th className="text-left">尺寸 (长×宽)</th>
                <th className="text-left">材质</th>
                <th className="text-right">重量</th>
                <th className="text-right">价格</th>
                <th className="text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredMoldBases.map((mb) => (
                <tr
                  key={mb.id}
                  onClick={() => handleCardClick(mb.id)}
                  className="cursor-pointer hover:bg-neutral-50"
                >
                  <td className="font-semibold text-neutral-900">{mb.code}</td>
                  <td><Tag variant="primary">{mb.type}</Tag></td>
                  <td><Tag variant="accent">{mb.series}</Tag></td>
                  <td className="text-neutral-600">{mb.length} × {mb.width} mm</td>
                  <td className="text-neutral-600">{mb.material}</td>
                  <td className="text-right text-neutral-600">{mb.weight} kg</td>
                  <td className="text-right font-semibold text-success">{formatCurrency(mb.price)}</td>
                  <td className="text-center">
                    <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      详情 →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredMoldBases.length === 0 && (
        <div className="bg-white rounded-xl border border-neutral-200 py-16 flex flex-col items-center justify-center">
          <Box className="w-16 h-16 text-neutral-200 mb-4" strokeWidth={1.2} />
          <p className="text-neutral-500">暂无符合条件的模架数据</p>
          <button
            onClick={() => {
              setTypeFilter('all');
              setSeriesFilter('all');
              setKeyword('');
            }}
            className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            清除筛选条件
          </button>
        </div>
      )}
    </div>
  );
};

export default MoldBaseList;
