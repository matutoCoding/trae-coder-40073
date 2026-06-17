import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  AlertTriangle,
  FileCheck,
  CheckSquare,
  Square,
  Clock,
  User,
  Pencil,
  Plus,
  Trash2,
  Save,
} from 'lucide-react';
import Tabs from '@/components/ui/Tabs';
import ProgressBar from '@/components/ui/ProgressBar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Table from '@/components/ui/Table';
import type { TableColumn } from '@/components/ui/Table';
import Tag from '@/components/ui/Tag';
import { useAssemblyStore } from '@/store/assembly';
import { cn } from '@/lib/utils';

export default function AssemblyDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('checklist');
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [stepHours, setStepHours] = useState<number>(0);
  const [stepRemark, setStepRemark] = useState('');
  const [newIssue, setNewIssue] = useState('');

  const {
    getTask,
    toggleStep,
    addIssue,
    removeIssue,
    addStep,
    removeStep,
  } = useAssemblyStore();

  const task = getTask(id);

  const progress = useMemo(() => {
    if (!task) return { done: 0, total: 0, pct: 0 };
    const done = task.steps.filter((s) => s.done).length;
    const total = task.steps.length;
    return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
  }, [task]);

  if (!task) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-500">任务不存在</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/assembly')}>
          返回列表
        </Button>
      </div>
    );
  }

  const statusMap: Record<string, { label: string; variant: 'gray' | 'primary' | 'accent' | 'success' }> = {
    pending: { label: '待开始', variant: 'gray' },
    in_progress: { label: '进行中', variant: 'primary' },
    inspection: { label: '待验收', variant: 'accent' },
    completed: { label: '已完成', variant: 'success' },
  };

  const statusCfg = statusMap[task.status] || statusMap.pending;

  const bomColumns: TableColumn<{ name: string; spec: string; qty: number; unit: string }>[] = [
    { key: 'name', title: '零件名称', dataIndex: 'name' },
    { key: 'spec', title: '规格型号', dataIndex: 'spec' },
    { key: 'qty', title: '数量', dataIndex: 'qty', align: 'center', width: 80 },
    { key: 'unit', title: '单位', dataIndex: 'unit', align: 'center', width: 80 },
  ];

  const mockBom = [
    { name: '动模板', spec: '350×450×80', qty: 1, unit: '件' },
    { name: '定模板', spec: '350×450×100', qty: 1, unit: '件' },
    { name: '型腔镶件', spec: 'NAK80', qty: 1, unit: '件' },
    { name: '型芯镶件', spec: 'NAK80', qty: 1, unit: '件' },
    { name: '导柱', spec: 'Φ40×200', qty: 4, unit: '支' },
    { name: '顶针', spec: 'Φ6×150', qty: 12, unit: '支' },
    { name: '复位杆', spec: 'Φ25×200', qty: 4, unit: '支' },
    { name: '弹簧', spec: 'SW40×150', qty: 6, unit: '支' },
  ];

  const inspectionColumns: TableColumn<{ item: string; standard: string; result: string }>[] = [
    { key: 'item', title: '检查项目', dataIndex: 'item' },
    { key: 'standard', title: '验收标准', dataIndex: 'standard' },
    {
      key: 'result',
      title: '检查结果',
      dataIndex: 'result',
      align: 'center',
      width: 120,
      render: (v) =>
        v === '合格' ? (
          <Tag variant="success">合格</Tag>
        ) : v === '不合格' ? (
          <Tag variant="danger">不合格</Tag>
        ) : (
          <Tag variant="gray">待检</Tag>
        ),
    },
  ];

  const mockInspection = [
    { item: '分型面配合', standard: '间隙≤0.02mm，无拉伤', result: '合格' },
    { item: '导柱导套润滑', standard: '滑动顺畅，无卡滞', result: '合格' },
    { item: '顶出系统', standard: '顶出顺畅，复位到位', result: '合格' },
    { item: '冷却水路', standard: '0.8MPa保压5min无泄漏', result: '待检' },
    { item: '开模行程', standard: '符合设计要求', result: '待检' },
    { item: '整体外观', standard: '无毛刺、锈蚀、磕碰伤', result: '合格' },
  ];

  const handleToggle = (stepId: string) => {
    if (editingStep === stepId) {
      toggleStep(id, stepId, stepHours);
      setEditingStep(null);
      setStepRemark('');
      setStepHours(0);
    } else {
      toggleStep(id, stepId);
    }
  };

  const startEdit = (stepId: string, hours: number) => {
    setEditingStep(stepId);
    setStepHours(hours);
  };

  const handleAddStep = () => {
    const name = prompt('请输入步骤名称：');
    if (name?.trim()) {
      const h = Number(prompt('请输入计划工时（小时）：', '2') || '0');
      addStep(id, { name: name.trim(), hours: isNaN(h) ? 2 : h });
    }
  };

  const handleAddIssue = () => {
    if (!newIssue.trim()) return;
    addIssue(id, newIssue.trim());
    setNewIssue('');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/assembly')}
          >
            返回
          </Button>
          <div>
            <h1 className="text-xl font-bold text-neutral-800">
              {task.projectNo} - 装配钳工详情
            </h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              钳工：{task.fitter} | 检验员：{task.inspector}
            </p>
          </div>
        </div>
        <Tag variant={statusCfg.variant}>
          {statusCfg.label}
        </Tag>
      </div>

      <div className="card p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <User className="w-4 h-4" />
              <span>装配进度</span>
            </div>
            <ProgressBar
              value={progress.pct}
              showLabel
              labelPosition="inside"
              size="lg"
              color={progress.pct === 100 ? 'success' : 'primary'}
              animated={progress.pct < 100 && progress.pct > 0}
            />
            <p className="text-xs text-neutral-400 text-right">
              {progress.done} / {progress.total} 步骤完成
            </p>
          </div>
        <div>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Clock className="w-4 h-4" />
            <span>计划工时</span>
          </div>
          <p className="text-2xl font-bold text-neutral-800">{task.planHours}h</p>
          <p className="text-xs text-neutral-400">标准工时</p>
        </div>
        <div>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Clock className="w-4 h-4" />
            <span>实际工时</span>
          </div>
          <p
            className={cn(
              'text-2xl font-bold',
              task.actualHours > task.planHours
                ? 'text-danger'
                : 'text-neutral-800'
            )}
          >
            {task.actualHours}h
          </p>
          <p className="text-xs text-neutral-400">
            {task.actualHours > task.planHours
              ? '超时 ' +
                (task.actualHours - task.planHours) +
                'h'
              : '剩余 ' + Math.max(0, task.planHours - task.actualHours) +
                'h'}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <AlertTriangle className="w-4 h-4" />
            <span>问题记录</span>
          </div>
          <p
            className={cn(
              'text-2xl font-bold',
              task.issues.length > 0 ? 'text-danger' : 'text-success'
            )}
          >
            {task.issues.length}
          </p>
          <p className="text-xs text-neutral-400">待处理问题</p>
        </div>
      </div>

      <Tabs
        tabs={[
          { key: 'checklist', label: '步骤清单', icon: CheckSquare },
          { key: 'bom', label: 'BOM零件清单', icon: Package },
          { key: 'issues', label: '问题记录', icon: AlertTriangle },
          { key: 'inspection', label: '预验收检查表', icon: FileCheck },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      <div className="mt-4">
        {activeTab === 'checklist' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-neutral-700">装配步骤清单</h3>
              <Button size="sm" variant="outline" icon={Plus} onClick={handleAddStep}>
                添加步骤
              </Button>
            </div>
            <div className="space-y-2">
              {task.steps
                .sort((a, b) => a.order - b.order)
                .map((step) => (
                  <div
                    key={step.id}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-lg border transition-all',
                      step.done
                        ? 'bg-success-light/30 border-success/20'
                        : 'bg-white border-neutral-200'
                    )}
                  >
                    <button
                      onClick={() => handleToggle(step.id)}
                      className="cursor-pointer flex-shrink-0"
                    >
                      {step.done ? (
                        <CheckSquare className="w-6 h-6 text-success" />
                      ) : (
                        <Square className="w-6 h-6 text-neutral-300 hover:text-primary-500 transition-colors" />
                      )}
                    </button>

                    <div className="flex items-center gap-1 text-neutral-400 text-sm w-8 font-mono font-semibold">
                      {step.order}.
                    </div>

                    <div className="flex-1">
                      <p
                        className={cn(
                          'font-medium',
                          step.done && 'line-through text-neutral-500'
                        )}
                      >
                        {step.name}
                      </p>
                      {editingStep === step.id && (
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Input
                            type="number"
                            size="sm"
                            value={stepHours}
                            onChange={(e) => setStepHours(Number(e.target.value))}
                            wrapperClassName="w-24"
                            placeholder="工时"
                          />
                          <Input
                            size="sm"
                            value={stepRemark}
                            onChange={(e) => setStepRemark(e.target.value)}
                            wrapperClassName="w-60"
                            placeholder="备注..."
                          />
                          <Button
                            size="sm"
                            icon={Save}
                            onClick={() => {
                              toggleStep(id, step.id, stepHours);
                              setEditingStep(null);
                              setStepRemark('');
                            }}
                          >
                            保存
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-sm text-neutral-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{step.hours}h</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={Pencil}
                        onClick={() => startEdit(step.id, step.hours)}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={Trash2}
                        className="text-danger hover:text-danger"
                        onClick={() => removeStep(id, step.id)}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'bom' && (
          <div>
            <h3 className="font-semibold text-neutral-700 mb-3">BOM 零件清单</h3>
            <Table
              columns={bomColumns}
              dataSource={mockBom}
              bordered
              rowKey="name"
            />
          </div>
        )}

        {activeTab === 'issues' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-neutral-700">问题记录</h3>
            </div>
            <div className="flex gap-2">
              <Input
                value={newIssue}
                onChange={(e) => setNewIssue(e.target.value)}
                wrapperClassName="flex-1"
                placeholder="输入问题描述..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddIssue();
                }}
              />
              <Button icon={Plus} onClick={handleAddIssue}>
                添加问题
              </Button>
            </div>
            {task.issues.length === 0 ? (
              <div className="text-center py-10 text-neutral-400">暂无问题记录</div>
            ) : (
              <div className="space-y-2">
                {task.issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg border border-danger/20 bg-danger-light/30"
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-danger" />
                      <span>{issue}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={Trash2}
                      className="text-danger"
                      onClick={() => removeIssue(id, idx)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'inspection' && (
          <div>
            <h3 className="font-semibold text-neutral-700 mb-3">预验收检查表</h3>
            <Table
              columns={inspectionColumns}
              dataSource={mockInspection}
              bordered
              rowKey="item"
            />
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
