import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMachiningStore } from '../../store/machining';
import Stepper, { type StepItem } from '../../components/ui/Stepper';
import Tabs from '../../components/ui/Tabs';
import Tag from '../../components/ui/Tag';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import {
  ArrowLeft,
  User,
  Cpu,
  Clock,
  Layers,
  Play,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  Paperclip,
  ChevronRight,
  Hammer,
} from 'lucide-react';
import type { CavityTask } from '../../types';
import { cavityTaskStatusMap, partTypeMap } from '../../utils/status';

const CavityDetail = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCavityTask, cavityTasks, advanceCavityProcess } = useMachiningStore();
  const [activeTab, setActiveTab] = useState('process');

  const task = useMemo(
    () => (id ? getCavityTask(id) : undefined),
    [id, getCavityTask]
  );

  const steps: StepItem[] = useMemo(() => {
    if (!task) return [];
    return task.processRoute.map((p, idx) => ({
      key: `step-${idx}`,
      title: p,
      description: idx < task.currentProcess ? '已完成' : idx === task.currentProcess ? '进行中' : '待开始',
    }));
  }, [task]);

  const handleBack = () => {
    navigate('/machining/cavity');
  };

  const handleAdvanceProcess = () => {
    if (task && task.currentProcess < task.processRoute.length) {
      advanceCavityProcess(task.id, 2);
    }
  };

  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <AlertCircle className="w-16 h-16 text-neutral-300 mb-4" />
        <p className="text-neutral-500 mb-4">工单不存在或已被删除</p>
        <Button onClick={handleBack} icon={ArrowLeft}>返回列表</Button>
      </div>
    );
  }

  const currentProcessName = task.processRoute[task.currentProcess] || '已完成';

  const toolList = [
    { no: 'T01', name: 'D16R0.8牛鼻刀', diameter: 16, corner: 0.8, length: 80, holder: 'BT40-ER32-100', life: 85 },
    { no: 'T02', name: 'D8立铣刀', diameter: 8, corner: 0, length: 60, holder: 'BT40-ER20-80', life: 72 },
    { no: 'T03', name: 'D4立铣刀', diameter: 4, corner: 0, length: 50, holder: 'BT40-ER16-70', life: 60 },
    { no: 'T04', name: 'R3球头刀', diameter: 6, corner: 3, length: 55, holder: 'BT40-ER20-80', life: 45 },
    { no: 'T05', name: 'D10钻铣刀', diameter: 10, corner: 0, length: 70, holder: 'BT40-ER25-80', life: 90 },
  ];

  const cuttingParams = [
    { step: '粗加工', tool: 'T01', spindle: 8500, feed: 3200, axial: 0.6, radial: 12, speed: '高速' },
    { step: '半精加工', tool: 'T02', spindle: 12000, feed: 4800, axial: 0.3, radial: 6, speed: '高速' },
    { step: '精加工', tool: 'T04', spindle: 15000, feed: 6000, axial: 0.15, radial: 2, speed: '高速' },
    { step: '清根加工', tool: 'T03', spindle: 14000, feed: 4200, axial: 0.1, radial: 1.5, speed: '高速' },
  ];

  const processRecords = [
    { time: '2025-06-17 09:15', process: '粗加工', operator: '张师傅', machine: 'DM-01', hours: 3.5, result: '正常', remark: '尺寸偏差0.02mm' },
    { time: '2025-06-17 14:30', process: '半精加工', operator: '张师傅', machine: 'DM-01', hours: 2.8, result: '正常', remark: '' },
    { time: '2025-06-18 08:30', process: '精加工', operator: '李师傅', machine: 'DM-02', hours: 1.5, result: '进行中', remark: '' },
  ];

  const inspectionRecords = [
    { time: '2025-06-17 16:45', process: '粗加工后', inspector: '王质检员', items: 12, pass: 12, fail: 0, result: '合格', remark: '' },
    { time: '2025-06-17 17:30', process: '半精后', inspector: '王质检员', items: 18, pass: 17, fail: 1, result: '条件合格', remark: 'R角余量偏大，需注意精加工' },
  ];

  const attachments = [
    { name: `${task.partName}_加工程序_V1.ptp`, size: '2.4 MB', type: '程序', date: '2025-06-16' },
    { name: `${task.partName}_刀具清单.pdf`, size: '156 KB', type: '文档', date: '2025-06-16' },
    { name: `${task.partName}_工艺卡.pdf`, size: '428 KB', type: '文档', date: '2025-06-16' },
    { name: `${task.partName}_三维图.step`, size: '8.2 MB', type: '图纸', date: '2025-06-15' },
  ];

  const statusInfo = cavityTaskStatusMap[task.status];
  const statusVariant =
    task.status === 'completed'
      ? 'success'
      : task.status === 'machining'
        ? 'warning'
        : task.status === 'programming'
          ? 'info'
          : task.status === 'inspection'
            ? 'accent'
            : 'gray';

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
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-neutral-900">{task.partName}</h1>
            <Tag variant={partTypeMap[task.partType]?.color?.includes('blue') ? 'info' : partTypeMap[task.partType]?.color?.includes('green') ? 'success' : partTypeMap[task.partType]?.color?.includes('orange') ? 'warning' : 'accent'}>
              {partTypeMap[task.partType]?.label || task.partType}
            </Tag>
            <Tag variant={statusVariant as any}>{statusInfo?.label || task.status}</Tag>
            <span className="text-sm text-neutral-500">工单ID: {task.id}</span>
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            所属项目 {task.projectNo} · 材质 {task.material} · 硬度 {task.hardness}
          </p>
        </div>
        <Button
          icon={Play}
          disabled={task.status === 'completed' || task.currentProcess >= task.processRoute.length}
          onClick={handleAdvanceProcess}
        >
          完成当前工序
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="项目编号" value={task.projectNo} icon={Layers} color="primary" />
        <StatCard title="加工机床" value={task.cncMachine || '待分配'} icon={Cpu} color="accent" />
        <StatCard title="操作员" value={task.operator || '待分配'} icon={User} color="info" />
        <StatCard
          title="工时进度"
          value={`${task.actualHours} / ${task.planHours}h`}
          icon={Clock}
          color={task.actualHours / task.planHours > 0.9 ? 'warning' : 'success'}
        />
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Hammer className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-neutral-900">工序路线进度</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500">当前工序:</span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary-50 text-primary-700 text-sm font-medium">
              {currentProcessName}
            </span>
          </div>
        </div>
        <div className="px-4">
          <Stepper steps={steps} currentStep={task.currentProcess} direction="horizontal" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="px-6 pt-4">
          <Tabs
            variant="line"
            activeTab={activeTab}
            onChange={setActiveTab}
            tabs={[
              { key: 'process', label: '工艺表', icon: FileText },
              { key: 'records', label: '工序记录', icon: Layers },
              { key: 'inspection', label: '质检记录', icon: ShieldCheck },
              { key: 'attachments', label: '附件', icon: Paperclip },
            ]}
          />
        </div>

        <div className="p-6">
          {activeTab === 'process' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-neutral-800">当前工序CNC程序信息</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-neutral-500">
                      <span className="text-neutral-400">程序号:</span>
                      <span className="font-mono font-semibold text-primary-700">
                        {task.programNo || 'PROG-2025-0618-001'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
                    <div className="text-xs text-neutral-500 mb-1">程序名</div>
                    <div className="font-mono font-semibold text-neutral-800">
                      {task.partName}_FINAL_V1.NC
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
                    <div className="text-xs text-neutral-500 mb-1">编程员</div>
                    <div className="font-semibold text-neutral-800">陈工程师</div>
                  </div>
                  <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
                    <div className="text-xs text-neutral-500 mb-1">最后修改</div>
                    <div className="font-semibold text-neutral-800">2025-06-17 16:30</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-neutral-800 mb-4">刀具清单</h3>
                <div className="overflow-hidden rounded-lg border border-neutral-200">
                  <table className="table w-full">
                    <thead>
                      <tr className="bg-neutral-50">
                        <th className="text-left">刀号</th>
                        <th className="text-left">刀具名称</th>
                        <th className="text-center">直径(mm)</th>
                        <th className="text-center">角R(mm)</th>
                        <th className="text-center">刃长(mm)</th>
                        <th className="text-left">刀柄型号</th>
                        <th className="text-center">寿命占比</th>
                      </tr>
                    </thead>
                    <tbody>
                      {toolList.map((tool) => (
                        <tr key={tool.no}>
                          <td className="font-mono font-semibold text-primary-700">{tool.no}</td>
                          <td className="text-neutral-800">{tool.name}</td>
                          <td className="text-center text-neutral-600 tabular-nums">{tool.diameter}</td>
                          <td className="text-center text-neutral-600 tabular-nums">{tool.corner}</td>
                          <td className="text-center text-neutral-600 tabular-nums">{tool.length}</td>
                          <td className="text-neutral-600 font-mono text-xs">{tool.holder}</td>
                          <td className="text-center">
                            <div className="inline-flex items-center w-20">
                              <span
                                className={`text-xs font-medium ${
                                  tool.life > 70
                                    ? 'text-success'
                                    : tool.life > 40
                                      ? 'text-warning'
                                      : 'text-danger'
                                }`}
                              >
                                {tool.life}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-neutral-800 mb-4">切削参数</h3>
                <div className="overflow-hidden rounded-lg border border-neutral-200">
                  <table className="table w-full">
                    <thead>
                      <tr className="bg-neutral-50">
                        <th className="text-left">加工阶段</th>
                        <th className="text-center">刀具</th>
                        <th className="text-right">主轴转速(rpm)</th>
                        <th className="text-right">进给率(mm/min)</th>
                        <th className="text-right">切深(mm)</th>
                        <th className="text-right">切宽(mm)</th>
                        <th className="text-center">模式</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cuttingParams.map((param) => (
                        <tr key={param.step}>
                          <td className="font-medium text-neutral-800">{param.step}</td>
                          <td className="text-center font-mono text-primary-700">{param.tool}</td>
                          <td className="text-right tabular-nums text-neutral-600">{param.spindle}</td>
                          <td className="text-right tabular-nums text-neutral-600">{param.feed}</td>
                          <td className="text-right tabular-nums text-neutral-600">{param.axial}</td>
                          <td className="text-right tabular-nums text-neutral-600">{param.radial}</td>
                          <td className="text-center">
                            <Tag variant="info">{param.speed}</Tag>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'records' && (
            <div>
              <h3 className="text-sm font-semibold text-neutral-800 mb-4">工序执行记录</h3>
              <div className="overflow-hidden rounded-lg border border-neutral-200">
                <table className="table w-full">
                  <thead>
                    <tr className="bg-neutral-50">
                      <th className="text-left">时间</th>
                      <th className="text-left">工序</th>
                      <th className="text-left">操作员</th>
                      <th className="text-left">机床</th>
                      <th className="text-right">工时(h)</th>
                      <th className="text-center">结果</th>
                      <th className="text-left">备注</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processRecords.map((rec, idx) => (
                      <tr key={idx}>
                        <td className="text-sm text-neutral-500 font-mono">{rec.time}</td>
                        <td className="font-medium text-neutral-800">{rec.process}</td>
                        <td className="text-neutral-600">{rec.operator}</td>
                        <td className="text-neutral-600">{rec.machine}</td>
                        <td className="text-right tabular-nums text-neutral-600">{rec.hours}</td>
                        <td className="text-center">
                          <Tag
                            variant={
                              rec.result === '正常' || rec.result === '合格'
                                ? 'success'
                                : rec.result === '进行中'
                                  ? 'warning'
                                  : 'danger'
                            }
                          >
                            {rec.result}
                          </Tag>
                        </td>
                        <td className="text-sm text-neutral-500">{rec.remark || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'inspection' && (
            <div>
              <h3 className="text-sm font-semibold text-neutral-800 mb-4">质量检验记录</h3>
              <div className="space-y-4">
                {inspectionRecords.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-lg border border-neutral-200 bg-white"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-neutral-900">{rec.process}</h4>
                          <Tag
                            variant={
                              rec.result === '合格'
                                ? 'success'
                                : rec.result === '条件合格'
                                  ? 'warning'
                                  : 'danger'
                            }
                          >
                            {rec.result}
                          </Tag>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">
                          {rec.time} · 质检员 {rec.inspector}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-right">
                          <div className="text-xs text-neutral-500">检测项</div>
                          <div className="font-semibold text-neutral-800 tabular-nums">{rec.items}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-success">合格</div>
                          <div className="font-semibold text-success tabular-nums">{rec.pass}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-danger">不合格</div>
                          <div className="font-semibold text-danger tabular-nums">{rec.fail}</div>
                        </div>
                      </div>
                    </div>
                    {rec.remark && (
                      <div className="pt-3 border-t border-neutral-100">
                        <div className="text-xs text-neutral-500 mb-1">备注</div>
                        <p className="text-sm text-neutral-700">{rec.remark}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'attachments' && (
            <div>
              <h3 className="text-sm font-semibold text-neutral-800 mb-4">相关附件</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {attachments.map((att, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50/30 cursor-pointer transition-all flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-neutral-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-neutral-800 truncate">{att.name}</div>
                      <div className="flex items-center gap-3 text-xs text-neutral-500 mt-0.5">
                        <span>{att.size}</span>
                        <span>·</span>
                        <span>{att.type}</span>
                        <span>·</span>
                        <span>{att.date}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CavityDetail;
