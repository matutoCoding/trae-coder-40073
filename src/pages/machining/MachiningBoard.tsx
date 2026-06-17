import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import KanbanBoard, { type KanbanCard, type KanbanColumn } from '../../components/ui/KanbanBoard';
import { useMachiningStore } from '../../store/machining';
import Tag from '../../components/ui/Tag';
import StatCard from '../../components/ui/StatCard';
import {
  LayoutGrid,
  Clock,
  User,
  Cpu,
  Zap,
  Flame,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { cavityTaskStatusMap, partTypeMap } from '../../utils/status';
import type { CavityTask } from '../../types';

type BoardView = 'cavity' | 'wirecut';

const statusColumnOrder = [
  { key: 'pending', title: '待编程', color: 'gray' as const },
  { key: 'programming', title: '编程中', color: 'info' as const },
  { key: 'machining', title: '加工中', color: 'warning' as const },
  { key: 'inspection', title: '待检验', color: 'accent' as const },
  { key: 'completed', title: '已完成', color: 'success' as const },
];

const wirecutStatusColumnOrder = [
  { key: 'pending', title: '待编程', color: 'gray' as const },
  { key: 'programming', title: '编程中', color: 'info' as const },
  { key: 'processing', title: '加工中', color: 'warning' as const },
  { key: 'inspection', title: '待检验', color: 'accent' as const },
  { key: 'completed', title: '已完成', color: 'success' as const },
];

const MachiningBoard = () => {
  const navigate = useNavigate();
  const { cavityTasks, wireCutTasks, changeCavityStatus } = useMachiningStore();
  const [view, setView] = useState<BoardView>('cavity');

  const cavityColumns: KanbanColumn[] = useMemo(() => {
    return statusColumnOrder.map((col) => {
      const cards = cavityTasks
        .filter((t) => t.status === col.key)
        .map<CavityTask & KanbanCard>((t) => ({
          ...t,
          id: t.id,
          title: t.partName,
          description: `${t.projectNo} · ${t.processRoute[t.currentProcess] || '待排产'}`,
          tags: [
            {
              label: partTypeMap[t.partType]?.label || t.partType,
              variant: (partTypeMap[t.partType]?.color?.includes('blue')
                ? 'info'
                : partTypeMap[t.partType]?.color?.includes('green')
                  ? 'success'
                  : partTypeMap[t.partType]?.color?.includes('orange')
                    ? 'warning'
                    : 'accent') as any,
            },
          ],
          meta: [
            { label: '机床', value: t.cncMachine || '-' },
            { label: '工时', value: `${t.actualHours}/${t.planHours}h` },
          ],
        }));
      return {
        key: col.key,
        title: col.title,
        color: col.color,
        cards,
      };
    });
  }, [cavityTasks]);

  const wirecutColumns: KanbanColumn[] = useMemo(() => {
    return wirecutStatusColumnOrder.map((col) => {
      const tasks = wireCutTasks.filter((t) => {
        if (col.key === 'pending') return t.status === 'pending';
        if (col.key === 'processing') return t.status === 'processing';
        if (col.key === 'completed') return t.status === 'completed';
        if (col.key === 'programming') return false;
        if (col.key === 'inspection') return false;
        return false;
      });
      const cards = tasks.map<any>((t) => ({
        id: t.id,
        title: t.partName,
        description: `${t.projectNo} · ${t.wireType} Φ${t.wireDiameter}mm`,
        tags: [{ label: '慢走丝', variant: 'info' as const }],
        meta: [
          { label: '丝材', value: t.wireType },
          { label: '工时', value: `${t.actualHours}/${t.planHours}h` },
        ],
      }));
      return {
        key: col.key,
        title: col.title,
        color: col.color,
        cards,
      };
    });
  }, [wireCutTasks]);

  const stats = useMemo(() => {
    if (view === 'cavity') {
      const total = cavityTasks.length;
      const machining = cavityTasks.filter((t) => t.status === 'machining').length;
      const completed = cavityTasks.filter((t) => t.status === 'completed').length;
      const totalPlan = cavityTasks.reduce((s, t) => s + t.planHours, 0);
      const totalActual = cavityTasks.reduce((s, t) => s + t.actualHours, 0);
      return [
        { title: '任务总数', value: total, icon: Layers, color: 'primary' as const },
        { title: '加工中', value: machining, icon: Flame, color: 'warning' as const },
        { title: '已完成', value: completed, icon: CheckCircle2, color: 'success' as const },
        {
          title: '工时达成率',
          value: totalPlan > 0 ? `${Math.round((totalActual / totalPlan) * 100)}%` : '-',
          icon: Clock,
          color: 'accent' as const,
        },
      ];
    } else {
      const total = wireCutTasks.length;
      const processing = wireCutTasks.filter((t) => t.status === 'processing').length;
      const completed = wireCutTasks.filter((t) => t.status === 'completed').length;
      const totalCutLen = wireCutTasks.reduce((s, t) => s + t.cutLength, 0);
      return [
        { title: '任务总数', value: total, icon: Layers, color: 'primary' as const },
        { title: '加工中', value: processing, icon: Zap, color: 'warning' as const },
        { title: '已完成', value: completed, icon: CheckCircle2, color: 'success' as const },
        {
          title: '累计切割',
          value: `${(totalCutLen / 1000).toFixed(1)}km`,
          icon: Cpu,
          color: 'accent' as const,
        },
      ];
    }
  }, [view, cavityTasks, wireCutTasks]);

  const handleCardDrop = (
    cardId: string | number,
    fromColumn: string,
    toColumn: string,
    toIndex: number
  ) => {
    if (fromColumn === toColumn) return;
    if (view === 'cavity') {
      changeCavityStatus(String(cardId), toColumn as any);
    }
  };

  const handleCardClick = (card: KanbanCard, columnKey: string) => {
    if (view === 'cavity') {
      navigate(`/machining/cavity/${card.id}`);
    }
  };

  const activeColumns = view === 'cavity' ? cavityColumns : wirecutColumns;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">零件加工看板</h1>
          <p className="text-sm text-neutral-500 mt-1">拖拽卡片更新任务状态</p>
        </div>
        <div className="flex items-center rounded-lg border border-neutral-200 bg-white overflow-hidden">
          <button
            onClick={() => setView('cavity')}
            className={`px-4 py-2.5 flex items-center gap-2 text-sm font-medium transition-colors ${
              view === 'cavity'
                ? 'bg-primary-50 text-primary-700'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            型腔型芯
          </button>
          <button
            onClick={() => setView('wirecut')}
            className={`px-4 py-2.5 flex items-center gap-2 text-sm font-medium transition-colors ${
              view === 'wirecut'
                ? 'bg-primary-50 text-primary-700'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <Zap className="w-4 h-4" />
            慢走丝
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard
            key={s.title}
            title={s.title}
            value={s.value}
            icon={s.icon}
            color={s.color}
          />
        ))}
      </div>

      <div className="flex-1 min-h-0 bg-white rounded-xl border border-neutral-200 p-4 overflow-hidden">
        <KanbanBoard
          columns={activeColumns}
          onCardDrop={handleCardDrop}
          onCardClick={handleCardClick}
          className="h-full"
        />
      </div>
    </div>
  );
};

export default MachiningBoard;
